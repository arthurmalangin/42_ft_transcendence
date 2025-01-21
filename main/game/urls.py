from django.urls import path

from . import views

urlpatterns = [
    path('', views.game, name='game'),
    path('menu/', views.menu, name='menu'),
]