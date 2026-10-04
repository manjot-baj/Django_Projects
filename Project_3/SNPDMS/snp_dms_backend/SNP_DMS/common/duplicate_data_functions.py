from django.db.models import Count, Q
from depot.models import (
    Container,
    GateIn,
    GateOut,
    ContainerStock,
    GateInHistory,
    GateOutHistory,
    ContainerAllotment,
    ContainerInOutRecord,
)
from non_depot.models import (
    NonDepotContainer,
    NonDepotGateIn,
    NonDepotGateOut,
    NonDepotContainerStock,
    NonDepotContainerInOutRecord,
)
from mnr.models import Survey, Estimate, Approval, Repair
from billing_invoice.models import (
    CustomerBill,
    CustomerBillInvoiceLine,
)
import traceback


def get_dup_depot_container_data():
    try:
        duplicates = (
            Container.objects.values(
                "container_no", "type", "size", "manufacturing_date", "location", "site"
            )
            .annotate(count=Count("id"))
            .filter(count__gt=1)
        )
        query = Q()
        for d in duplicates:
            query |= Q(
                container_no=d["container_no"],
                type=d["type"],
                size=d["size"],
                manufacturing_date=d["manufacturing_date"],
                location=d["location"],
                site=d["site"],
            )
        if query:
            return Container.objects.filter(query)
        return "No Duplicate Records"

    except Exception:
        return traceback.format_exc()


def get_dup_depot_gate_in_data():
    try:
        duplicates = (
            GateIn.objects.values("container", "in_date", "in_time")
            .annotate(count=Count("id"))
            .filter(count__gt=1)
        )

        query = Q()
        for d in duplicates:
            query |= Q(
                container=d["container"],
                in_date=d["in_date"],
                in_time=d["in_time"],
            )
        if query:
            return GateIn.objects.filter(query)
        return "No Duplicate Records"

    except Exception:
        return traceback.format_exc()


def get_dup_depot_gate_out_data():
    try:
        duplicates = (
            GateOut.objects.values("container", "out_date", "out_time")
            .annotate(count=Count("id"))
            .filter(count__gt=1)
        )

        query = Q()
        for d in duplicates:
            query |= Q(
                container=d["container"],
                out_date=d["out_date"],
                out_time=d["out_time"],
            )
        if query:
            return GateOut.objects.filter(query)
        return "No Duplicate Records"

    except Exception:
        return traceback.format_exc()


def get_dup_depot_stock_data():
    try:
        duplicates = (
            ContainerStock.objects.values("container", "gate_in")
            .annotate(count=Count("id"))
            .filter(count__gt=1)
        )

        query = Q()
        for d in duplicates:
            query |= Q(
                container=d["container"],
                gate_in=d["gate_in"],
            )

        if query:
            return ContainerStock.objects.filter(query)
        return "No Duplicate Records"

    except Exception:
        return traceback.format_exc()


def get_dup_non_depot_container_data():
    try:
        duplicates = (
            NonDepotContainer.objects.values(
                "container_no", "type", "size", "manufacturing_date", "location", "site"
            )
            .annotate(count=Count("id"))
            .filter(count__gt=1)
        )

        query = Q()
        for d in duplicates:
            query |= Q(
                container_no=d["container_no"],
                manufacturing_date=d["manufacturing_date"],
                type=d["type"],
                size=d["size"],
                location=d["location"],
                site=d["site"],
            )

        if query:
            return NonDepotContainer.objects.filter(query)
        return "No Duplicate Records"

    except Exception:
        return traceback.format_exc()


def get_dup_non_depot_gate_in_data():
    try:
        duplicates = (
            NonDepotGateIn.objects.values("container", "in_date", "in_time")
            .annotate(count=Count("id"))
            .filter(count__gt=1)
        )

        query = Q()
        for d in duplicates:
            query |= Q(
                container=d["container"],
                in_date=d["in_date"],
                in_time=d["in_time"],
            )
        if query:
            return NonDepotGateIn.objects.filter(query)
        return "No Duplicate Records"

    except Exception:
        return traceback.format_exc()


def get_dup_non_depot_gate_out_data():
    try:
        duplicates = (
            NonDepotGateOut.objects.values("container", "out_date", "out_time")
            .annotate(count=Count("id"))
            .filter(count__gt=1)
        )

        query = Q()
        for d in duplicates:
            query |= Q(
                container=d["container"],
                out_date=d["out_date"],
                out_time=d["out_time"],
            )

        if query:
            return NonDepotGateOut.objects.filter(query)
        return "No Duplicate Records"

    except Exception:
        return traceback.format_exc()


def get_dup_non_depot_stock_data():
    try:
        duplicates = (
            NonDepotContainerStock.objects.values("container", "gate_in")
            .annotate(count=Count("id"))
            .filter(count__gt=1)
        )

        query = Q()
        for d in duplicates:
            query |= Q(
                container=d["container"],
                gate_in=d["gate_in"],
            )

        if query:
            return NonDepotContainerStock.objects.filter(query)
        return "No Duplicate Records"

    except Exception:
        return traceback.format_exc()


def get_dup_depot_survey_data():
    try:
        duplicate = (
            Survey.objects.values("depot")
            .annotate(count=Count("id"))
            .filter(count__gt=1, depot__isnull=False)
            .values_list("depot", flat=True)
        )
        if duplicate:
            return Survey.objects.filter(depot__in=duplicate)
        return "No Duplicate Records"

    except Exception:
        return traceback.format_exc()


def get_dup_non_depot_survey_data():
    try:
        duplicate = (
            Survey.objects.values("non_depot")
            .annotate(count=Count("id"))
            .filter(count__gt=1, non_depot__isnull=False)
            .values_list("non_depot", flat=True)
        )

        if duplicate:
            return Survey.objects.filter(non_depot__in=duplicate)
        return "No Duplicate Records"

    except Exception:
        return traceback.format_exc()


def get_dup_estimate_data():
    try:
        duplicate = (
            Estimate.objects.values("parent")
            .annotate(count=Count("id"))
            .filter(count__gt=1)
            .values_list("parent", flat=True)
        )
        if duplicate:
            return Estimate.objects.filter(parent__in=duplicate)
        return "No Duplicate Records"
    except Exception:
        return traceback.format_exc()


def get_dup_approval_data():
    try:
        duplicate = (
            Approval.objects.values("parent")
            .annotate(count=Count("id"))
            .filter(count__gt=1)
            .values_list("parent", flat=True)
        )
        if duplicate:
            return Approval.objects.filter(parent__in=duplicate)
        return "No Duplicate Records"
    except Exception:
        return traceback.format_exc()


def get_dup_repair_data():
    try:
        duplicate = (
            Repair.objects.values("parent")
            .annotate(count=Count("id"))
            .filter(count__gt=1)
            .values_list("parent", flat=True)
        )
        if duplicate:
            return Repair.objects.filter(parent__in=duplicate)
        return "No Duplicate Records"
    except Exception:
        return traceback.format_exc()


def adjust_lolo_bill(object):
    try:

        lolo_bill = CustomerBill.objects.filter(lolo_id=object.lolo.pk).first()

        if lolo_bill:
            invoice_lines = CustomerBillInvoiceLine.objects.select_related(
                "parent"
            ).filter(bill_id=lolo_bill.pk)

            if invoice_lines.exists():
                for each in invoice_lines:
                    each.parent.total_amount = float(each.parent.total_amount) - float(
                        each.rec_amount
                    )
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
        print(traceback.format_exc())
        return traceback.format_exc()


def adjust_st_bill(object):
    try:
        st_bill = CustomerBill.objects.filter(st_id=object.st.pk).first()
        if st_bill:
            invoice_lines = CustomerBillInvoiceLine.objects.select_related(
                "parent"
            ).filter(bill_id=st_bill.pk)
            if invoice_lines.exists():
                for each in invoice_lines:
                    each.parent.total_amount = float(each.parent.total_amount) - float(
                        each.rec_amount
                    )
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
        print(traceback.format_exc())
        return traceback.format_exc()


def adjust_gate_in_obj(gih, container):
    try:

        eir = gih.eir
        gate_in = gih.gate_in
        lolo = gih.lolo
        st = gih.st

        if gih.lolo_payment:
            gih.lolo_payment.remove_container(
                container=container, amount=gih.lolo.lolo_amount
            )
            gih.lolo_payment.save()

        if gih.st and gih.st_payment:
            gih.st_payment.remove_container(container=container, amount=gih.st.price)
            gih.st_payment.save()

        if eir:
            eir.delete()
        if gate_in:
            gate_in.delete()

        if lolo:
            adjust_lolo_bill(object=gih)

            if gih.lolo_payment:
                if gih.lolo_payment.container.all().count() == 0:
                    lolo_payment = gih.lolo_payment
                    lolo_payment.delete()
            lolo.delete()

        if st:
            adjust_st_bill(object=gih)
            if gih.st_payment:
                if gih.st_payment.container.all().count() == 0:
                    st_payment = gih.st_payment
                    st_payment.delete()
            st.delete()

        return True
    except Exception as e:
        print(traceback.format_exc())
        return traceback.format_exc()


def adjust_gate_out_obj(goh, container):
    try:
        eir = goh.eir
        gate_out = goh.gate_out
        lolo = goh.lolo
        st = goh.st
        if goh.lolo_payment:
            goh.lolo_payment.remove_container(
                container=container, amount=goh.lolo.lolo_amount
            )
            goh.lolo_payment.save()

        if goh.st and goh.st_payment:
            goh.st_payment.remove_container(container=container, amount=goh.st.price)
            goh.st_payment.save()

        if eir:
            eir.delete()
        if gate_out:
            gate_out.delete()
        if lolo:
            adjust_lolo_bill(object=goh)
            if goh.lolo_payment:
                if goh.lolo_payment.container.all().count() == 0:
                    lolo_payment = goh.lolo_payment
                    lolo_payment.delete()
            lolo.delete()

        if st:
            adjust_st_bill(object=goh)
            if goh.st_payment:
                if goh.st_payment.container.all().count() == 0:
                    st_payment = goh.st_payment
                    st_payment.delete()
            st.delete()

        return True
    except Exception as e:
        print(traceback.format_exc())
        return traceback.format_exc()


def safe_delete_depot_gate_in(obj):
    try:
        if not ContainerStock.objects.filter(gate_in=obj, gate_out=None).exists():
            stock = ContainerStock.objects.filter(gate_in=obj).first()
            gih = GateInHistory.objects.filter(gate_in=obj).first()
            gate_out = stock.gate_out
            goh = GateOutHistory.objects.filter(gate_out=gate_out).first()

            stock.gate_out = None
            stock.save()

            if stock.booking_no is not None:
                allotment = ContainerAllotment.objects.filter(
                    booking_no=stock.booking_no
                ).first()
                if obj.container in allotment.container.all():
                    allotment.remove_container(obj.container)
                stock.booking_no = None
                stock.save()

            in_out_record = ContainerInOutRecord.objects.filter(
                in_data=gih, out_data=goh
            ).first()
            in_out_record.out_data = None
            in_out_record.save()

            adjust_gate_out_obj(goh, goh.container)
            adjust_gate_in_obj(gih, gih.container)

        else:
            stock = ContainerStock.objects.filter(gate_in=obj).first()
            gih = GateInHistory.objects.filter(gate_in=obj).first()
            adjust_gate_in_obj(gih, gih.container)
    except Exception as e:
        print(traceback.format_exc())
        return traceback.format_exc()


def del_dup_depot_gate_in_data(qs):
    try:
        print("--> Started...")

        grouped_by_container = {}
        for obj in qs:
            key = obj.container.container_no
            grouped_by_container.setdefault(key, []).append(obj)
        print("--> grouped_by_container Done...")

        def can_be_deleted(obj):
            stock = ContainerStock.objects.filter(gate_in=obj).first()
            if not Survey.objects.filter(depot=stock).exists():
                return True
            return False

        print("--> Starting the delete Process...")
        count = 0
        total = len(grouped_by_container)
        for each_key in grouped_by_container:
            count = count + 1
            obj_list = grouped_by_container[each_key]
            print(f"--> Working on {each_key} = {obj_list} ...")

            deletable_obj_list = [obj for obj in obj_list if can_be_deleted(obj)]
            print(f"--> Deletable list - {each_key} = {deletable_obj_list} ...")

            if (len(deletable_obj_list) == len(obj_list)) or (
                len(deletable_obj_list) == 0 and len(obj_list) > 1
            ):
                print(
                    f"--> Deletable list is same as main list \nor Deletable list is empty and Obj list is more than 1..."
                )

                latest_obj = max(obj_list, key=lambda x: x.pk)
                print(f"--> Deleting all Deletable list items except with Latest ID...")
                print(f"--> Duplicate Deletion in progress for {each_key}...")

                for each_obj in obj_list:
                    if each_obj.pk != latest_obj.pk:
                        safe_delete_depot_gate_in(each_obj)
                print(f"--> Duplicate Deletion Complete for {each_key}...")
                print(f"--> {count} of {total} Done...")

            else:
                print(f"--> Duplicate Deletion in progress for {each_key}...")
                for each_obj in deletable_obj_list:
                    safe_delete_depot_gate_in(each_obj)
                print(f"--> Duplicate Deletion Complete for {each_key}...")
                print(f"--> {count} of {total} Done...")

        return "All Duplicate Data Deleted"
    except Exception:
        return traceback.format_exc()


def safe_delete_non_depot_gate_in(obj):
    try:
        if not NonDepotContainerStock.objects.filter(
            gate_in=obj, gate_out=None
        ).exists():
            stock = NonDepotContainerStock.objects.filter(gate_in=obj).first()
            gate_out = stock.gate_out
            stock.gate_out = None
            stock.save()
            in_out_record = NonDepotContainerInOutRecord.objects.filter(
                gate_in=obj
            ).first()
            in_out_record.gate_out = None
            in_out_record.save()
            gate_out.delete()
            obj.delete()
        else:
            obj.delete()
    except Exception as e:
        print(traceback.format_exc())
        return traceback.format_exc()


def del_dup_non_depot_gate_in_data(qs):
    try:
        print("--> Started...")

        grouped_by_container = {}
        for obj in qs:
            key = obj.container.container_no
            grouped_by_container.setdefault(key, []).append(obj)
        print("--> grouped_by_container Done...")

        def can_be_deleted(obj):
            stock = NonDepotContainerStock.objects.filter(gate_in=obj).first()
            if not Survey.objects.filter(non_depot=stock).exists():
                return True
            return False

        print("--> Starting the delete Process...")
        count = 0
        total = len(grouped_by_container)
        for each_key in grouped_by_container:
            count = count + 1
            obj_list = grouped_by_container[each_key]
            print(f"--> Working on {each_key} = {obj_list} ...")

            deletable_obj_list = [obj for obj in obj_list if can_be_deleted(obj)]
            print(f"--> Deletable list - {each_key} = {deletable_obj_list} ...")

            if (len(deletable_obj_list) == len(obj_list)) or (
                len(deletable_obj_list) == 0 and len(obj_list) > 1
            ):
                print(
                    f"--> Deletable list is same as main list \nor Deletable list is empty and Obj list is more than 1..."
                )

                latest_obj = max(obj_list, key=lambda x: x.pk)
                print(f"--> Deleting all Deletable list items except with Latest ID...")
                print(f"--> Duplicate Deletion in progress for {each_key}...")

                for each_obj in obj_list:
                    if each_obj.pk != latest_obj.pk:
                        safe_delete_non_depot_gate_in(each_obj)
                print(f"--> Duplicate Deletion Complete for {each_key}...")
                print(f"--> {count} of {total} Done...")

            else:
                print(f"--> Duplicate Deletion in progress for {each_key}...")
                for each_obj in deletable_obj_list:
                    safe_delete_non_depot_gate_in(each_obj)
                print(f"--> Duplicate Deletion Complete for {each_key}...")
                print(f"--> {count} of {total} Done...")

        return "All Duplicate Data Deleted"
    except Exception:
        return traceback.format_exc()


def del_dup_repair_data(qs):
    try:
        print("--> Started...")

        grouped_by_parent = {}
        for obj in qs:
            key = obj.parent.id
            grouped_by_parent.setdefault(key, []).append(obj)
        print("--> grouped_by_parent Done...")

        print("--> Starting the delete Process...")
        count = 0
        total = len(grouped_by_parent)
        for each_key in grouped_by_parent:
            count = count + 1
            obj_list = grouped_by_parent[each_key]
            print(f"--> Working on {each_key} = {obj_list} ...")

            latest_obj = max(obj_list, key=lambda x: x.pk)
            print(f"--> Deleting all list items except with Latest ID...")
            print(f"--> Duplicate Deletion in progress for {each_key}...")

            for each_obj in obj_list:
                if each_obj.pk != latest_obj.pk:
                    each_obj.delete()
            print(f"--> Duplicate Deletion Complete for {each_key}...")
            print(f"--> {count} of {total} Done...")

        return "All Duplicate Data Deleted"
    except Exception:
        return traceback.format_exc()


def del_dup_approval_data(qs):
    try:
        print("--> Started...")

        grouped_by_parent = {}
        for obj in qs:
            key = obj.parent.id
            grouped_by_parent.setdefault(key, []).append(obj)
        print("--> grouped_by_parent Done...")

        print("--> Starting the delete Process...")
        count = 0
        total = len(grouped_by_parent)
        for each_key in grouped_by_parent:
            count = count + 1
            obj_list = grouped_by_parent[each_key]
            print(f"--> Working on {each_key} = {obj_list} ...")

            latest_obj = max(obj_list, key=lambda x: x.pk)
            print(f"--> Deleting all list items except with Latest ID...")
            print(f"--> Duplicate Deletion in progress for {each_key}...")

            for each_obj in obj_list:
                if each_obj.pk != latest_obj.pk:
                    each_obj.delete()
            print(f"--> Duplicate Deletion Complete for {each_key}...")
            print(f"--> {count} of {total} Done...")

        return "All Duplicate Data Deleted"
    except Exception:
        return traceback.format_exc()


def del_dup_estimate_data(qs):
    try:
        print("--> Started...")

        grouped_by_parent = {}
        for obj in qs:
            key = obj.parent.id
            grouped_by_parent.setdefault(key, []).append(obj)
        print("--> grouped_by_parent Done...")

        def can_be_deleted(obj):
            return Approval.objects.filter(parent=obj).exists()

        print("--> Starting the delete Process...")
        count = 0
        total = len(grouped_by_parent)
        for each_key in grouped_by_parent:
            count = count + 1
            obj_list = grouped_by_parent[each_key]
            print(f"--> Working on {each_key} = {obj_list} ...")

            deletable_obj_list = [obj for obj in obj_list if can_be_deleted(obj)]
            print(f"--> Deletable list - {each_key} = {deletable_obj_list} ...")

            if (len(deletable_obj_list) == len(obj_list)) or (
                len(deletable_obj_list) == 0 and len(obj_list) > 1
            ):
                print(
                    f"--> Deletable list is same as main list \nor Deletable list is empty and Obj list is more than 1..."
                )

                latest_obj = max(obj_list, key=lambda x: x.pk)
                print(f"--> Deleting all Deletable list items except with Latest ID...")
                print(f"--> Duplicate Deletion in progress for {each_key}...")

                for each_obj in obj_list:
                    if each_obj.pk != latest_obj.pk:
                        each_obj.delete()
                print(f"--> Duplicate Deletion Complete for {each_key}...")
                print(f"--> {count} of {total} Done...")

            else:
                print(f"--> Duplicate Deletion in progress for {each_key}...")
                for each_obj in deletable_obj_list:
                    each_obj.delete()
                print(f"--> Duplicate Deletion Complete for {each_key}...")
                print(f"--> {count} of {total} Done...")

        return "All Duplicate Data Deleted"
    except Exception:
        return traceback.format_exc()


def del_dup_depot_survey_data(qs):
    try:
        print("--> Started...")

        grouped_by_container = {}
        for obj in qs:
            key = obj.depot.container.container_no
            grouped_by_container.setdefault(key, []).append(obj)
        print("--> grouped_by_container Done...")

        def can_be_deleted(obj):
            return Estimate.objects.filter(parent=obj).exists()

        print("--> Starting the delete Process...")
        count = 0
        total = len(grouped_by_container)
        for each_key in grouped_by_container:
            count = count + 1
            obj_list = grouped_by_container[each_key]
            print(f"--> Working on {each_key} = {obj_list} ...")

            deletable_obj_list = [obj for obj in obj_list if can_be_deleted(obj)]
            print(f"--> Deletable list - {each_key} = {deletable_obj_list} ...")

            if (len(deletable_obj_list) == len(obj_list)) or (
                len(deletable_obj_list) == 0 and len(obj_list) > 1
            ):
                print(
                    f"--> Deletable list is same as main list \nor Deletable list is empty and Obj list is more than 1..."
                )

                latest_obj = max(obj_list, key=lambda x: x.pk)
                print(f"--> Deleting all Deletable list items except with Latest ID...")
                print(f"--> Duplicate Deletion in progress for {each_key}...")

                for each_obj in obj_list:
                    if each_obj.pk != latest_obj.pk:
                        each_obj.delete()
                print(f"--> Duplicate Deletion Complete for {each_key}...")
                print(f"--> {count} of {total} Done...")

            else:
                print(f"--> Duplicate Deletion in progress for {each_key}...")
                for each_obj in deletable_obj_list:
                    each_obj.delete()
                print(f"--> Duplicate Deletion Complete for {each_key}...")
                print(f"--> {count} of {total} Done...")

        return "All Duplicate Data Deleted"
    except Exception:
        return traceback.format_exc()


def del_dup_non_depot_survey_data(qs):
    try:
        print("--> Started...")

        grouped_by_container = {}
        for obj in qs:
            key = obj.non_depot.container.container_no
            grouped_by_container.setdefault(key, []).append(obj)
        print("--> grouped_by_container Done...")

        def can_be_deleted(obj):
            return Estimate.objects.filter(parent=obj).exists()

        print("--> Starting the delete Process...")
        count = 0
        total = len(grouped_by_container)
        for each_key in grouped_by_container:
            count = count + 1
            obj_list = grouped_by_container[each_key]
            print(f"--> Working on {each_key} = {obj_list} ...")

            deletable_obj_list = [obj for obj in obj_list if can_be_deleted(obj)]
            print(f"--> Deletable list - {each_key} = {deletable_obj_list} ...")

            if (len(deletable_obj_list) == len(obj_list)) or (
                len(deletable_obj_list) == 0 and len(obj_list) > 1
            ):
                print(
                    f"--> Deletable list is same as main list \nor Deletable list is empty and Obj list is more than 1..."
                )

                latest_obj = max(obj_list, key=lambda x: x.pk)
                print(f"--> Deleting all Deletable list items except with Latest ID...")
                print(f"--> Duplicate Deletion in progress for {each_key}...")

                for each_obj in obj_list:
                    if each_obj.pk != latest_obj.pk:
                        each_obj.delete()
                print(f"--> Duplicate Deletion Complete for {each_key}...")
                print(f"--> {count} of {total} Done...")

            else:
                print(f"--> Duplicate Deletion in progress for {each_key}...")
                for each_obj in deletable_obj_list:
                    each_obj.delete()
                print(f"--> Duplicate Deletion Complete for {each_key}...")
                print(f"--> {count} of {total} Done...")

        return "All Duplicate Data Deleted"
    except Exception:
        return traceback.format_exc()
