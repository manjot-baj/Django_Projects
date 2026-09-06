import http.client
import json

conn = http.client.HTTPSConnection("api.msg91.com")

# my_data = {
#   "sender": "KIINFO",
#   "route": "4",
#   "country": "91",
#   "sms": [
#     {
#       "message": "Hello there",
#       "to": [
#         "9922620357",
#         "8080101993"
#       ]
#     }
#   ]
# }

# payload = "{ \"sender\": \"SOCKET\", \"route\": \"4\", \"country\": \"91\", \"sms\": [ { \"message\": \"Message1\", " \
#           "\"to\": [ \"98260XXXXX\", \"98261XXXXX\" ] }, { \"message\": \"Message2\", \"to\": [ \"98260XXXXX\", " \
#          "\"98261XXXXX\" ] } ] } "
# data =
# payload = ''' {
#   "sender": "KIINFO",
#   "route": "4",
#   "country": "91",
#   "sms": [
#     {
#       "message": "Hello there",
#       "to": [
#         "9922620357",
#         "8080101993"
#       ]
#     }
#   ]
# }'''
payload = {
    "sender": "KIINFO",
    "route": "4",
    "country": "91",
    "sms": [
        {
            "message": "Hello there",
            "to": [
                "9922620357",
                "8080101993"
            ]
        }
    ]
}
my_payload = json.dumps(payload)
print(my_payload)
headers = {
    'authkey': "319771ADVdNvaEDkN5e525394P1",
    'content-type': "application/json"
}

conn.request("POST", "/api/v2/sendsms", my_payload, headers)

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))
