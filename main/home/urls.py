from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("404/", views.p404, name="p404"),
]