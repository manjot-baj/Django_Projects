# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
import datetime
from django.utils import timezone
from transportation.functions import get_fiscal_year_date
from num2words import num2words

# models imports
from master.models import Location, Site
from transportation.models import (
    BookingMaster,
    InvoiceBill,
    InvoiceBillLine,
    CustomerMaster,
    BookingBillLine,
    BookingBill,
    PaymentReceiptLine,
    TransactionLog,
)
from account.permissions import HasAllowedRoles

class AddInvoiceBill(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def empty_str_to_none(self, items):
        return {
            each: None if len(str(items[each])) == 0 else str(items[each])
            for each in items
        }

    def validate_data(self, data):
        try:
            mandatory_list = [
                "booking_type",
                "bill_no",
                "bill_type",
                "bill_date",
                "customer",
                "state",
                "state_code",
                "total_amount" "location",
                "site",
            ]
            if not (data.keys() & mandatory_list):
                return {"errorMsg": "Please Provide Main Mandatory Data"}

            if len(data["bill_type"]) == 0:
                return {"errorMsg": "Please Provide Bill Type"}
            if len(data["bill_date"]) == 0:
                return {"errorMsg": "Please Bill Date Entry Date"}
            if len(data["total_amount"]) == 0:
                return {"errorMsg": "Please Provide Total Amount"}
            if len(data["state"]) == 0:
                return {"errorMsg": "Please Provicde State"}
            if len(data["state_code"]) == 0:
                return {"errorMsg": "Please Provicde State Code"}

            if (
                not Location.objects.filter(name=data["location"]).exists()
                or not Site.objects.filter(name=data["site"]).exists()
            ):
                return {"errorMsg": "Please provide correct location or site"}

            if not CustomerMaster.objects.filter(
                name=data["customer"],
                location__name=data["location"],
                site__name=data["site"],
            ).exists():
                return {"errorMsg": "Customer Does not Exist"}

            return data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_invoice_line_data(self, data, location, site):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["lr_no"],
                converted_data["particular"],
                converted_data["services"],
                converted_data["sac_code"],
                converted_data["under_rcm"],
                converted_data["freight_amount"],
                converted_data["gst_rate"],
                converted_data["total_amount"],
            ]
            if None in mandatory_list:
                return {"errorMsg": "Please Provide Invoice Line Mandatory Data"}

            if not BookingMaster.objects.filter(
                lr_no=converted_data["lr_no"],
                location=location,
                site=site,
            ).exists():
                return {"errorMsg": "Booking Does not exist"}

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = self.validate_data(request.data)
            created_at = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            if "errorMsg" in data.keys():
                return Response(data, status=200)

            booking_type = data["booking_type"]
            bill_no = data["bill_no"]
            f_year_start, f_year_end = get_fiscal_year_date()
            financial_year = (
                f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            )
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            if InvoiceBill.checkEntryNo(bill_no, financial_year, location, site):
                return Response({"errorMsg": "Data Already exists"}, status=200)
            bill_type = data["bill_type"]
            bill_date = datetime.datetime.strptime(data["bill_date"], "%Y-%m-%d").date()
            customer = CustomerMaster.objects.get(
                name=data["customer"],
                location__name=data["location"],
                site__name=data["site"],
            )
            address = data["address"]
            state = data["state"]
            state_code = data["state_code"]
            gst_no = data["gst_no"]
            pan_no = data["pan_no"]
            company_account = data["company_account"]
            total_amount_without_tax = float(0)
            if data["total_amount_without_tax"] is not None:
                total_amount_without_tax = float(data["total_amount_without_tax"])
            total_amount = float(0)
            if data["total_amount"] is not None:
                total_amount = float(data["total_amount"])
            due_total_amount = float(0)
            if data["due_total_amount"] is not None:
                due_total_amount = float(data["due_total_amount"])

            validated_invoice_line = None
            for each in data["invoice_line"]:
                if not data["invoice_line"][each]["is_invoiced"]:
                    for each_one in data["invoice_line"][each]["lines"]:
                        validated_invoice_line = self.validate_invoice_line_data(
                            data=each_one, location=location, site=site
                        )
                        if "errorMsg" in validated_invoice_line.keys():
                            return Response(each, status=200)
                        else:
                            continue

            invoice_bill = InvoiceBill.create(
                booking_type=booking_type,
                bill_no=bill_no,
                financial_year=financial_year,
                bill_type=bill_type,
                bill_date=bill_date,
                customer=customer,
                address=address,
                state=state,
                state_code=state_code,
                gst_no=gst_no,
                pan_no=pan_no,
                company_account=company_account,
                total_amount_without_tax=total_amount_without_tax,
                sgst_amount=float(0),
                cgst_amount=float(0),
                igst_amount=float(0),
                total_amount=total_amount,
                due_total_amount=due_total_amount,
                location=location,
                site=site,
            )
            invoice_bill.save()
            invoice_bill.save()

            total_freight_amount = float(0)
            total_amount_with_tax = float(0)
            total_igst_amount = float(0)
            total_cgst_amount = float(0)
            total_sgst_amount = float(0)
            # total_due_amount = float(0)
            # Invoice Line
            for each in data["invoice_line"]:
                if not data["invoice_line"][each]["is_invoiced"]:
                    for line in data["invoice_line"][each]["lines"]:
                        booking = BookingMaster.objects.get(pk=each)
                        booking.is_invoiced = True
                        booking.invoice_id = invoice_bill.pk
                        booking.save()
                        particulars = line["particular"]
                        services = line["services"]
                        sac_code = line["sac_code"]
                        under_rcm = line["under_rcm"]
                        freight_amount = float(line["freight_amount"])
                        gst_rate = line["gst_rate"]
                        total_amount_line = float(line["total_amount"])

                        if not site.state == state:
                            sgst_amount_line = float(0)
                            cgst_amount_line = float(0)
                            igst_amount_line = total_amount_line - freight_amount
                        else:
                            sgst_amount_line = float(
                                (total_amount_line - freight_amount) / float(2)
                            )
                            cgst_amount_line = float(
                                (total_amount_line - freight_amount) / float(2)
                            )
                            igst_amount_line = float(0)

                        total_freight_amount += freight_amount
                        total_amount_with_tax += total_amount_line

                        total_igst_amount += igst_amount_line
                        total_cgst_amount += cgst_amount_line
                        total_sgst_amount += sgst_amount_line

                        invoice_line = InvoiceBillLine.create(
                            parent=invoice_bill,
                            booking=booking,
                            particulars=particulars,
                            services=services,
                            sac_code=sac_code,
                            under_rcm=under_rcm,
                            freight_amount=freight_amount,
                            gst_rate=gst_rate,
                            sgst_amount=sgst_amount_line,
                            cgst_amount=cgst_amount_line,
                            igst_amount=igst_amount_line,
                            total_amount=total_amount_line,
                        )
                        invoice_line.save()
                        # total_due_amount += total_amount_line
            logs = TransactionLog.create(
                created_at=created_at,
                date=bill_date,
                vch_no=bill_no,
                vch_type="INVOICE",
                particular=None,
                creditor=None,
                customer=customer,
                effect_on=None,
                transaction_type="Debit",
                transaction_method=None,
                booking_id=None,
                invoice_id=invoice_bill.pk,
                payment_receipt_id=None,
                contra_id=None,
                journal_id=None,
                amount=total_amount,
                location=location,
                site=site,
            )
            logs.save()
            invoice_bill.total_amount_without_tax = total_freight_amount
            invoice_bill.total_amount = total_amount_with_tax
            invoice_bill.igst_amount = total_igst_amount
            invoice_bill.cgst_amount = total_cgst_amount
            invoice_bill.sgst_amount = total_sgst_amount
            # invoice_bill.due_total_amount = float(total_due_amount)
            invoice_bill.amount_in_words = str(
                num2words(round(total_amount_with_tax))
            ).upper()
            invoice_bill.save()
            return Response(
                {"successMsg": "Data Saved", "pk": invoice_bill.pk}, status=200
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetAllInvoiceBill(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            location = data["location"]
            site = data["site"]
            bill_no = data["bill_no"]
            customer = data["customer"]
            from_date = data["from_date"]
            to_date = data["to_date"]

            if location == "ALL":
                filtered_data = InvoiceBill.objects.select_related("location", "site")
            elif site == "ALL":
                filtered_data = InvoiceBill.objects.select_related(
                    "location", "site"
                ).filter(location__name=location)
            else:
                filtered_data = InvoiceBill.objects.select_related(
                    "location", "site"
                ).filter(location__name=location, site__name=site)

            if not len(bill_no) == 0:
                filtered_data = filtered_data.filter(bill_no=bill_no)

            if not len(customer) == 0:
                filtered_data = filtered_data.filter(customer=customer)

            if not len(from_date) == 0 and not len(to_date) == 0:
                from_date = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
                filtered_data = filtered_data.filter(
                    bill_date__range=(from_date, to_date)
                )

            response_data = [each.get_invoice_bill() for each in filtered_data]
            return Response({"data": response_data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class EditInvoiceBill(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def empty_str_to_none(self, items):
        return {
            each: None if len(str(items[each])) == 0 else str(items[each])
            for each in items
        }

    def validate_data(self, data):
        try:
            mandatory_list = [
                "booking_type",
                "bill_type",
                "bill_date",
                "customer",
                "state",
                "state_code",
                "total_amount" "location",
                "site",
            ]
            if not (data.keys() & mandatory_list):
                return {"errorMsg": "Please Provide Main Mandatory Data"}

            if len(data["bill_type"]) == 0:
                return {"errorMsg": "Please Provide Bill Type"}
            if len(data["bill_date"]) == 0:
                return {"errorMsg": "Please Bill Date Entry Date"}
            if len(data["total_amount"]) == 0:
                return {"errorMsg": "Please Provide Total Amount"}
            if len(data["state"]) == 0:
                return {"errorMsg": "Please Provicde State"}
            if len(data["state_code"]) == 0:
                return {"errorMsg": "Please Provicde State Code"}

            if (
                not Location.objects.filter(name=data["location"]).exists()
                or not Site.objects.filter(name=data["site"]).exists()
            ):
                return {"errorMsg": "Please provide correct location or site"}

            if not CustomerMaster.objects.filter(
                name=data["customer"],
                location__name=data["location"],
                site__name=data["site"],
            ).exists():
                return {"errorMsg": "Customer Does not Exist"}

            return data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_invoice_line_data(self, data, location, site):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["lr_no"],
                converted_data["particular"],
                converted_data["services"],
                converted_data["sac_code"],
                converted_data["under_rcm"],
                converted_data["freight_amount"],
                converted_data["gst_rate"],
                converted_data["total_amount"],
            ]
            if None in mandatory_list:
                return {"errorMsg": "Please Provide Invoice Line Mandatory Data"}

            if not BookingMaster.objects.filter(
                lr_no=converted_data["lr_no"],
                location=location,
                site=site,
            ).exists():
                return {"errorMsg": "Booking Does not exist"}

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def get(self, request, pk, *args, **kwargs):
        try:
            invoice_obj = InvoiceBill.objects.get(pk=pk)
            bkg = BookingMaster.objects.filter(invoice_id=pk)
            data = invoice_obj.get_invoice_bill()

            invoice_line = {
                bk.pk: {
                    "lr_no": bk.lr_no,
                    "lines": [
                        {
                            "pk_of_line": str(each.pk),
                            "lr_no": str(each.booking.lr_no),
                            "particular": each.particulars,
                            "services": each.services,
                            "sac_code": each.sac_code,
                            "under_rcm": each.under_rcm,
                            "freight_amount": str(each.freight_amount),
                            "gst_rate": each.gst_rate,
                            "total_amount": str(each.total_amount),
                        }
                        for each in InvoiceBillLine.objects.filter(
                            parent=invoice_obj, booking=bk
                        )
                    ],
                    "is_invoiced": bk.is_invoiced,
                }
                for bk in bkg
            }
            for bk in bkg:
                total_amount = float(0)
                total_freight_amount = float(0)

                for each_one in invoice_line[bk.pk]["lines"]:
                    total_amount = total_amount + float(each_one["total_amount"])
                    total_freight_amount = total_freight_amount + float(
                        each_one["freight_amount"]
                    )
                invoice_line[bk.pk]["total_amount"] = str(total_amount)
                invoice_line[bk.pk]["total_freight_amount"] = str(total_freight_amount)

            data["invoice_line"] = invoice_line
            data["delete_invoice_list"] = []

            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)

    def put(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            invoice_bill = InvoiceBill.objects.get(pk=pk)
            if invoice_bill.is_transaction_effected:
                return Response(
                    {"errorMsg": "Please Cancel the transaction effect"}, status=200
                )
            else:
                data = self.validate_data(request.data)
                created_at = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                if "errorMsg" in data.keys():
                    return Response(data, status=200)
                bill_no = data["bill_no"]
                booking_type = data["booking_type"]
                bill_type = data["bill_type"]
                bill_date = datetime.datetime.strptime(
                    data["bill_date"], "%Y-%m-%d"
                ).date()
                customer = CustomerMaster.objects.get(
                    name=data["customer"],
                    location__name=data["location"],
                    site__name=data["site"],
                )
                address = data["address"]
                state = data["state"]
                state_code = data["state_code"]
                gst_no = data["gst_no"]
                pan_no = data["pan_no"]
                company_account = data["company_account"]
                total_amount_without_tax = float(0)
                if data["total_amount_without_tax"] is not None:
                    total_amount_without_tax = float(data["total_amount_without_tax"])
                total_amount = float(0)
                if data["total_amount"] is not None:
                    total_amount = float(data["total_amount"])
                due_total_amount = float(0)
                if data["due_total_amount"] is not None:
                    due_total_amount = float(data["due_total_amount"])

                location_object = Location.objects.get(name=data["location"])
                site_object = Site.objects.get(name=data["site"])

                validated_invoice_line = None
                for each in data["invoice_line"]:
                    if not data["invoice_line"][each]["is_invoiced"]:
                        for each_one in data["invoice_line"][each]["lines"]:
                            validated_invoice_line = self.validate_invoice_line_data(
                                data=each_one,
                                location=location_object,
                                site=site_object,
                            )
                            if "errorMsg" in validated_invoice_line.keys():
                                return Response(each, status=200)
                            else:
                                continue

                invoice_bill.bill_no = bill_no
                invoice_bill.booking_type = booking_type
                invoice_bill.bill_type = bill_type
                invoice_bill.bill_date = bill_date
                invoice_bill.customer = customer
                invoice_bill.address = address
                invoice_bill.state = state
                invoice_bill.state_code = state_code
                invoice_bill.gst_no = gst_no
                invoice_bill.pan_no = pan_no
                invoice_bill.company_account = company_account
                invoice_bill.total_amount_without_tax = total_amount_without_tax
                invoice_bill.total_amount = total_amount
                invoice_bill.due_total_amount = due_total_amount
                invoice_bill.location = location_object
                invoice_bill.site = site_object
                invoice_bill.save()

                total_freight_amount = float(0)
                total_amount_with_tax = float(0)
                total_igst_amount = float(0)
                total_cgst_amount = float(0)
                total_sgst_amount = float(0)
                # total_due_amount = float(0)

                if not len(data["delete_invoice_list"]) == 0:
                    for each in data["delete_invoice_list"]:
                        delete_obj = InvoiceBillLine.objects.filter(booking__pk=each)
                        for obj in delete_obj:
                            obj.booking.invoice_id = None
                            obj.booking.is_invoiced = False
                            obj.booking.save()
                            obj.delete()

                # Invoice Bill Line
                for each in data["invoice_line"]:
                    if not data["invoice_line"][each]["is_invoiced"]:
                        for line in data["invoice_line"][each]["lines"]:
                            booking = BookingMaster.objects.get(
                                lr_no=line["lr_no"],
                                location=location_object,
                                site=site_object,
                            )
                            booking.is_invoiced = True
                            booking.invoice_id = invoice_bill.pk
                            booking.save()
                            particulars = line["particular"]
                            services = line["services"]
                            sac_code = line["sac_code"]
                            under_rcm = line["under_rcm"]
                            freight_amount = float(line["freight_amount"])
                            gst_rate = line["gst_rate"]
                            total_amount_line = float(line["total_amount"])
                            if not site_object.state == state:
                                sgst_amount_line = float(0)
                                cgst_amount_line = float(0)
                                igst_amount_line = total_amount_line - freight_amount
                            else:
                                sgst_amount_line = float(
                                    (total_amount_line - freight_amount) / float(2)
                                )
                                cgst_amount_line = float(
                                    (total_amount_line - freight_amount) / float(2)
                                )
                                igst_amount_line = float(0)

                            total_freight_amount += freight_amount
                            total_amount_with_tax += total_amount_line

                            total_igst_amount += igst_amount_line
                            total_cgst_amount += cgst_amount_line
                            total_sgst_amount += sgst_amount_line

                            if not "pk_of_line" in line.keys():
                                new_invoice_bill = InvoiceBillLine.create(
                                    parent=invoice_bill,
                                    booking=booking,
                                    particulars=particulars,
                                    services=services,
                                    sac_code=sac_code,
                                    under_rcm=under_rcm,
                                    freight_amount=freight_amount,
                                    gst_rate=gst_rate,
                                    sgst_amount=sgst_amount_line,
                                    cgst_amount=cgst_amount_line,
                                    igst_amount=igst_amount_line,
                                    total_amount=total_amount_line,
                                )
                                new_invoice_bill.save()
                            else:
                                invoice_line = InvoiceBillLine.objects.get(
                                    pk=line["pk_of_line"]
                                )
                                invoice_line.parent = invoice_bill
                                invoice_line.booking = booking
                                invoice_line.particulars = particulars
                                invoice_line.services = services
                                invoice_line.sac_code = sac_code
                                invoice_line.under_rcm = under_rcm
                                invoice_line.freight_amount = freight_amount
                                invoice_line.gst_rate = gst_rate
                                invoice_line.sgst_amount = sgst_amount_line
                                invoice_line.cgst_amount = cgst_amount_line
                                invoice_line.igst_amount = igst_amount_line
                                invoice_line.total_amount = total_amount_line
                                invoice_line.save()
                            # total_due_amount += total_amount_line
                if not site_object.state == state:
                    invoice_bill.sgst_amount = float(0)
                    invoice_bill.cgst_amount = float(0)
                    invoice_bill.igst_amount = total_amount - total_amount_without_tax
                    invoice_bill.save()
                else:
                    invoice_bill.sgst_amount = (
                        total_amount - total_amount_without_tax
                    ) / float(2)
                    invoice_bill.cgst_amount = (
                        total_amount - total_amount_without_tax
                    ) / float(2)
                    invoice_bill.igst_amount = float(0)
                    invoice_bill.save()
                logs = TransactionLog.create(
                    created_at=created_at,
                    date=bill_date,
                    vch_no=bill_no,
                    vch_type="INVOICE",
                    particular=None,
                    creditor=None,
                    customer=customer,
                    effect_on=None,
                    transaction_type="Debit",
                    transaction_method=None,
                    booking_id=None,
                    invoice_id=invoice_bill.pk,
                    payment_receipt_id=None,
                    contra_id=None,
                    journal_id=None,
                    amount=total_amount,
                    location=location_object,
                    site=site_object,
                )
                logs.save()

                invoice_bill.amount_in_words = str(
                    num2words(round(total_amount))
                ).upper()
                # invoice_bill.due_total_amount = float(total_due_amount)
                invoice_bill.save()

            return Response({"successMsg": "Data Updated"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetInvoiceData(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data

            bkg = BookingMaster.objects.select_related("location", "site").filter(
                bill_party__name=data["customer"],
                location__name=data["location"],
                site__name=data["site"],
                transaction_effected=True,
                is_invoiced=False,
                is_draft=False,
            )

            response_data = {}
            all_freight_amount = float(0)
            all_total_amount = float(0)
            for bk in bkg:
                line = {
                    bk.pk: {
                        "lines": [
                            {
                                "pk_of_bill_line": str(lines.pk),
                                "lr_no": lines.booking_bill.booking.lr_no,
                                "particular": f"LR No : {lines.booking_bill.booking.lr_no}, L_Date : {lines.booking_bill.booking.l_date}",
                                "services": lines.type_of_charge.description,
                                "sac_code": lines.type_of_charge.sac_code,
                                "under_rcm": lines.type_of_charge.under_rcm,
                                "freight_amount": str(lines.bill_amount),
                                "gst_rate": lines.type_of_charge.total_tax,
                                "total_amount": str(
                                    float(lines.bill_amount)
                                    + float(lines.bill_amount)
                                    * float(lines.type_of_charge.total_tax)
                                    / float(100)
                                ),
                            }
                            for lines in BookingBillLine.objects.filter(
                                booking_bill__booking=bk
                            )
                        ]
                    }
                }

                for each in line[bk.pk].copy():
                    total_freight_amount = float(0)
                    total_amount = float(0)
                    for each_one in line[bk.pk][each]:
                        total_freight_amount = total_freight_amount + float(
                            each_one["freight_amount"]
                        )
                        total_amount = total_amount + float(each_one["total_amount"])

                    line[bk.pk]["total_freight_amount"] = str(total_freight_amount)
                    line[bk.pk]["total_amount"] = str(total_amount)
                    line[bk.pk]["lr_no"] = bk.lr_no
                    all_freight_amount += total_freight_amount
                    all_total_amount += total_amount
                    obj = bkg.get(pk=bk.pk)
                    line[bk.pk]["is_invoiced"] = obj.is_invoiced

                response_data.update(line)
            if not all_freight_amount == float(0) and not all_total_amount == float(0):
                response_data["total_freight_amount"] = str(all_freight_amount)
                response_data["total_amount"] = str(all_total_amount)
            else:
                return Response(
                    {
                        "errorMsg": f"Data of {data['customer']} is not available for invoice "
                    },
                    status=200,
                )

            return Response({"data": response_data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteInvoiceBill(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def delete(self, request, pk, *args, **kwargs):
        try:
            invoice_obj = InvoiceBill.objects.get(pk=pk)
            if invoice_obj.is_transaction_effected:
                return Response(
                    {
                        "errorMsg": "Please Cancel Transaction effect to delete the Invoice"
                    },
                    status=200,
                )
            else:
                invoice_line = InvoiceBillLine.objects.filter(parent=invoice_obj)

                if TransactionLog.objects.filter(invoice_id=invoice_obj.pk).exists():
                    tlog = TransactionLog.objects.filter(invoice_id=invoice_obj.pk)
                    tlog.delete()

                for each in invoice_line:
                    each.booking.is_invoiced = False
                    each.booking.invoice_id = None
                    each.booking.save()
                invoice_obj.delete()

            return Response({"successMsg": "Data Deleted"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DownloadInvoice(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get(self, request, pk, *args, **kwargs):
        try:
            invoice = InvoiceBill.objects.get(pk=pk)
            context = {}
            context["comapny_name"] = invoice.location.company_name
            context["company_address"] = invoice.location.company_address
            context["company_gst_no"] = invoice.location.gst_no
            context["bill_party"] = invoice.customer.name
            context["company_pan_no"] = ""
            context["company_state"] = invoice.site.state
            context["company_state_code"] = invoice.site.state_code
            context["invoice_no"] = invoice.bill_no
            context["date"] = invoice.bill_date
            context["invoice_gst_no"] = invoice.gst_no
            context["invoice_pan_no"] = invoice.pan_no
            context["invoice_state"] = invoice.state
            context["invoice_state_code"] = invoice.state_code
            context["company_account"] = invoice.company_account
            context["total_amount_without_tax"] = str(invoice.total_amount_without_tax)
            context["total_amount"] = str(invoice.total_amount)
            context["amount_in_words"] = invoice.amount_in_words

            line = [
                {
                    "particular": f"{each.services}, {each.particulars}, LR Date: {each.booking.l_date}, Truck No: {each.booking.truck.truck_no},From :{each.booking.from_dest}, To:{each.booking.to_dest} Container No: {each.booking.container_no}, Advance: {each.booking.advance}",
                    "sac_code": each.sac_code,
                    "taxable_amount": str(each.freight_amount),
                    "tax_rate": each.gst_rate,
                    "igst_rate": "0" if each.igst_amount==float(0) else each.gst_rate,
                    "cgst_rate": "0" if each.cgst_amount==float(0) else str(float(each.gst_rate) / float(2)),
                    "sgst_rate": "0" if each.sgst_amount==float(0) else str(float(each.gst_rate) / float(2)),
                    "cgst_amount": str(each.cgst_amount),
                    "sgst_amount": str(each.sgst_amount),
                    "igst_amount": str(each.igst_amount),
                    "total": str(each.total_amount),
                }
                for each in InvoiceBillLine.objects.filter(parent=invoice)
            ]
            context["line"] = line
            return Response(self.none_to_empty_str(items=context), status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


class CancelTransactionEffect(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            invoice_obj = InvoiceBill.objects.get(pk=pk)
            if not invoice_obj.is_transaction_effected:
                return Response(
                    {"errorMsg": "Transaction Effect already cancelled"}, status=200
                )

            if PaymentReceiptLine.objects.filter(invoice_bill=invoice_obj).exists():
                payment_receipt_line = PaymentReceiptLine.objects.filter(
                    invoice_bill=invoice_obj
                )
                for each in payment_receipt_line:
                    parent = each.parent
                    account = each.parent.transaction_from
                    total_amount_to_decrease = (
                        float(each.receipt_amount) + float(each.kasar) + float(each.tds)
                    )
                    account.total_balance = float(account.total_balance) - float(
                        total_amount_to_decrease
                    )
                    account.save()
                    invoice_obj.due_total_amount = float(
                        invoice_obj.due_total_amount
                    ) + float(each.receipt_amount)
                    invoice_obj.save()
                    parent.receipt_amount = float(parent.receipt_amount) - float(
                        each.receipt_amount
                    )
                    parent.kasar = float(parent.kasar) - float(each.kasar)
                    parent.tds = float(parent.tds) - float(each.tds)
                    parent.total_amount = float(parent.total_amount) - float(
                        total_amount_to_decrease
                    )
                    parent.save()
                    tlog = TransactionLog.objects.get(payment_receipt_id=parent.pk)
                    tlog.delete()
                    each.delete()
                    if not PaymentReceiptLine.objects.filter(parent=parent).exists():
                        parent.delete()
                    else:
                        tlogs = TransactionLog.create(
                            created_at=datetime.datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .date(),
                            date=parent.entry_date,
                            vch_no=parent.entry_no,
                            vch_type="RECEIPT",
                            particular=None,
                            creditor=None,
                            customer=parent.customer,
                            effect_on=parent.transaction_from,
                            transaction_type="Credit",
                            transaction_method=parent.payment_receipt_type,
                            booking_id=None,
                            invoice_id=None,
                            payment_receipt_id=parent.pk,
                            contra_id=None,
                            journal_id=None,
                            amount=parent.total_amount,
                            location=parent.location,
                            site=parent.site,
                        )
                        tlogs.save()

            invoice_obj.is_invoice_completed = False
            invoice_obj.is_transaction_effected = False
            invoice_obj.save()
            data = {}
            bkg = BookingMaster.objects.filter(invoice_id=pk)
            data = invoice_obj.get_invoice_bill()
            invoice_line = {
                bk.pk: {
                    "lr_no": bk.lr_no,
                    "lines": [
                        {
                            "pk_of_line": str(each.pk),
                            "lr_no": str(each.booking.lr_no),
                            "particular": each.particulars,
                            "services": each.services,
                            "sac_code": each.sac_code,
                            "under_rcm": each.under_rcm,
                            "freight_amount": str(each.freight_amount),
                            "gst_rate": each.gst_rate,
                            "total_amount": str(each.total_amount),
                        }
                        for each in InvoiceBillLine.objects.filter(
                            parent=invoice_obj, booking=bk
                        )
                    ],
                    "is_invoiced": bk.is_invoiced,
                }
                for bk in bkg
            }
            data["invoice_line"] = invoice_line
            data["delete_invoice_list"] = []
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
