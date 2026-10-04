from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path("login/token/", views.MyTokenObtainPairView.as_view()),
    path("login/token/refresh/", views.MyTokenObtainPairView.as_view()),
    path("reset_password/", views.ResetPassword.as_view()),
    path("add_role/", views.AddRoleMaster.as_view()),
    path("get_all_role/", views.AddRoleMaster.as_view()),
    path("get_all_role/<int:pk>/", views.EditRoleMaster.as_view()),
    path("get_all_role/delete/", views.DeleteRoleMaster.as_view()),
    path("add_user/", views.AddUserMaster.as_view()),
    path("get_all_user/", views.GetAllUsers.as_view()),
    path("get_all_user/<int:pk>/", views.EditUserMaster.as_view()),
    path("get_all_user/delete/", views.DeleteUserMaster.as_view()),
    path("get_otp/", views.SendOtpEmail.as_view()),
    path("verify_otp/", views.OtpVerification.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
