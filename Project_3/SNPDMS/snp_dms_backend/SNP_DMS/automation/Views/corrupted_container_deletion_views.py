from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
import datetime
from django.utils import timezone


from master.models import Location, Site
from depot.models import (
    ContainerAllotment,
    Container,
    ContainerStock,
    GateInHistory,
    GateOutHistory,
    Eir,
    GateOut,
    ContainerInOutRecord,
)
from billing_invoice.models import (
    CustomerBill,
    CustomerBillInvoiceLine,
)
from account.permissions import HasAllowedRoles


class InOutRegularCorruptedContainer(views.APIView):

    permission_classes = (IsAuthenticated,HasAllowedRoles)
    allowed_roles = [
       "Automation",
        "Admin",
    ]

    def adjust_lolo_bill(self, object):
        try:

            lolo_bill = CustomerBill.objects.filter(lolo_id=object.lolo.pk).first()

            if lolo_bill:
                invoice_lines = CustomerBillInvoiceLine.objects.select_related(
                    "parent"
                ).filter(bill_id=lolo_bill.pk)

                if invoice_lines.exists():
                    for each in invoice_lines:
                        each.parent.total_amount = float(
                            each.parent.total_amount
                        ) - float(each.rec_amount)
                        each.parent.save()
                        if (
                            CustomerBillInvoiceLine.objects.filter(
                                parent=each.parent
                            ).count()
                            > 1
                        ):
                            each.delete()
                        else:
                            each.parent.delete()
                lolo_bill.delete()
            return True
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found[{e}]"}, status=200)

    def adjust_st_bill(self, object):
        try:
            st_bill = CustomerBill.objects.filter(st_id=object.st.pk).first()
            if st_bill:
                invoice_lines = CustomerBillInvoiceLine.objects.select_related(
                    "parent"
                ).filter(bill_id=st_bill.pk)
                if invoice_lines.exists():
                    for each in invoice_lines:
                        each.parent.total_amount = float(
                            each.parent.total_amount
                        ) - float(each.rec_amount)
                        each.parent.save()
                        if (
                            CustomerBillInvoiceLine.objects.filter(
                                parent=each.parent
                            ).count()
                            > 1
                        ):
                            each.delete()
                        else:
                            each.parent.delete()
                st_bill.delete()

            return True
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found[{e}]"}, status=200)

    def adjust_gate_in_obj(self, gih, container):

        eir = gih.eir
        gate_in = gih.gate_in
        lolo = gih.lolo
        st = gih.st

        if gih.lolo_payment:
            gih.lolo_payment.remove_container(container=container, amount=gih.lolo.lolo_amount)
            gih.lolo_payment.save()

        if gih.st and gih.st_payment:
            gih.st_payment.remove_container(container=container, amount=gih.st.price)
            gih.st_payment.save()

        if eir:
            eir.delete()
        if gate_in:
            gate_in.delete()

        if lolo:
            self.adjust_lolo_bill(object=gih)

            if gih.lolo_payment:
                if gih.lolo_payment.container.all().count() == 0:
                    lolo_payment = gih.lolo_payment
                    lolo_payment.delete()
            lolo.delete()

        if st:
            self.adjust_st_bill(object=gih)
            if gih.st_payment:
                if gih.st_payment.container.all().count() == 0:
                    st_payment = gih.st_payment
                    st_payment.delete()
            st.delete()

        return gih

    def adjust_gate_out_obj(self, goh, container):
        eir = goh.eir
        gate_out = goh.gate_out
        lolo = goh.lolo
        st = goh.st
        if goh.lolo_payment:
            goh.lolo_payment.remove_container(container=container, amount=goh.lolo.lolo_amount)
            goh.lolo_payment.save()

        if goh.st and goh.st_payment:
            goh.st_payment.remove_container(container=container, amount=goh.st.price)
            goh.st_payment.save()


        if eir:
            eir.delete()
        if gate_out:
            gate_out.delete()
        if lolo:
            self.adjust_lolo_bill(object=goh)
            if goh.lolo_payment:
                if goh.lolo_payment.container.all().count() == 0:
                    lolo_payment = goh.lolo_payment
                    lolo_payment.delete()
            lolo.delete()

        if st:
            self.adjust_st_bill(object=goh)
            if goh.st_payment:
                if goh.st_payment.container.all().count() == 0:
                    st_payment = goh.st_payment
                    st_payment.delete()
            st.delete()

        return goh

    def post(self, request, *args, **kwargs):
        try:

            data = request.data
            container_no = data["container_no"]
            method = data["method"]
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            movement = data["movement"]
            container = Container.objects.get(
                container_no=container_no, location=location, site=site
            )
            if method == "Corrupted Container":
                if movement == "IN":
                    gate_in_history = GateInHistory.objects.filter(
                        container=container,
                    )

                    if gate_in_history.exists():
                        date = [
                            x.date.astimezone(timezone.get_current_timezone())
                            .date()
                            .strftime("%Y-%m-%d")
                            for x in gate_in_history
                        ]

                        return Response(
                            {
                                "container_no": container.container_no,
                                "date": date,
                            },
                            status=200,
                        )

                    container.delete()
                    return Response(
                        {"successMsg": "Container Deleted Succesfully"}, status=200
                    )
                elif movement == "OUT":
                    if GateOut.objects.filter(
                        container=container, is_verified=None
                    ).exists():
                        gate_out = GateOut.objects.filter(
                            container=container, is_verified=None
                        ).latest("pk")
                        container_stock = ContainerStock.objects.get(
                            container=container, gate_out=gate_out
                        )
                        container_stock.container_status = "IN"
                        container_stock.gate_out = None
                        container_stock.save()
                        gate_out.delete()

                    if Eir.objects.filter(
                        container=container, entry_type="OUT", is_verified=None
                    ).exists():
                        eir = Eir.objects.filter(
                            container=container, entry_type="OUT", is_verified=None
                        ).latest("pk")
                        eir.delete()
                    container.status = "IN"
                    container.save()
                    return Response(
                        {"successMsg": "OUT Container Cleaned Succesfully"}, status=200
                    )
                else:
                    return Response({"errorMsg": "please select movement"}, status=200)

            elif method == "Regular Container":
                date = datetime.datetime.strptime(data["date"], "%Y-%m-%d").date()
                if movement == "IN":
                    gih = GateInHistory.objects.get(
                        gate_in__in_date=date, container=container
                    )

                    if GateInHistory.objects.filter(container=container).count() > 1:
                        container.status = "OUT"
                        container.save()
                        
                    self.adjust_gate_in_obj(gih, container)
                    container.delete()
                    return Response(
                        {"successMsg": "Deleted In Container Data"}, status=200
                    )
                elif movement == "OUT":
                    container.status = "IN"
                    container.save()
                    goh = GateOutHistory.objects.get(
                        gate_out__out_date=date, container=container
                    )
                    stock = ContainerStock.objects.get(
                        container=container, gate_out=goh.gate_out
                    )
                    gih = GateInHistory.objects.get(gate_in=stock.gate_in)
                    stock.container_status = "IN"
                    stock.gate_out = None
                    stock.status = "Estimate Pending"
                    stock.stage = "Estimate"
                    stock.save()
                    if stock.booking_no is not None:
                        allotment = ContainerAllotment.objects.get(
                            booking_no=stock.booking_no
                        )
                        if container in allotment.container.all():
                            allotment.remove_container(container)
                        stock.booking_no = None
                        stock.save()
                    in_out_record = ContainerInOutRecord.objects.get(
                        in_data=gih, out_data=goh
                    )
                    in_out_record.out_data = None
                    in_out_record.save()
                    self.adjust_gate_out_obj(goh, container)

                    for each in container.container_alloted_rel.all():
                        if container in each.container.all():
                            each.remove_container(container)
                    return Response(
                        {"successMsg": "Deleted Out Container Data"}, status=200
                    )
                else:
                    return Response({"errorMsg": "please select movement"}, status=200)
            else:
                return Response({"errorMsg": "please select method"}, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found[{e}]"}, status=200)
