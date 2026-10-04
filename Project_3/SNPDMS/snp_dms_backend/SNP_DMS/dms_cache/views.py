import logging, traceback
from django.core.cache import cache
from django.shortcuts import redirect
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import TemplateHTMLRenderer


# Create your views here.
class GetRedisKeys(views.APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = "dms_cache/home.html"

    def get(self, request, *args, **kwargs):
        try:
            all_keys = {}
            key_list = cache._cache.keys()
            new_list = list(key_list)
            for k in new_list:
                new_k = k.replace(":1:", "")
                all_keys[new_k] = cache.get((new_k))

            return Response({"all_keys": all_keys}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


class GetRedisValue(views.APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = "dms_cache/display_value.html"

    def get(self, request, key_str, *args, **kwargs):
        try:
            value = cache.get((key_str))
            return Response({"value": value}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


class DeleteRedisValue(views.APIView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = "dms_cache/home.html"

    def get(self, request, key_str, *args, **kwargs):

        try:
            cache.delete(key_str)
            return redirect("home")
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


class ManageCacheKeys(views.APIView):

    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            location = request.data.get("location")
            site = request.data.get("site")
            key_list = cache._cache.keys()
            new_list = list(key_list)
            new_list = [k.replace(":1:", "") for k in new_list]
            if location == "" and site == "":
                for each in new_list:
                    cache.delete((each))
            else:
                string_to_search = f"{location}_{site}"
                for each in new_list:
                    if string_to_search in each:
                        cache.delete((each))
                    elif "location_site" in each:
                        cache.delete((each))


            return Response({"successMsg": "Deleted Cache keys successfully"})

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
