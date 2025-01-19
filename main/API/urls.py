from django.urls import path

from . import views

urlpatterns = [
    path("is_auth/", views.is_auth, name="is_auth"),
	path("get_username/", views.get_username, name="get_username"),
	path("update_password/", views.update_password, name="update_password"),
	path("update_username/", views.update_username, name="update_username"),
	path("get_avatar/", views.get_avatar, name="get_avatar"),
	path("upload_avatar/", views.upload_avatar, name="upload_avatar"),
	path("user_is_online/", views.user_is_online, name="user_is_online"),
	path("acceptFriendsRequest/", views.acceptFriendsRequest, name="acceptFriendsRequest"),
	path("denyFriendsRequest/", views.denyFriendsRequest, name="denyFriendsRequest"),
	path("removeFriends/", views.removeFriends, name="removeFriends"),
	path("getFriendsList/", views.getFriendsList, name="getFriendsList"),
	path("getRequestFriendsList/", views.getRequestFriendsList, name="getRequestFriendsList"),
	path("user_exist/", views.user_exist, name="user_exist"),
	path("user_not_friend_exist/", views.user_not_friend_exist, name="user_not_friend_exist"),
	path("sendRequestFriends/", views.sendRequestFriends, name="sendRequestFriends"),
	path("user_is_42/", views.user_is_42, name="user_is_42"),
	path("getUserLang/", views.getUserLang, name="getUserLang"),
	path("setUserLang/", views.setUserLang, name="setUserLang"),
	path("get_rank/", views.get_rank, name="get_rank"),
	path("get_win/", views.get_win, name="get_win"),
	path("get_lose/", views.get_lose, name="get_lose"),
	path("get_matches/", views.get_matches, name="get_matches"),
	path("get_win_rate/", views.get_win_rate, name="get_win_rate"),
	path("add_win/", views.add_win, name="add_win"),
	path("add_lose/", views.add_lose, name="add_lose"),
	path("update_win_rate/", views.update_win_rate, name="update_win_rate"),
]