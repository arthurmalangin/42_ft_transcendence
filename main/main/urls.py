"""
URL configuration for main project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path


urlpatterns = [
	path('home/', include("home.urls")),
	path('srcleaderboard/', include("leaderboard.urls")),
	path('srclogin/', include("login.urls")),
	path('srcsettings/', include("settings.urls")),
	path('srcfriends/', include("friends.urls")),
	path('srcgame/', include("game.urls")),
	path('srcbrickbreaker/', include("brickbreaker.urls")),
	path('srcmystats/', include("mystats.urls")),
	path('srcmultipong/', include("multipong.urls")),
	path('srctourpong/', include("tourpong.urls")),
	path('srctourbrickbreaker/', include("tourbrickbreaker.urls")),
	path('api/', include("API.urls")),
    path('admin/', admin.site.urls),
]
