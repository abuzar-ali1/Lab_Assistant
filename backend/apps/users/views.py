from django.shortcuts import render
from rest_framework import viewsets
from .models import User
from .serializer import UserSerializer
from rest_framework.generics import CreateAPIView

# Create your views here.


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserRegisterViewSet(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

