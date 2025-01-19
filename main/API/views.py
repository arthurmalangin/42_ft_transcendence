from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import login
import json
from settings.models import PlayerData

def is_auth(request):
    if request.user.is_authenticated:
        return JsonResponse({'is_authenticated': True, 'username': request.user.username})
    else:
        return JsonResponse({'is_authenticated': False})

def get_username(request):
	if request.user.is_authenticated:
		return JsonResponse({'username': request.user.username})
	else:
		return JsonResponse({'username': None})

def update_password(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            new_password = data.get('password', None)
            
            if not new_password:
                return JsonResponse({"error": "Password is required."}, status=400)
            
            request.user.set_password(new_password)
            request.user.save()
            
            login(request, request.user)

            return JsonResponse({"success": "Password updated successfully."})
        
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Failed to update password: {str(e)}"}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=405)

def update_username(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            new_username = data.get('username', None)
			
            if new_username is None:
                return JsonResponse({"error": "Username are required."}, status=400)
            if User.objects.filter(username=new_username).exists():
                return JsonResponse({"error": "Username already use."}, status=400)
            if new_username != request.user.username:
                playerData = PlayerData.objects.get(username=request.user.username)
                playerData.username = new_username
                playerData.save()	
                request.user.username = new_username
                request.user.save()
                login(request, request.user)
                return JsonResponse({"success": "Username updated successfully."})
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Failed to update username: {str(e)}"}, status=400)
    else:
        return HttpResponse("Invalid request method.", status=405)
    
def upload_avatar(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            avatar_base64 = data.get('avatar', None)
            
            if not avatar_base64:
                return JsonResponse({'error': 'No avatar uploaded'}, status=400)

            user_profile = PlayerData.objects.get(username=request.user.username)
            user_profile.avatar_base64 = avatar_base64
            user_profile.save()

            return JsonResponse({'success': 'Avatar uploaded successfully!'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Failed to upload avatar: {str(e)}'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def get_avatar(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user)
            return JsonResponse({'avatar_base64': user_profile.avatar_base64})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'Failed to get avatar: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def user_exist(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            username_to_check = data.get('username', None)
            user = User.objects.filter(username=username_to_check).first()
            if user is not None:
                return JsonResponse({"user_exist": True})
            else:
                return JsonResponse({"user_exist": False})
        except Exception as e:
            return JsonResponse({"error": f"blblbl: {str(e)}"}, status=400)
        
def user_is_42(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            username_to_check = request.user.username
            playerData = PlayerData.objects.filter(username=username_to_check).first()
            if playerData is not None:
                if playerData.is_42 is True:
                    print("User is 42")
                    return JsonResponse({"user_42": True})
                else:
                    print(f"User {username_to_check} is not 42 ")
                    return JsonResponse({"user_42": False})
            else:
                print("Player data not found... ")
                return JsonResponse({"user_42": False})
        except Exception as e:
            return JsonResponse({"error": f"blblbl: {str(e)}"}, status=400)
        
def user_not_friend_exist(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            username_to_check = data.get('username', None)
            user = User.objects.filter(username=username_to_check).first()
            selfUserData = PlayerData.objects.filter(username=request.user.username).first()
            if selfUserData is not None:
                if user is not None and username_to_check not in selfUserData.friendsList:
                    return JsonResponse({"user_exist": True})
                else:
                    return JsonResponse({"user_exist": False})
            else:
                return JsonResponse({"error": f"blblbl: {str(e)}"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"blblbl: {str(e)}"}, status=400)
        
def user_is_online(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            username_to_check = data.get('username', None)
			
            if username_to_check is None:
                return JsonResponse({"error": "Username are required."}, status=400)
            user_profile = PlayerData.objects.get(username=username_to_check)
            if user_profile.is_online:
                return JsonResponse({'is_online': True})
            else:
                return JsonResponse({'is_online': False})
        except Exception as e:
            return JsonResponse({"error": f"blbl: {str(e)}"}, status=400)

def sendRequestFriends(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            new_friend = data.get('new_friend', None)
			
            if new_friend is None:
                return JsonResponse({"error": "Provide name for new friend."}, status=400)
            user_profile = PlayerData.objects.get(username=new_friend)
            if user_profile:
                if user_profile.requestFriendsList:
                    request_friends_list = user_profile.requestFriendsList.split(',')
                    if request.user.username not in request_friends_list:
                        user_profile.requestFriendsList += "," + request.user.username
                        user_profile.save()
                    else:
                        return JsonResponse({"error": "Request Already Send"}, status=400)
                else:
                    user_profile.requestFriendsList = request.user.username
                    user_profile.save()
                return JsonResponse({"success": "okay"})
            else:
                return JsonResponse({"error": "Can't find profile"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"blbl: {str(e)}"}, status=400)
    
def acceptFriendsRequest(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            new_friend = data.get('new_friend', None)
			
            if new_friend is None:
                return JsonResponse({"error": "Provide name for new friend."}, status=400)
            user_profile = PlayerData.objects.get(username=request.user.username)
            toAdd_profile = PlayerData.objects.get(username=new_friend)
            if user_profile and user_profile.requestFriendsList is not None:
                newRequestFriendsList = user_profile.requestFriendsList.split(',')
                if new_friend in newRequestFriendsList:
                    if user_profile.friendsList:
                        user_profile.friendsList += "," + new_friend
                    else:
                        user_profile.friendsList = new_friend
                    newRequestFriendsList.remove(new_friend)
                    user_profile.requestFriendsList = ",".join(newRequestFriendsList)
                    user_profile.save()
                    if toAdd_profile.friendsList:
                        toAdd_profile.friendsList += "," + request.user.username
                    else:
                        toAdd_profile.friendsList = request.user.username
                    toAdd_profile.save()
                return JsonResponse({"success": "okay"})
            else:
                return JsonResponse({"error": "Can't find your profile"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"blbl: {str(e)}"}, status=400)
        
def denyFriendsRequest(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            deny_friend = data.get('deny_friend', None)
			
            if deny_friend is None:
                return JsonResponse({"error": "Provide name for sad no-friend."}, status=400)
            user_profile = PlayerData.objects.get(username=request.user.username)
            if user_profile:
                if user_profile.requestFriendsList:
                    newRequestFriendsList = user_profile.requestFriendsList.split(',')
                    if deny_friend in newRequestFriendsList:
                        newRequestFriendsList.remove(deny_friend)
                        user_profile.requestFriendsList = ",".join(newRequestFriendsList)
                        user_profile.save()
                        return JsonResponse({'success': 'Rm friend success!'})
            else:
                return JsonResponse({"error": "Can't find your profile"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"blbl: {str(e)}"}, status=400)
        
def removeFriends(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            bye_friend = data.get('old_friend', None)
			
            if bye_friend is None:
                return JsonResponse({"error": "Provide name for sad old friend."}, status=400)
            user_profile = PlayerData.objects.get(username=request.user.username)
            if user_profile:
                if user_profile.friendsList:
                    newFriendsList = user_profile.friendsList.split(',')
                    if bye_friend in newFriendsList:
                        newFriendsList.remove(bye_friend)
                        user_profile.friendsList = ",".join(newFriendsList)
                        user_profile.save()
                        return JsonResponse({'success': 'Rm friend success!'})
            else:
                return JsonResponse({"error": "Can't find your profile"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"blbl: {str(e)}"}, status=400)
        
def getFriendsList(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user.username)
            if user_profile:
                return JsonResponse({"friendsList": user_profile.friendsList})
            else:
                return JsonResponse({"error": "Can't find your profile"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"blbl: {str(e)}"}, status=400)
        
def getRequestFriendsList(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user.username)
            if user_profile:
                return JsonResponse({"requestFriendsList": user_profile.requestFriendsList})
            else:
                return JsonResponse({"error": "Can't find your profile"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"blbl: {str(e)}"}, status=400)

def get_rank(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user)
            return JsonResponse({'rank': user_profile.rank})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to get rank: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def get_win(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user)
            return JsonResponse({'win': user_profile.win})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to get win: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def get_lose(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user)
            return JsonResponse({'lose': user_profile.lose})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to get lose: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def get_matches(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user)
            totalMatch = user_profile.lose + user_profile.win
            return JsonResponse({'matches': totalMatch})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to get matches: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def get_win_rate(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user)
            return JsonResponse({'winRate': user_profile.win_rate})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to get win_rate: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def add_win(request):
    if request.user.is_authenticated and request.method =='POST':
        try:
            user_profile = PlayerData.objects.get(username=request.user.username)
            user_profile.win += 1
            user_profile.save()
            return JsonResponse({'info': user_profile.win})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to add win: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def add_lose(request):
    if request.user.is_authenticated and request.method =='POST':
        try:
            user_profile = PlayerData.objects.get(username=request.user.username)
            user_profile.lose += 1
            user_profile.save()
            return JsonResponse({'info': user_profile.lose})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to add lose: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def update_win_rate(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            user_profile = PlayerData.objects.get(username=request.user.username)
            if user_profile.win != 0 and user_profile.lose != 0:
                user_profile.win_rate = user_profile.win / (user_profile.lose + user_profile.win)
                user_profile.save()
                return JsonResponse({'info': user_profile.win_rate})
            if user_profile.win != 0 and user_profile.lose == 0:
                user_profile.win_rate = 1
                user_profile.save()
            else:
                user_profile.win_rate = 0
                user_profile.save()
            return JsonResponse({'info': user_profile.win_rate})
        except Exception as e:
            return JsonResponse({"error": f"Failed to update username: {str(e)}"}, status=400)
    else:
        return HttpResponse("Invalid request method.", status=405)