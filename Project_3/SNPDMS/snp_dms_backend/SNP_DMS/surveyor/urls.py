from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from surveyor.Views import surveyor_view, form_view, import_surveyor_container


urlpatterns = [
    path("add_survey/", surveyor_view.SurveyorView.as_view()),
    path("surveyor_tarrif/", form_view.SurveyorTariffView.as_view()),
    path(
        "surveyor_image_upload/<str:pk>/", surveyor_view.UploadSurveyorImages.as_view()
    ),
    path("surveyor_inform_dependency/", form_view.SurveyorInformView.as_view()),
    path("container_validation/", surveyor_view.ContainerValidation.as_view()),
    path("get_survey_details/", surveyor_view.GetSurveyDetails.as_view()),
    path("get_survey_containers/", surveyor_view.SurveyContainers.as_view()),
    path(
        "import_surveyor_containers/",
        import_surveyor_container.SurveyorContainer.as_view(),
    ),
    path(
        "import_surveyor_data_in_gate_in/<str:pk>/",
        import_surveyor_container.SurveyorContainer.as_view(),
    ),
    path(
        "import_survey_data/",
        import_surveyor_container.ImportSurveyorContainers.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
