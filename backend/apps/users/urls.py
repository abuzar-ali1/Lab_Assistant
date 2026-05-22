from django.urls import path
from .views import (
    UserRegisterAPIView,
    CustomTokenObtainPairView,
    TokenRefreshAPIView,
    LogoutAPIView,
    UserProfileAPIView,
    ChangePasswordAPIView,
)

urlpatterns = [
    # Authentication
    path('api/register/', UserRegisterAPIView.as_view(), name='register'),
    path('api/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshAPIView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutAPIView.as_view(), name='logout'),
    
    # User
    path('api/profile/', UserProfileAPIView.as_view(), name='profile'),
    path('api/change-password/', ChangePasswordAPIView.as_view(), name='change_password'),
]