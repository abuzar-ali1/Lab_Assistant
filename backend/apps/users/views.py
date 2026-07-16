from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

import random
from urllib.parse import urlencode

from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer
)

User = get_user_model()


class UserRegisterAPIView(APIView):
    """
    Register a new user
    POST /api/register/
    {
        "email": "user@example.com",
        "username": "john_doe",
        "first_name": "John",
        "last_name": "Doe",
        "password": "SecurePass123",
        "password_confirm": "SecurePass123"
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate tokens for the new user
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Login user (custom to return user info)
    POST /api/login/
    {
        "email": "user@example.com",
        "password": "SecurePass123"
    }
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class TokenRefreshAPIView(TokenRefreshView):
    """
    Refresh access token using refresh token
    POST /api/token/refresh/
    {
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
    """
    permission_classes = [AllowAny]


class LogoutAPIView(APIView):
    """
    Logout user (blacklist refresh token)
    POST /api/logout/
    {
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()  # Add to blacklist
            return Response({
                'message': 'Successfully logged out'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileAPIView(APIView):
    """
    Get current user profile
    GET /api/profile/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChangePasswordAPIView(APIView):
    """
    Change user password
    POST /api/change-password/
    {
        "old_password": "OldPass123",
        "new_password": "NewPass456",
        "new_password_confirm": "NewPass456"
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            # Check old password is correct
            if not user.check_password(serializer.data.get('old_password')):
                return Response({
                    'error': 'Old password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Set new password
            user.set_password(serializer.data.get('new_password'))
            user.save()

            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleLoginAPIView(APIView):
    """
    Login or register user using Google OAuth2
    POST /api/google-login/
    {
        "token": "ya29.a0A... (Google Access Token)"
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        import requests
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch user info using the access token
            user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            response = requests.get(user_info_url, params={'access_token': token})
            
            if not response.ok:
                return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
                
            idinfo = response.json()

            email = idinfo.get('email')
            if not email or not idinfo.get('email_verified', False):
                return Response({'error': 'Google account email is not verified'}, status=status.HTTP_400_BAD_REQUEST)
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            
            # Check if user exists
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Create user
                user = User.objects.create(
                    email=email,
                    username=email.split('@')[0] + str(random.randint(1000, 9999)),
                    first_name=first_name,
                    last_name=last_name,
                    is_verified=True
                )
                user.set_unusable_password()
                user.save()

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Google login successful',
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForgotPasswordAPIView(APIView):
    """
    Forgot Password API
    POST /api/forgot-password/
    {
        "email": "user@example.com"
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            query = urlencode({'uid': uid, 'token': token})
            reset_url = f"{settings.FRONTEND_URL}/reset-password?{query}"
            send_mail(
                'Reset your LabSaathi password',
                (
                    f'Hello {user.first_name or user.username},\n\n'
                    f'Use this secure link to choose a new password:\n{reset_url}\n\n'
                    'If you did not request this, you can ignore this email.'
                ),
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )

        return Response(
            {'message': 'If an account exists with this email, a reset link has been sent.'},
            status=status.HTTP_200_OK,
        )


class ResetPasswordAPIView(APIView):
    """Validate a single-use reset token and save a new password."""
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('new_password')
        confirmation = request.data.get('new_password_confirm')

        if not all([uid, token, password, confirmation]):
            return Response({'error': 'All reset fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if password != confirmation:
            return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is None or not default_token_generator.check_token(user, token):
            return Response({'error': 'This reset link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(password, user=user)
        except ValidationError as error:
            return Response({'error': error.messages}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save(update_fields=['password'])
        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)
