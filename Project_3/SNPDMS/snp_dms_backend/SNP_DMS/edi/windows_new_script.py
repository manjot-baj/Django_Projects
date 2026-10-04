import win32com.client as win32
import os, ftplib, logging, smtplib, traceback, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import requests, paramiko

logging.basicConfig(
    filename="file.log",
    level=logging.DEBUG,
    format="%(levelname)s %(asctime)s %(module)s.%(funcName)s:%(lineno)s- %(message)s",
)


def login_and_get_access_token(username, password):
    try:
        url = "https://api.decomans.com/account/login/token/"
        payload = {"username": username, "password": password}
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        return response.json().get("access")
    except Exception as e:
        print(f"Unexpected error at 'login_and_get_access_token': {e}")
        return None


def fetch_ftp_credentials(access_token):
    try:
        url = "https://api.decomans.com/edi/list_msc_ftp_credential/"
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(url, headers=headers, timeout=10)
        return response.json()
    except Exception as e:
        print(f"Unexpected error at 'fetch_ftp_credentials': {e}")
        return None


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


def process_excel_and_send_to_ftp():
    try:
        main_directory = "C:/inetpub/myFTPDirectory/edi_excel_files/"
        access_token = login_and_get_access_token(
            username="manjot@admin", password="M4nj0t@1"
        )
        ftp_details_dict = fetch_ftp_credentials(access_token=access_token)
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
                    if not site in ftp_details_dict.keys():
                        print(f"Skipping FTP and Email for {site} ...")
                        continue
                    ftp_detail = ftp_details_dict[site]
                    
                    # upload_success = upload_file_to_ftp_server(
                    #     host="ftp.msc.com",
                    #     username=ftp_detail["username"],
                    #     password=ftp_detail["password"],
                    #     working_directory="/To_MSC/EDI_XLS/",
                    #     file_name=file_name,
                    #     file_path=temp_file_path,
                    # )
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
                            email_list=ftp_detail["email_list"],
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
