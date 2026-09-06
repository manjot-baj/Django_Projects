from django.db.models import CharField, ExpressionWrapper, F, Func, Prefetch, Q
from django.db.models import Value as V
from django.db.models.functions import Cast, Concat, Coalesce
from django.shortcuts import redirect
from SM.company_data import Client, Vendor, CompanyDetail
from SM import employee_data, enquiry, product, service, dayBook, amc, quotation, invoice, bill_of_supply



class ClientReport:

    def get_data(self, request, client_id=None, company_id=None):
        data = {}
        record = Client.objects.filter(pk=client_id, company_id=company_id).annotate(
            client_name=F('name'), client_contact_Name=F('contact_Name'), client_TIN=F('TIN'),
            client_email=F('email'), client_phone=F('phone'), client_billing_address=F('billing_address'),
            client_billing_zip=F('billing_zip'), client_billing_city=F('billing_city'),
            client_billing_state=F('billing_state'), client_billing_country=F('billing_country'),
            client_shipping_address=F('shipping_address'), client_shipping_zip=F('shipping_zip'),
            client_shipping_city=F('shipping_city'), client_shipping_state=F('shipping_state'),
            client_shipping_country=F('shipping_country'), client_details=F('details'),
            client_GSTIN=F('GSTIN'), client_PAN=F('PAN'), client_balance=F('balance'))

        for each in record:
            data.update({
                'pk': each.pk,
                'client_name': each.client_name,
                'client_contact_Name': each.client_contact_Name,
                'client_TIN': each.client_TIN,
                'client_email': each.client_email,
                'client_phone': each.client_phone,
                'client_billing_address': each.client_billing_address,
                'client_billing_zip': each.client_billing_zip,
                'client_billing_city': each.client_billing_city,
                'client_billing_state': each.client_billing_state,
                'client_billing_country': each.client_billing_country,
                'client_shipping_address': each.client_shipping_address,
                'client_shipping_zip': each.client_shipping_zip,
                'client_shipping_city': each.client_shipping_city,
                'client_shipping_state': each.client_shipping_state,
                'client_shipping_country': each.client_shipping_country,
                'client_details': each.client_details,
                'client_GSTIN': each.client_GSTIN,
                'client_PAN': each.client_PAN,
                'client_balance': each.client_balance
            })
        print(data)
        return data


class EmployeeReport:

    def get_data(self, request, employee_id=None, company_id=None):
        data = {}
        record = employee_data.Employee.objects.filter(pk=employee_id, company_id=company_id).annotate(
            employee_name=F('name'),
            employee_address=F('address'),
            employee_city=F('city'),
            employee_state=F('state'),
            employee_pin_code=F('pin_code'),
            employee_country=F('country'),
            employee_mobile_no=F('mobile_no'),
            employee_email_id=F('email_id'),
            employee_qualification=F('qualification'),
            employee_type=F('type'),
            employee_job_profile=F('job_profile'),
            employee_job_description=F('job_description'),
            employee_date=ExpressionWrapper(Func(F('join_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                            output_field=CharField()),
        )
        print(record)

        for each in record:
            data.update({
                'pk': each.pk,
                'employee_photo': each.photo.url,
                'employee_name': each.employee_name,
                'employee_address': each.employee_address,
                'employee_city': each.employee_city,
                'employee_state': each.employee_state,
                'employee_pin_code': each.employee_pin_code,
                'employee_country': each.employee_country,
                'employee_mobile_no': each.employee_mobile_no,
                'employee_email_id': each.employee_email_id,
                'employee_qualification': each.employee_qualification,
                'employee_type': each.employee_type,
                'employee_job_profile': each.employee_job_profile,
                'employee_job_description': each.employee_job_description,
                'employee_date': each.employee_date,
            })
            print(data)
        return data


class VendorReport:

    def get_data(self, request, vendor_id=None, company_id=None):
        data = {}
        record = Vendor.objects.filter(pk=vendor_id, company_id=company_id).annotate(
            vendor_name=F('name'), vendor_contact_Name=F('contact_Name'), vendor_TIN=F('TIN'),
            vendor_email=F('email'), vendor_phone=F('phone'), vendor_billing_address=F('billing_address'),
            vendor_billing_zip=F('billing_zip'), vendor_billing_city=F('billing_city'),
            vendor_billing_state=F('billing_state'), vendor_billing_country=F('billing_country'),
            vendor_shipping_address=F('shipping_address'), vendor_shipping_zip=F('shipping_zip'),
            vendor_shipping_city=F('shipping_city'), vendor_shipping_state=F('shipping_state'),
            vendor_shipping_country=F('shipping_country'), vendor_details=F('details'),
            vendor_GSTIN=F('GSTIN'))

        for each in record:
            data.update({
                'pk': each.pk,
                'vendor_name': each.vendor_name,
                'vendor_contact_Name': each.vendor_contact_Name,
                'vendor_TIN': each.vendor_TIN,
                'vendor_email': each.vendor_email,
                'vendor_phone': each.vendor_phone,
                'vendor_billing_address': each.vendor_billing_address,
                'vendor_billing_zip': each.vendor_billing_zip,
                'vendor_billing_city': each.vendor_billing_city,
                'vendor_billing_state': each.vendor_billing_state,
                'vendor_billing_country': each.vendor_billing_country,
                'vendor_shipping_address': each.vendor_shipping_address,
                'vendor_shipping_zip': each.vendor_shipping_zip,
                'vendor_shipping_city': each.vendor_shipping_city,
                'vendor_shipping_state': each.vendor_shipping_state,
                'vendor_shipping_country': each.vendor_shipping_country,
                'vendor_details': each.vendor_details,
                'vendor_GSTIN': each.vendor_GSTIN,
            })
            print(data)
        return data


class EnquiryReport:

    def get_data(self, request, enquiry_id=None, company_id=None):
        data = {}

        record = enquiry.Enquiry.objects.filter(pk=enquiry_id, company_id=company_id).annotate(
            enquiry_first_name=F('first_name'),
            enquiry_last_name=F('last_name'),
            enquiry_customer_type=F('customer_type__name'),
            enquiry_address=F('address'),
            enquiry_handled_by=F('create_user__first_name'),
            enq_type=F('enquiry_type__name'),
            enquiry_product_name=F('product_name'),
            enquiry_description=F('description'),
            enquiry_price=F('price'),
            enquiry_mobile_no=F('mobile_no'),
            enquiry_email_id=F('email_id'),

            date=ExpressionWrapper(Func(F('enquiry_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                   output_field=CharField()),
        )
        # print(record)

        for each in record:
            data.update({
                'pk': each.pk,
                'enquiry_first_name': each.enquiry_first_name,
                'enquiry_last_name': each.enquiry_last_name,
                'enquiry_customer_type': each.enquiry_customer_type,
                'enquiry_address': each.enquiry_address,
                'enquiry_handled_by': each.enquiry_handled_by,
                'enq_type': each.enq_type,
                'enquiry_product_name': each.enquiry_product_name,
                'enquiry_description': each.enquiry_description,
                'enquiry_price': each.enquiry_price,
                'enquiry_mobile_no': each.enquiry_mobile_no,
                'enquiry_email_id': each.enquiry_email_id,
            })
            print(data)
        return data

    def get_data_Reply(self, request, enquiry_id=None):
        record = enquiry.EnquiryRecord.objects.filter(enquiryDetails_id=enquiry_id).values("pk").annotate(
            replyEnquiry_enquiryDetails=F('enquiryDetails__first_name'),
            replyEnquiry_status=F('status'),
            replyEnquiry_comments=F('comments'),

            reply_date=ExpressionWrapper(Func(F('date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                         output_field=CharField()),
        )
        return list(record)


# class ProductReport:
#
#     def get_data(self, request, product_id=None, company_id=None):
#         data = {}
#         record = product.Product.objects.filter(pk=product_id, company_id=company_id).annotate(
#             product_name=F('name'),
#             product_unit_price=F('unit_price'),
#             product_u_o_m=F('u_o_m'),
#             product_quantity=F('quantity'),
#             product_description=F('description'),
#             product_product_type=F('product_type'),
#             product_purchase_rate=F('purchase_rate'),
#             product_purchase_rate_currency=F('purchase_rate_currency'),
#             product_h_s_n_or_s_a_c=F('h_s_n_or_s_a_c'),
#             product_s_k_u=F('s_k_u'),
#             product_tax=F('tax'),
#             product_c_e_s_s_percent=F('c_e_s_s_percent'),
#             product_c_e_s_s=F('c_e_s_s'),
#             #
#             # date=ExpressionWrapper(Func(F('enquiry_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
#             #                                 output_field=CharField()),
#         )
#         print(record)
#
#         for each in record:
#             data.update({
#                 'pk': each.pk,
#                 'product_name': each.product_name,
#                 'product_unit_price': each.product_unit_price,
#                 'product_u_o_m': each.product_u_o_m,
#                 'product_quantity': each.product_quantity,
#                 'product_description': each.product_description,
#                 'product_product_type': each.product_product_type,
#                 'product_purchase_rate': each.product_purchase_rate,
#                 'product_purchase_rate_currency': each.product_purchase_rate_currency,
#                 'product_h_s_n_or_s_a_c': each.product_h_s_n_or_s_a_c,
#                 'product_s_k_u': each.product_s_k_u,
#                 'product_tax': each.product_tax,
#                 'product_c_e_s_s_percent': each.product_c_e_s_s_percent,
#                 'product_c_e_s_s': each.product_c_e_s_s,
#             })
#             print(data)
#         return data


class ServiceReportInvoice:

    def get_data(self, request, service_id=None, company_id=None):
        data = {}
        company_info = CompanyDetail.objects.filter(id=company_id).values('name').annotate(
            company_address=Concat(
                F('address'), V(', '), F('city'), V(',\n'),
                F('state'), V(', '),
                F('pin_code'), V(', '), F('country'),
                V(',\n'), F('phone'), V(',\n'), F('email_id'),
                V(',\n'), F('website'),
                output_field=CharField())
        )
        service_records = service.ServiceRecord.objects.filter(service_number_id=service_id).annotate(
            replyService_service_number=F('service_number__service_number'),
            service_by=F('create_user__first_name')
        )
        record = service.Service.objects.filter(pk=service_id, company_id=company_id).annotate(
            number=F('service_number'),
            service_date=F('date'),
            service_client=F('client__name'),
            service_description=F('description'),
            service_name=F('service_type__name'),
            service_by=F('create_user__first_name')
        ).prefetch_related(Prefetch('servicerecord_set', queryset=service_records,
                                    to_attr='service_records'))
        print(record)

        for each in record:
            data.update({
                'pk': each.pk,
                'number': each.number,
                'service_date': each.service_date,
                'service_client': each.service_client,
                'service_description': each.service_description,
                'service_name': each.service_name,
                'service_photo': each.photo.url,
                'service_by': each.service_by,
                'service_records': [{'date': line.date,
                                     'status': line.status,
                                     'comment': line.comment, 'photo': line.photo.url,
                                     'service_by': line.service_by} for line in
                                    each.service_records]
            })
        for each in company_info:
            # print(each.get('company_address'))
            data.update({
                'company_name': each.get('name'),
                'company_address': each.get('company_address').replace("\n", "<br />\n"),
            })
        print(data)
        return data


class ServiceReport:

    def get_data(self, request, service_id=None, company_id=None):
        data = {}

        record = service.Service.objects.filter(pk=service_id, company_id=company_id).annotate(
            number=F('service_number'),
            service_date=F('date'),
            service_client=F('client__name'),
            service_description=F('description'),
            service_name=F('service_type__name'),
            service_by=F('create_user__first_name'),
            service_status=F('status'),
        )
        print(record)

        for each in record:
            data.update({
                'pk': each.pk,
                'number': each.number,
                'service_date': each.service_date,
                'service_client': each.service_client,
                'service_description': each.service_description,
                'service_name': each.service_name,
                'service_photo': each.photo.url,
                'service_by': each.service_by,
                'service_status': each.service_status
            })
        print(data)
        return data

    def get_data_Reply(self, request, service_id=None):
        record = service.ServiceRecord.objects.filter(service_number_id=service_id).annotate(
            replyService_service_number=F('service_number__service_number'),
            replyService_status=F('status'),
            replyService_comment=F('comment'),
            reply_date=F('date'),
            service_by=F('create_user__first_name')
        )
        print(record)
        return list(record)


class DayBookReport:

    def get_data(self, request, daybook_id=None, company_id=None):
        data = {}
        record = dayBook.DayBook.objects.filter(pk=daybook_id, company_id=company_id).annotate(
            daybook_number=F('number'),
            daybook_customer_type=F('customer_type'),
            dayBook_name=Coalesce('name', V("-")),
            daybook_customer_name=Coalesce('customer_name__name', V("-")),
            daybook_employee_name=Coalesce('employee_name__name', V("-")),
            daybook_vendor_name=Coalesce('vendor_name__name', V("-")),
            daybook_description=F('description'),
            daybook_status=F('status'),
            daybook_credit_amount=F('credit_amount'),
            daybook_debit_amount=F('debit_amount'),
            daybook_date=ExpressionWrapper(Func(F('date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),

        )

        for each in record:
            data.update({
                'pk': each.pk,
                'daybook_number': each.daybook_number,
                'daybook_customer_type': each.daybook_customer_type,
                'daybook_name': each.dayBook_name,
                'daybook_customer_name': each.daybook_customer_name,
                'daybook_employee_name': each.daybook_employee_name,
                'daybook_vendor_name': each.daybook_vendor_name,
                'daybook_description': each.daybook_description,
                'daybook_status': each.daybook_status,
                'daybook_credit_amount': each.daybook_credit_amount,
                'daybook_debit_amount': each.daybook_debit_amount,
                'daybook_date': each.daybook_date,
            })
            print(data)
        return data


class AmcReport:

    def get_data(self, request, amc_id=None, company_id=None):
        data = {}
        record = amc.AMC.objects.filter(pk=amc_id, company_id=company_id).annotate(
            amc_number=F('number'),
            amc_client=F('client_name__name'),
            amc_start_date=ExpressionWrapper(Func(F('start_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                             output_field=CharField()),
            amc_first_service_date=ExpressionWrapper(Func(F('first_service_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                                     output_field=CharField()),
            amc_second_service_date=ExpressionWrapper(
                Func(F('second_service_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                output_field=CharField()),
            amc_third_service_date=ExpressionWrapper(
                Func(F('third_service_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                output_field=CharField()),
            amc_fourth_service_date=ExpressionWrapper(
                Func(F('fourth_service_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                output_field=CharField()),
            amc_end_date=ExpressionWrapper(Func(F('end_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
            amc_description=F('description')
        )
        print(record)

        for each in record:
            data.update({
                'pk': each.pk,
                'amc_number': each.amc_number,
                'amc_client': each.amc_client,
                'amc_description': each.amc_description,
                'amc_start_date': each.amc_start_date,
                'amc_first_service_date': each.amc_first_service_date,
                'amc_second_service_date': each.amc_second_service_date,
                'amc_third_service_date': each.amc_third_service_date,
                'amc_fourth_service_date': each.amc_fourth_service_date,
                'amc_end_date': each.amc_end_date,
            })
            data1 = list(amc.AMC.objects.filter(pk=amc_id, company_id=company_id).values('client_name'))
            service_type = list(service.ServiceType.objects.filter(name='AMC').values('pk'))
            amc_service_records = list(service.Service.objects.filter(client_id=data1[0]['client_name'],
                                                                      company_id=company_id,
                                                                      service_type_id=service_type[0]['pk']).values(
                'pk').annotate(service_date=ExpressionWrapper(Func(F('date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                                              output_field=CharField()), service_status=F('status')))
            if not len(amc_service_records) == 0:
                data.update({"service_record": amc_service_records})
        print(data)
        return data


class QuotationReport:

    def get_data(self, request, quotation_order_id=None, company_id=None):
        data = {}
        print(quotation_order_id)
        print(company_id)
        quotation_order_lines = quotation.Quotation_lines.objects.annotate(product_name=F('product__name'))
        print(quotation_order_lines)
        record = quotation.Quotation.objects.filter(pk=quotation_order_id, company_id=company_id).annotate(
            quotation_issue_date=ExpressionWrapper(Func(F('issue_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                      output_field=CharField()),
            quotation_due_date=ExpressionWrapper(Func(F('due_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                         output_field=CharField()),
            quotation_client=F('client__name'),

        ).prefetch_related(Prefetch('quotation_lines_set', queryset=quotation_order_lines,
                                    to_attr='quotation_order_lines'))

        for each in record:
            data.update({
                'quotation_issue_date': each.quotation_issue_date,
                'quotation_due_date': each.quotation_due_date,
                'quotation_client': each.quotation_client,
                'number': each.number,
                'ship_to': each.ship_to,
                'place_of_supply': each.place_of_supply,
                'clean_amount': each.clean_amount,
                'grand_total': each.grand_total,
                'centralGst': each.centralGst,
                'rounded_off_value': each.rounded_off_value,
                'grand_total_without_round': each.grand_total_without_round,
                'stateGst': each.stateGst,
                'internationalGst': each.internationalGst,
                'gst': each.gst,
                'tax_amount': each.tax_amount,
                'discount_amount': each.discount_amount,
                'pk': each.pk,
                'quotation_order_lines': [{'product_name': line.product_name,
                                         'uom':line.uom,
                                          'quantity': line.quantity,
                                          'unit_price': line.unit_price,
                                          'line_discount': round(((line.discount/100)*line.unit_price*line.quantity),2),
                                         'total_without_gst': round((line.quantity * line.unit_price - (line.discount/100)*line.unit_price*line.quantity),2),
                                         'total_with_gst': round((line.quantity * line.unit_price + line.quantity * (line.unit_price * (int(line.tax))/100) - (line.discount/100)*line.unit_price*line.quantity),2),
                                         'line_centralGst': round(((line.quantity * (line.unit_price * (int(line.tax))/100))/2),2),
                                         'line_stateGst': round(((line.quantity * (line.unit_price * (int(line.tax))/100))/2),2),
                                         'line_internationalGst': round((line.quantity * (line.unit_price * (int(line.tax))/100)),2),} for line in
                                         each.quotation_order_lines]
            })

        return data


class InvoiceReport:

    def get_data(self, request, invoice_order_id=None, company_id=None):
        data = {}
        print(invoice_order_id)
        print(company_id)
        invoice_order_lines = invoice.InvoiceLines.objects.annotate(product_name=F('product__name'))
        print(invoice_order_lines)
        record = invoice.Invoice.objects.filter(pk=invoice_order_id, company_id=company_id).annotate(
            invoice_issue_date=ExpressionWrapper(Func(F('issue_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                                   output_field=CharField()),
            invoice_due_date=ExpressionWrapper(Func(F('due_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                                 output_field=CharField()),
            invoice_client=F('client__name'),
        ).prefetch_related(Prefetch('invoicelines_set', queryset=invoice_order_lines,
                                    to_attr='invoice_order_lines'))

        for each in record:
            data.update({
                'invoice_issue_date': each.invoice_issue_date,
                'invoice_due_date': each.invoice_due_date,
                'invoice_client': each.invoice_client,
                'number': each.number,
                'ship_to': each.ship_to,
                'place_of_supply': each.place_of_supply,
                'payment_terms': each.payment_terms,
                'clean_amount': each.clean_amount,
                'grand_total': each.grand_total,
                'rounded_off_value': each.rounded_off_value,
                'grand_total_without_round': each.grand_total_without_round,
                'centralGst': each.centralGst,
                'stateGst': each.stateGst,
                'internationalGst': each.internationalGst,
                'gst': each.gst,
                'tax_amount': each.tax_amount,
                'discount_amount': each.discount_amount,

                'pk': each.pk,
                'invoice_order_lines': [{'product_name': line.product_name,
                                         'uom':line.uom,
                                          'quantity': line.quantity,
                                          'unit_price': line.unit_price,
                                          'line_discount': round(((line.discount/100)*line.unit_price*line.quantity),2),
                                         'total_without_gst': round((line.quantity * line.unit_price - (line.discount/100)*line.unit_price*line.quantity),2),
                                         'total_with_gst': round((line.quantity * line.unit_price + line.quantity * (line.unit_price * (int(line.tax))/100) - (line.discount/100)*line.unit_price*line.quantity),2),
                                         'line_centralGst': round(((line.quantity * (line.unit_price * (int(line.tax))/100))/2),2),
                                         'line_stateGst': round(((line.quantity * (line.unit_price * (int(line.tax))/100))/2),2),
                                         'line_internationalGst': round((line.quantity * (line.unit_price * (int(line.tax))/100)),2),} for line in
                                         each.invoice_order_lines]
            })
        return data

class BillOfSupplyReport:
    def get_data(self, request, billOfSupply_id=None, company_id=None):
        data = {}
        print(billOfSupply_id)    #bill_of_supply
        print(company_id)
        billOfSupply_lines = bill_of_supply.BillOfSupplyLines.objects.annotate(product_name=F('product__name'))
        print(billOfSupply_lines)
        record = bill_of_supply.BillOfSupply.objects.filter(pk=billOfSupply_id, company_id=company_id).annotate(
            billOfSupply_issue_date=ExpressionWrapper(Func(F('issue_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                                 output_field=CharField()),
            billOfSupply_due_date=ExpressionWrapper(Func(F('due_date'), V("DD/MM/YYYY"), function='TO_CHAR'),
                                               output_field=CharField()),
            billOfSupply_client=F('client__name'),
        ).prefetch_related(Prefetch('billofsupplylines_set', queryset=billOfSupply_lines,
                                    to_attr='billOfSupply_lines'))

        for each in record:
            data.update({
                'billOfSupply_issue_date': each.billOfSupply_issue_date,
                'billOfSupply_due_date': each.billOfSupply_due_date,
                'billOfSupply_client': each.billOfSupply_client,
                'number': each.number,
                'ship_to': each.ship_to,
                'place_of_supply': each.place_of_supply,
                'payment_terms': each.payment_terms,
                'clean_amount': each.clean_amount,
                'grand_total': each.grand_total,
                'rounded_off_value': each.rounded_off_value,
                'grand_total_without_round': each.grand_total_without_round,
                'centralGst': each.centralGst,
                'stateGst': each.stateGst,
                'internationalGst': each.internationalGst,
                'gst': each.gst,
                'tax_amount': each.tax_amount,
                'discount_amount': each.discount_amount,

                'pk': each.pk,
                'billOfSupply_lines': [{'product_name': line.product_name,
                                         'uom': line.uom,
                                         'quantity': line.quantity,
                                         'unit_price': line.unit_price,
                                         'line_discount': round(
                                             ((line.discount / 100) * line.unit_price * line.quantity), 2),
                                         'total_without_gst': round((line.quantity * line.unit_price - (
                                                     line.discount / 100) * line.unit_price * line.quantity), 2),
                                         'total_with_gst': round((line.quantity * line.unit_price + line.quantity * (
                                                     line.unit_price * (int(line.tax)) / 100) - (
                                                                              line.discount / 100) * line.unit_price * line.quantity),
                                                                 2),
                                         'line_centralGst': round(
                                             ((line.quantity * (line.unit_price * (int(line.tax)) / 100)) / 2), 2),
                                         'line_stateGst': round(
                                             ((line.quantity * (line.unit_price * (int(line.tax)) / 100)) / 2), 2),
                                         'line_internationalGst': round(
                                             (line.quantity * (line.unit_price * (int(line.tax)) / 100)), 2), } for line
                                        in
                                        each.billOfSupply_lines]
            })

        return data

