import win32com.client as win32
import os, ftplib, logging, smtplib, traceback, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import paramiko

logging.basicConfig(
    filename="file.log",
    level=logging.DEBUG,
    format="%(levelname)s %(asctime)s %(module)s.%(funcName)s:%(lineno)s- %(message)s",
)


def send_alert_email(ftp_upload_failed=False, site=None, filename=None):
    try:
        email_list = [
            "manjot.bajwa@sunandpearls.com",
            "dipak.basantani@sunandpearls.com",
            "pooja.kumari@sunandpearls.com",
        ]
        print("Sending Alert Email ...")
        smtp_port = 587
        smtp_server = "smtp.gmail.com"
        pswd = "qdtulqrfuzkydcwr"
        # pswd = "qdtu lqrf uzky dcwr"
        email_from = "support@sunandpearls.com"
        subject = f"ALERT!!! EDI EXCEL PROCESS FAILURE "
        if ftp_upload_failed:
            subject = f"ALERT!!! EDI EXCEL FTP UPLOAD FAILURE "
        for person in email_list:
            # Make the body of the email
            body = "EDI EXCEL FAILURE!!! \nPlease Check the Windows Server to Debug\nRegards,\nAlert System."
            if ftp_upload_failed:
                body = f"EDI EXCEL FAILURE!!! \nPlease Check the Windows Server to Debug, FTP Upload Failed !!! While Processing for {site} for file {filename}.\nRegards,\nAlert System."
            # make a MIME object to define parts of the email
            msg = MIMEMultipart()
            msg["From"] = email_from
            msg["To"] = person
            msg["Subject"] = subject
            # Attach the body as plain text
            msg.attach(MIMEText(body, "plain"))
            # Cast as string
            text = msg.as_string()
            # Connect with the server
            TIE_server = smtplib.SMTP(smtp_server, smtp_port)
            TIE_server.starttls()
            TIE_server.login(email_from, pswd)
            # Send emails to "person" as list is iterated
            TIE_server.sendmail(email_from, person, text)
        # Close the port
        TIE_server.quit()
        print("Alert Email Sent ...")
    except Exception as e:
        print(traceback.format_exc())
        print(f"Unexpected error at 'send_alert_email': {e}")
        return False


def send_emails(email_list, filename, file, site):
    try:
        print("Sending Email ...")
        smtp_port = 587
        smtp_server = "smtp.gmail.com"
        pswd = "qdtulqrfuzkydcwr"
        email_from = "support@sunandpearls.com"
        subject = f"EDI Excel Sent to {site} FTP Server named {filename}"
        for person in email_list:
            # Make the body of the email
            body = f"""
            Please Find the Attachments
            """
            # make a MIME object to define parts of the email
            msg = MIMEMultipart()
            msg["From"] = email_from
            msg["To"] = person
            msg["Subject"] = subject
            # Attach the body of the message
            msg.attach(MIMEText(body, "plain"))
            # Open the file in python as a binary
            attachment = open(file, "rb")  # r for read and b for binary
            # Encode as base 64
            attachment_package = MIMEBase("application", "octet-stream")
            attachment_package.set_payload((attachment).read())
            encoders.encode_base64(attachment_package)
            attachment_package.add_header(
                "Content-Disposition", "attachment; filename= " + filename
            )
            msg.attach(attachment_package)
            # Cast as string
            text = msg.as_string()
            # Connect with the server
            TIE_server = smtplib.SMTP(smtp_server, smtp_port)
            TIE_server.starttls()
            TIE_server.login(email_from, pswd)
            # Send emails to "person" as list is iterated
            TIE_server.sendmail(email_from, person, text)
        # Close the port
        TIE_server.quit()
        print("Email Sent ...")
    except Exception as e:
        print(traceback.format_exc())
        print(f"Unexpected error at 'send_emails': {e}")
        return False


def disable_protected_view(file_path):
    print("processing ...")
    excel = win32.gencache.EnsureDispatch("Excel.Application")
    excel.Visible = False  # Set to True to make Excel visible
    try:
        workbook = excel.Workbooks.Open(file_path)
        # Disable protected view
        workbook.UnprotectSharing()
        excel = win32.gencache.EnsureDispatch("Excel.Application")
        # Select the specific worksheet
        worksheet = workbook.Worksheets("Data_example")
        # Select the range of the column
        column_range = worksheet.Range("H:H")
        # Apply "Text to Columns" functionality
        column_range.TextToColumns(
            Destination=None,
            DataType=1,
            TextQualifier=1,
            ConsecutiveDelimiter=False,
            Tab=True,
            Semicolon=False,
            Comma=False,
            Space=False,
            Other=False,
            OtherChar=None,
            FieldInfo=None,
            DecimalSeparator=None,
            ThousandsSeparator=None,
            TrailingMinusNumbers=None,
        )
        # Save and close the workbook
        workbook.Save()
        workbook.Close()
        print("processed SuccessFully ...")
        return file_path
    except Exception as e:
        print(traceback.format_exc())
        print(f"Unexpected error at 'disable_protected_view': {e}")
        return False
    excel.Application.Quit()


def upload_file_to_ftp_server(
    host, username, password, working_directory, file_name, file_path
):
    try:
        # Try FTP_TLS (FTPS)
        print("Uploading on FTP_TLS (FTPS) ...")
        try:
            ftp = ftplib.FTP_TLS()
            ftp.connect(host)
            ftp.login(username, password)
            ftp.prot_p()  # Enable encryption for data channel
            ftp.cwd(working_directory)
            with open(file_path, "rb") as file:
                ftp.storbinary(f"STOR {file_name}", file)
            ftp.quit()
            print("Uploaded Successfully on FTP_TLS ...")
            return True
        except:
            print(f"FTP_TLS failed")
            print("Falling back to plain FTP...")

            # Fall back to plain FTP
            try:
                ftp = ftplib.FTP()
                ftp.connect(host)
                ftp.login(username, password)
                ftp.cwd(working_directory)
                with open(file_path, "rb") as file:
                    ftp.storbinary(f"STOR {file_name}", file)
                ftp.quit()
                print("Uploaded Successfully on plain FTP ...")
                return True
            except:
                print(f"Plain FTP failed")
                print("Fail to Upload on FTP ...")
                return False
    except Exception as e:
        print(traceback.format_exc())
        print(f"Unexpected error at 'upload_file_to_ftp_server': {e}")
        return False


def upload_file_to_ftp_server_with_SFTP(
    host, username, password, working_directory, file_name, file_path, port=22
):
    try:
        print("Uploading via SFTP (Paramiko) ...")

        transport = paramiko.Transport((host, port))
        transport.connect(username=username, password=password)

        sftp = paramiko.SFTPClient.from_transport(transport)

        # Change to target directory
        if working_directory:
            sftp.chdir(working_directory)

        remote_path = os.path.join(working_directory, file_name)

        # Upload file
        sftp.put(file_path, file_name)

        sftp.close()
        transport.close()

        print("Uploaded Successfully via SFTP ...")
        return True

    except Exception as e:
        print("SFTP upload failed")
        print(traceback.format_exc())
        print(f"Unexpected error at 'upload_file_to_ftp_server': {e}")
        return False


ftp_details_dict = {
    "INGHK": {"username": "IN363-INCCU_GOL_HOR", "password": "hIO1b3Qt"},
    "GOLDEN HORN CONTAINER SERVICES TWO KOLKATA": {
        "username": "IN363-INCCU_GOL_HOR",
        "password": "hIO1b3Qt",
    },
    "INGHC": {"username": "IN363-INHAL_GOL_HOR", "password": "Xer7vA80"},
    "AHMEDABAD": {"username": "IN363-INAMD_GOL_HOR", "password": "DGVSy2bC"},
    "SANAND": {"username": "IN363-INAMD_GOL_HOR", "password": "DGVSy2bC"},
    "ANKELESHWAR": {"username": "IN363-INAKV_GOL_HOR", "password": "COmvb!8&"},
    "VARNAMA": {"username": "IN363-INBDQ_GOL_HOR", "password": "G8lMfSwV"},
    "TUTICORIN": {"username": "IN363-INTUT_GOL_HOR", "password": "qk5mXn#S"},
    "MATRIX": {"username": "IN363-INHYD_GOL_HOR", "password": "UWYH8^we"},
    "BIRGUNJ": {"username": "IN363-NPBRG_GOL_HOR", "password": "IN7q1HR0Kj3gaeH"},
    "HEMC HALDIA": {"username": "IN363-INHAL_HEMC", "password": "oFgy6AXR"},
    "HEMC KOLKATA": {"username": "IN363-INCCU_HEMC", "password": "4YxO&wIf"},
    "FARIDABAD": {"username": "IN363-INFBD_GOL_HORN", "password": "9lnUd8&&"},
    "PGL DEPOT": {"username": "IN363-INLUH_PAC_GOL_PVT_LTD", "password": "37@9cB7^"},
    # "OM SHAILSHUTA LPL DEPOT": {
    #     "username": "IN363-INLUH_OPA_SHA_PVT_LTD",
    #     "password": "YPW0QVBr",
    # },
    # "OMSSGRFL SAHNEWAL": {
    #     "username": "IN363-INLUHAY",
    #     "password": "=T7+W49M",
    # },
    "GOLDEN HORN CONTAINER SERVICE MUNDRA": {
        "username": "IN363-INMUN_GOL_HORN",
        "password": "Q1MOW6tH",
    },
    "SATTVA CFS": {
        "username": "IN363-INVTZ_SAT_CFS",
        "password": "!4o1LA3i",
    },
    "CHEKLA CONTAINER YARD": {
        "username": "IN363-INAMD_GOL_HOR",
        "password": "DGVSy2bC",
    },
}

email_details_dict = {
    "INGHK": ["opskolkata@goldenhorncontainers.com"],
    "GOLDEN HORN CONTAINER SERVICES TWO KOLKATA": [
        "opskolkata@goldenhorncontainers.com"
    ],
    "INGHC": ["opshaldia@goldenhorncontainers.com"],
    "AHMEDABAD": ["opsahmedabad@goldenhorncontainers.com"],
    "SANAND": ["opssanand@goldenhorncontainers.com"],
    "ANKELESHWAR": ["opsankleshwar@goldenhorncontainers.com"],
    "VARNAMA": ["opsvarnama@goldenhorncontainers.com"],
    "TUTICORIN": [
        "opstuticorin@goldenhorncontainers.com",
        "arvintharaj.t@msc.com",
    ],
    "MATRIX": ["opshyderabad@goldenhorncontainers.com"],
    "BIRGUNJ": ["opsbirgunj@goldenhorncontainers.com"],
    "HEMC HALDIA": [
        "hemcorpn81@gmail.com",
        "IN363-eirv.kolkata@msc.com",
        "IN363-opsccu@msc.com",
    ],
    "HEMC KOLKATA": [
        "hemcorpn81@gmail.com",
        "IN363-eirv.kolkata@msc.com",
        "IN363-opsccu@msc.com",
    ],
    "FARIDABAD": ["opsfaridabad@goldenhorncontainers.com"],
    "PGL DEPOT": ["depot@pglogistics.in"],
    # "OM SHAILSHUTA LPL DEPOT": ["depotludhiana@shailshuta.com"],
    # "OMSSGRFL SAHNEWAL": ["depotludhiana@shailshuta.com"],
    "GOLDEN HORN CONTAINER SERVICE MUNDRA": ["mundradepot@goldenhorncontainers.com"],
    "SATTVA CFS": ["opsvisakhacfs@goldenhorncontainers.com"],
    "CHEKLA CONTAINER YARD": ["opschekla@goldenhorncontainers.com"],
}


def process_excel_and_send_to_ftp():
    try:
        main_directory = "C:/inetpub/myFTPDirectory/edi_excel_files/"
        for directory in os.listdir(main_directory):
            site_directory = os.path.join(main_directory, directory)
            for file_name in os.listdir(site_directory):
                f = os.path.join(site_directory, file_name)
                # checking if it is a file
                if os.path.isfile(f):
                    temp_file_path = disable_protected_view(f)
                    site = temp_file_path.split(main_directory)[1].split("\\")[0]
                    file_name = temp_file_path.split(site_directory)[1].split("\\")[1]
                    print("Started ...")
                    print(
                        f"Started Processing for {site} with file_name as {file_name}"
                    )
                    if site in ["BIRGUNJ"]:
                        print("Skipping FTP and Email for BIRGUNJ ...")
                        continue
                    ftp_detail = ftp_details_dict[site]

                    # upload_success = upload_file_to_ftp_server(
                    #         host="ftp.msc.com",
                    #         username=ftp_detail["username"],
                    #         password=ftp_detail["password"],
                    #         working_directory="/To_MSC/EDI_XLS/",
                    #         file_name=file_name,
                    #         file_path=temp_file_path,
                    #     )
                    # if not upload_success:
                    #     print("FTP upload via FTPS/FTP failed, trying SFTP ...")

                    upload_success = upload_file_to_ftp_server_with_SFTP(
                        host="ftp.msc.com",
                        username=ftp_detail["username"],
                        password=ftp_detail["password"],
                        working_directory="/To_MSC/EDI_XLS/",
                        file_name=file_name,
                        file_path=temp_file_path,
                        port=22,
                    )

                    if upload_success:
                        print("Ftp Uploaded Successfully ...")
                        send_emails(
                            email_list=email_details_dict[site],
                            filename=file_name,
                            file=temp_file_path,
                            site=site,
                        )
                        os.remove(temp_file_path)
                        print("Email Sent Successfully ...")
                        print("Process Completed !!!")
                        print("SuccessFully Process Completed !!!")
                    else:
                        print("Ftp upload failed")
                        print("Process Failed !!!")
                        send_alert_email(
                            ftp_upload_failed=True, site=site, filename=file_name
                        )
                        print("Alert sent !!!")
    except Exception as e:
        print(traceback.format_exc())
        print("Process Failure !!!")
        send_alert_email()
        print("Alert sent !!!")


process_excel_and_send_to_ftp()

# @echo off
# :x
# "C:\Windows\py.exe" "C:\Python_Programs\process_excel_send_to_ftp.py"
# echo %time%
# timeout 900 > NUL
# echo %time%
# goto x
