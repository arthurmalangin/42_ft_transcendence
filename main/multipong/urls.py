from django.urls import path

from . import views

urlpatterns = [
    path('', views.multipong, name='multipong'),
]