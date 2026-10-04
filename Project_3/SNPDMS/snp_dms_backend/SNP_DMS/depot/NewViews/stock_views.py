from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from depot.Services.stock_services import StockService
from account.permissions import HasAllowedRoles


class StockOfContainer(views.APIView):
    """
    POST: Retrieve all containers in stock with pagination and filtering.
    PUT: Update container stock details.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = StockService

    def post(self, request, *args, **kwargs):
        return self.service.get_container_stock(request.data, request.user)

    def put(self, request, pk, *args, **kwargs):
        return self.service.update_container_stock(pk, request.data, request.user)


class AddOrRemoveContainerInQueue(views.APIView):
    """
    POST: Add or remove containers from the do-not-lift queue.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = StockService

    def post(self, request, *args, **kwargs):
        return self.service.toggle_container_queue(request.data)


class CollectContainerStock(views.APIView):
    """
    POST: Collect and return containers with specific statuses.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = StockService

    def post(self, request, *args, **kwargs):
        return self.service.collect_container_stock(request.data)


class AllotmentOfContainer(views.APIView):
    """
    POST: Allot containers to a new or existing booking number.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = StockService

    def post(self, request, *args, **kwargs):
        return self.service.allot_container(request.data, request.user)


class RemoveAllotment(views.APIView):
    """
    POST: Remove containers from a booking.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = StockService

    def post(self, request, *args, **kwargs):
        return self.service.remove_allotment(request.data)


class UpdateAllotmentOfContainer(views.APIView):
    """
    POST: Update the quantity of an existing booking.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = StockService

    def post(self, request, pk, *args, **kwargs):
        return self.service.update_allotment(pk, request.data)


class BookingNumberDetails(views.APIView):
    """
    POST: Retrieve details for a specific booking number.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = StockService

    def post(self, request, *args, **kwargs):
        return self.service.get_booking_details(request.data)


class StockUploadSampleFile(views.APIView):
    """
    GET: Return the sample stock upload file.
    POST: Extract data from uploaded stock file.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = StockService

    def get(self, request, *args, **kwargs):
        return self.service.get_stock_upload_sample_file()

    def post(self, request, *args, **kwargs):
        return self.service.extract_stock_upload_data(request.data, request.user)


class StockImport(views.APIView):
    """
    POST: Import stock data from provided data.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = StockService

    def post(self, request, *args, **kwargs):
        return self.service.import_stock_data(request.data, request.user)


class RejectedStockDataFile(views.APIView):
    """
    POST: Download rejected stock data as an Excel file.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = StockService

    def post(self, request, *args, **kwargs):
        return self.service.download_rejected_stock_data(request.data)


class StockSheetDownloadView(views.APIView):
    """
    POST: Generate and download stock sheet as an Excel file.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = StockService

    def post(self, request, *args, **kwargs):
        return self.service.download_stock_sheet(request.data, request.user)
