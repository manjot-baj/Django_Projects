import requests
from decouple import config
from common.error_logging import ErrorLogging

WHATSAPP_TOKEN = config("WHATSAPP_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = config("WHATSAPP_PHONE_NUMBER_ID")
WHATSAPP_BASE_URL = config("WHATSAPP_BASE_URL")


class WhatsAppService:

    @classmethod
    def send_gatepass(
        cls,
        mobile: str,
        pdf_url: str,
        container_no: str,
        vehicle_no: str,
    ):
        try:
            url = f"{WHATSAPP_BASE_URL}/" f"{WHATSAPP_PHONE_NUMBER_ID}/messages"

            payload = {
                "messaging_product": "whatsapp",
                "to": mobile,
                "type": "template",
                "template": {
                    "name": "send_gatepass",
                    "language": {"code": "en"},
                    "components": [
                        {
                            "type": "header",
                            "parameters": [
                                {
                                    "type": "document",
                                    "document": {
                                        "link": pdf_url,
                                        "filename": "Gatepass.pdf",
                                    },
                                }
                            ],
                        },
                        {
                            "type": "body",
                            "parameters": [
                                {"type": "text", "text": container_no},
                                {"type": "text", "text": vehicle_no},
                            ],
                        },
                    ],
                },
            }

            response = requests.post(
                url,
                headers={
                    "Authorization": f"Bearer {WHATSAPP_TOKEN}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=30,
            )
            # print("STATUS:", response.status_code)
            # print("BODY:", response.text)
            response.raise_for_status()

            return response.json()

        except Exception as e:
            ErrorLogging().log_error()
            return False
