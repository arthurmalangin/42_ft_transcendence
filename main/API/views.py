from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required


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