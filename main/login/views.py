from django.shortcuts import render, redirect
from django.http import HttpResponse
from rest_framework.decorators import api_view, parser_classes
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt


def index(request):
	return render(request, 'index.html')

def register(request):
	return render(request, 'register.html')

@csrf_exempt
@api_view(['POST'])
def reqlogout(request):
    logout(request)
    return HttpResponse("success")
	# return redirect('login')

# if username and password:
# 	if Credential.objects.filter(user_name=username).exists():
# 		return HttpResponse("user deja pris.", status=400)
# 	crednetial = Credential(user_name=username, password=password)
# 	crednetial.save()
@csrf_exempt
@api_view(['POST'])
def reqregister(request):
	username = request.data.get("username")
	email = request.data.get("email") #todo
	password = request.data.get("password")
	if username and password:
		if User.objects.filter(username=username).exists():
			print("User déjà pris.")
			return HttpResponse("User déjà pris.")
		user = User.objects.create_user(username=username, password=password)
		user.save()
		userd = authenticate(request, username=username, password=password)
		if userd is not None:
			login(request, userd)
			return HttpResponse("success")
		else:
			print("register fail ?")
			return HttpResponse("register Fail ?")
		# return HttpResponse("user registered")
	else:
		print("Error: missing password or username.")
		return HttpResponse("Error: missing password or username.")

@api_view(['POST'])
def reqlogin(request):
	username = request.data.get("username")
	email = request.data.get("email")
	password = request.data.get("password")
	if username and password:
		user = authenticate(request, username=username, password=password)
		if user is not None:
			print("yes")
			login(request, user)
			return HttpResponse("success")
		else:
			print("Nom d’utilisateur ou mot de passe incorrect.")
			return HttpResponse("Nom d’utilisateur ou mot de passe incorrect.")
	else:
		print("Error: missing password or username.")
		return HttpResponse("Error: missing password or username.")