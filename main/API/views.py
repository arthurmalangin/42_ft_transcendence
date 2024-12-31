from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import login
import json


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