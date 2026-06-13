from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import re

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user data (without password)
    Used in responses to return user info safely
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'phone', 'is_verified', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_verified']


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    Validates email, password, and creates the user
    """
    password = serializers.CharField(
        write_only=True,  # Don't return password in response
        min_length=8,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate_email(self, value):
        """Validate email format and uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value.lower()

    def validate_username(self, value):
        """Validate username is unique"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_password(self, value):
        """Validate password strength"""
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters.")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain uppercase letters.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain numbers.")
        return value

    def validate(self, data):
        """Check passwords match"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password_confirm')  
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer for login
    Returns user info along with access/refresh tokens
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims to the token
        token['email'] = user.email
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user info to response
        data['user'] = UserSerializer(self.user).data
        return data


class TokenRefreshSerializer(serializers.Serializer):
    """
    Serializer for refreshing access token
    Takes refresh token and returns new access token
    """
    refresh = serializers.CharField()

    def validate_refresh(self, value):
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            RefreshToken(value)
        except Exception:
            raise serializers.ValidationError("Invalid refresh token.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password
    """
    old_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        return data