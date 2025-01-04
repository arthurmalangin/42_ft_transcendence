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

