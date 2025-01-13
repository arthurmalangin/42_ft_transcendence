from django.urls import path

from . import views

urlpatterns = [
    path('', views.brickbreaker, name='brickbreaker'),
]