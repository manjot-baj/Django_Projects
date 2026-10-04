from email import message
import ftplib, logging, traceback
from django.core.mail import EmailMessage
from decouple import config
import os
import stat
import paramiko


def sftp_walk(sftp, dir_path):
    dirs = []
    files = []

    try:
        # List all items in the directory
        items = sftp.listdir_attr(dir_path)

        for item in items:
            # Check if the item is a directory or a file
            if stat.S_ISDIR(item.st_mode):
                dirs.append(item.filename)
            else:
                files.append(item.filename)

    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())

    return dir_path, dirs, files


def walk_sftp(sftp, dir_path="/"):
    stack = [dir_path]

    while stack:
        current_path = stack.pop()

        root, dirs, files = sftp_walk(sftp, current_path)

        yield root, dirs, files

        for d in dirs:
            stack.append(f"{root.rstrip('/')}/{d}")


def check_sftp_folder_structure(site, username, password):
    try:
        subject = None
        message = None
        unexpected_files = []

        host = "ftp.msc.com"
        expected_folder_path = "/To_MSC/EDI_XLS"

        # sftp
        transport = paramiko.Transport((host, 22))
        transport.connect(username=username, password=password)

        sftp = paramiko.SFTPClient.from_transport(transport)
        sftp.chdir("/")  # Change directory to the root

        for root, dirs, files in walk_sftp(sftp):
            normalized_root = root.rstrip("/")
            # Check for files outside the expected folder structure
            if normalized_root != expected_folder_path.rstrip("/") and files:
                for file in files:
                    if os.path.splitext(file)[1].lower() == ".xlsx":
                        unexpected_files.append(f"{normalized_root}/{file}")

        sftp.close()
        transport.close()

        if unexpected_files:
            subject = f"Alert: Unexpected Files Found on {site} SFTP Server!"

            message = (
                f"Hi,\nThe following files were found outside the expected folder\n"
            )

            message += "Please take appropriate action to remove these files.\n\n"
            message += "\n".join(unexpected_files) + "\n\n"
            message += "Thanks and Regards,\n"
            message += "Team"

        return subject, message

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None, None


def send_ftp_alert_to_mgmt(subject, body):
    try:
        to_email_list = [
            "arun.jeyabalan@sunandpearls.com",
            "samir.jena@sunandpearls.com",
            "pooja.kumari@sunandpearls.com",
        ]
        cc_email_list = [
            "manjot.bajwa@sunandpearls.com",
            "prakash.rewani@sunandpearls.com",
            "arun.jeyabalan@sunandpearls.com",
            "samir.jena@sunandpearls.com",
            "pooja.kumari@sunandpearls.com",
        ]
        # to_email_list = [
        #     "manjot.bajwa@sunandpearls.com",
        # ]
        # cc_email_list = [
        #     "manjot.bajwa@sunandpearls.com",
        # ]
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=config("EMAIL_HOST_USER"),
            to=to_email_list,
            cc=cc_email_list,
        )
        msg.send()
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def check_all_sites_ftp_folder_process():
    try:
        ftp_details_dict = {
            "INGHK": {"username": "IN363-INCCU_GOL_HOR", "password": "hIO1b3Qt"},
            "INGHC": {"username": "IN363-INHAL_GOL_HOR", "password": "Xer7vA80"},
            "AHMEDABAD": {"username": "IN363-INAMD_GOL_HOR", "password": "DGVSy2bC"},
            "SANAND": {"username": "IN363-INAMD_GOL_HOR", "password": "DGVSy2bC"},
            "ANKELESHWAR": {"username": "IN363-INAKV_GOL_HOR", "password": "COmvb!8&"},
            "VARNAMA": {"username": "IN363-INBDQ_GOL_HOR", "password": "G8lMfSwV"},
            "TUTICORIN": {"username": "IN363-INTUT_GOL_HOR", "password": "qk5mXn#S"},
            "MATRIX": {"username": "IN363-INHYD_GOL_HOR", "password": "UWYH8^we"},
            "BIRGUNJ": {"username": "IN363-NPBRG_GOL_HOR", "password": "5WLC*vKe"},
            "HEMC HALDIA": {"username": "IN363-INHAL_HEMC", "password": "oFgy6AXR"},
            "HEMC KOLKATA": {"username": "IN363-INCCU_HEMC", "password": "4YxO&wIf"},
            "FARIDABAD": {"username": "IN363-INFBD_GOL_HORN", "password": "9lnUd8&&"},
            "PGL DEPOT": {
                "username": "IN363-INLUH_PAC_GOL_PVT_LTD",
                "password": "37@9cB7^",
            },
            "OM SHAILSHUTA LPL DEPOT": {
                "username": "IN363-INLUH_OPA_SHA_PVT_LTD",
                "password": "YPW0QVBr",
            },
            "OMSSGRFL SAHNEWAL": {
                "username": "IN363-INLUHAY",
                "password": "=T7+W49M",
            },
            "GOLDEN HORN CONTAINER SERVICE MUNDRA": {
                "username": "IN363-INMUN_GOL_HORN",
                "password": "Q1MOW6tH",
            },
        }
        for site in ftp_details_dict:
            subject, body = check_sftp_folder_structure(
                site=site,
                username=ftp_details_dict[site]["username"],
                password=ftp_details_dict[site]["password"],
            )
            if subject and body:
                _ = send_ftp_alert_to_mgmt(subject, body)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False
