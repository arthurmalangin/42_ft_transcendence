from django.urls import path

from . import views

urlpatterns = [
    path("is_auth/", views.is_auth, name="is_auth"),
	path("get_username/", views.get_username, name="get_username"),
]