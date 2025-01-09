from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
	path('reqregister/', views.reqregister, name="reqregister"),
	path('reqlogin/', views.reqlogin, name="reqlogin"),
	path('reqlogin42/', views.reqlogin42, name="reqlogin42"),
	path('register/', views.register, name="register"),
	path('logout/', views.reqlogout, name="logout")
]