from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import login
import json
from settings.models import PlayerData
from settings.models import MatchData
from settings.models import BrickData
from asgiref.sync import sync_to_async

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
            toAdd_profile = PlayerData.objects.get(username=request.user.username)
            if user_profile:
                if user_profile.username == toAdd_profile.username:
                   return JsonResponse({"error": "you can't add yourself as friend!"})
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
            user_profile = PlayerData.objects.get(username=request.user.username)
            return JsonResponse({'rank': user_profile.position})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to get rank: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def update_rank(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            user_profile = PlayerData.objects.get(username=request.user.username)
            data = PlayerData.objects.all().order_by('-win_rate')
            position = next((i + 1 for i, player in enumerate(data) if player.id == user_profile.id), None)
            user_profile.position = position
            user_profile.save()
            return JsonResponse({'Rank': user_profile.position})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to update_rank: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)            
        
def update_rank_brick(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            user_profile = PlayerData.objects.get(username=request.user.username)
            data = PlayerData.objects.all().order_by('-best_score')
            position = next((i + 1 for i, player in enumerate(data) if player.id == user_profile.id), None)
            user_profile.position_brick = position
            user_profile.save()
            return JsonResponse({'Rank': user_profile.position_brick})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to update_rank_brick: {str(e)}'}, status=400)
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

def get_Nmatches(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user)
            return JsonResponse({'match': user_profile.matches})
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
            user_profile.matches += 1
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
            user_profile.matches += 1
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
            if user_profile.win != 0:
                user_profile.win_rate = user_profile.win / user_profile.matches 
                if user_profile.win_rate > user_profile.max_rate:
                    user_profile.max_rate = user_profile.win_rate
                user_profile.save()
                return JsonResponse({'info': user_profile.win_rate})
            else:
                user_profile.win_rate = 0 
                user_profile.save()
                return JsonResponse({'info': user_profile.win_rate})
        except Exception as e:
            return JsonResponse({"error": f"Failed to update username: {str(e)}"}, status=400)
    else:
        return HttpResponse("Invalid request method.", status=405)

def getUserLang(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user.username)
            if user_profile:
                return JsonResponse({"lang": user_profile.lang})
            else:
                return JsonResponse({"error": "Can't find your profile"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"blbl: {str(e)}"}, status=400)

def setUserLang(request):
    if request.user.is_authenticated:
        try:
            if not request.body:
                return JsonResponse({"error": "Request body is empty"}, status=400)
            data = json.loads(request.body.decode('utf-8'))
            new_lang = data.get('lang', None)

            user_profile = PlayerData.objects.get(username=request.user.username)
            if user_profile:
                user_profile.lang = new_lang
                user_profile.save()
                return JsonResponse({"success": user_profile.lang})
            else:
                return JsonResponse({"error": "Can't find your profile"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"blbl: {str(e)}"}, status=400)

def create_match(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            if not request.body:
                return JsonResponse({"error": "Request body is empty"}, status=400)
            data = json.loads(request.body.decode('utf-8'))
            versus = data.get('opponent', None)
            my_score = data.get('myscore', None)
            opp_score = data.get('oppscore', None)
            if not versus:
                return JsonResponse({"error": "Can't find versus"})
            
            user_profile = PlayerData.objects.get(username=request.user.username)
            match_data = MatchData.objects.create(player=user_profile.id, opponent=versus, myScore=my_score, oppScore=opp_score)
            match_data.save()
            return JsonResponse({"Success": "match created!"})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to create match: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def create_party(request):
    if request.user.is_authenticated and request.method == 'POST':
        try:
            if not request.body:
                return JsonResponse({"error": "Request body is empty"}, status=400)
            data = json.loads(request.body.decode('utf-8'))
            score = data.get('score', None)
            timer = data.get('timer', None)
            if not score:
                return JsonResponse({"error": "Can't find score"})
            
            user_profile = PlayerData.objects.get(username=request.user.username)
            party_data = BrickData.objects.create(player=user_profile.id, score=score, time=timer)
            party_data.save()
            if user_profile.best_score < score:
                user_profile.best_score = score
            user_profile.party += 1
            user_profile.save()
            return JsonResponse({"Success": "party created!"})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to create match: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def get_Lastmatches(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user.username)
            if user_profile:
                matches = MatchData.objects.filter(player=user_profile.id).order_by("-date")[:3]
                if matches:
                    data = [
                        {
                            "opponent":match.opponent,
                            "myScore":match.myScore,
                            "oppScore":match.oppScore,
                        }
                        for match in matches
                    ]
                    return JsonResponse(data, safe=False)
                else:
                    return JsonResponse([], safe=False) 
            else:
                return JsonResponse({"error": "not player find"})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to get last match: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def get_LastGames(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user.username)
            if user_profile:
                games = BrickData.objects.filter(player=user_profile.id).order_by("-date")[:3]
                if games:
                    data = [
                        {
                            "scorebrk":game.score,
                            "timebrk":game.time,
                        }
                        for game in games
                    ]
                    return JsonResponse(data, safe=False)
                else:
                    return JsonResponse([], safe=False) 
            else:
                return JsonResponse({"error": "not player find"})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to get last match: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def get_NumberOne(request):
    try:
        player = PlayerData.objects.all().order_by('-win_rate').first()
        if player:
            return JsonResponse({"username": player.username, "win": player.win, "matches": player.matches})
    except Exception as e:
        print("error::::::::::::::" + str(e))
        return JsonResponse({'error': f'failed to get last match: {str(e)}'}, status=400)

def get_thethree(request):
    try:
        players = PlayerData.objects.all().order_by('-win_rate')[1:]
        if players:
            data = [
                {
                    "username":player.username,
                    "win":player.win,
                    "lose":player.lose,
                    "rate":player.win_rate,
                }
                for player in players
            ]
            return JsonResponse(data, safe=False)
        else:
            return JsonResponse([], safe=False)
    except Exception as e:
        print("error::::::::::::::" + str(e))
        return JsonResponse({'error': f'failed to get the three: {str(e)}'}, status=400)

def get_NumberOneBrick(request):
    try:
        player = PlayerData.objects.all().order_by('-best_score').first()
        if player:
            return JsonResponse({"username": player.username, "score": player.best_score, "matches": player.party})
    except Exception as e:
        print("error::::::::::::::" + str(e))
        return JsonResponse({'error': f'failed to get last match: {str(e)}'}, status=400)

def get_thethreeBrick(request):
    try:
        players = PlayerData.objects.all().order_by('-best_score')[1:]
        if players:
            data = [
                {
                    "username":player.username,
                    "score":player.best_score,
                }
                for player in players
            ]
            return JsonResponse(data, safe=False)
        else:
            return JsonResponse([], safe=False)
    except Exception as e:
        print("error::::::::::::::" + str(e))
        return JsonResponse({'error': f'failed to get the three: {str(e)}'}, status=400)

def get_myStat(request):
    if request.user.is_authenticated:
        try:
            player = PlayerData.objects.get(username=request.user.username)
            if player:
                return JsonResponse({'myRank': player.position, "myWin":player.win, "mylose":player.lose, "myBest":player.max_rate, "myActual":player.win_rate, "myMatch":player.matches})
            else:
                return JsonResponse({"error":"no player find"})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to get my stats: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)

def get_myBrickStat(request):
    if request.user.is_authenticated:
        try:
            user_profile = PlayerData.objects.get(username=request.user.username)
            if user_profile:
                game = BrickData.objects.filter(player=user_profile.id).order_by("-time").first()
                if game:
                    return JsonResponse({'myrank': user_profile.position_brick, "myscore":user_profile.best_score, "mytime":game.time})
                else:
                    return JsonResponse({'myrank': user_profile.position_brick, "myscore":user_profile.best_score, "mytime":None})
            else:
                return JsonResponse({"error":"no player find"})
        except Exception as e:
            print("error::::::::::::::" + str(e))
            return JsonResponse({'error': f'failed to get my stats: {str(e)}'}, status=400)
    return JsonResponse({'error': 'User not authenticated'}, status=400)