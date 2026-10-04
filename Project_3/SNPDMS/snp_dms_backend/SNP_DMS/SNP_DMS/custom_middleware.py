from django.middleware.csrf import CsrfViewMiddleware


class CustomHeaderMiddleware(CsrfViewMiddleware):
    def process_response(self, request, response):
        response["Access-Control-Expose-Headers"] = "X-Filename"
        return super().process_response(request, response)
