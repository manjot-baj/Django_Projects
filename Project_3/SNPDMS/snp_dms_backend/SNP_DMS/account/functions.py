from django.core.mail import EmailMessage
import random


def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_mail(otp, from_email, to_email):
    try:
        msg = EmailMessage(
            f"OTP for Password Change",
            f"Hi,\n" f"Your otp is {otp}\n" f"Thanks and Regards," f"Team.",
            from_email,
            to_email,
        )
        msg.send()
        return True
    except Exception as e:
        return str(e)
