from django.urls import path

from . import views

urlpatterns = [
    path("is_auth/", views.is_auth, name="is_auth"),
	path("get_username/", views.get_username, name="get_username"),
	path("update_password/", views.update_password, name="update_password"),
	path("update_username/", views.update_username, name="update_username"),
	path("get_avatar/", views.get_avatar, name="get_avatar"),
	path("upload_avatar/", views.upload_avatar, name="upload_avatar"),
]