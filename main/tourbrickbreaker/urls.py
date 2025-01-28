from django.urls import path

from . import views

urlpatterns = [
    path('', views.tourbrickbreaker, name='tourbrickbreaker'),
]