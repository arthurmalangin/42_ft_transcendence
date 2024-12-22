from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view, parser_classes
from .models import Credential

def index(request):
	return render(request, 'index.html')

@api_view(['POST'])
def register(request):
	username = request.POST.get("username")
	email = request.POST.get("email") #todo
	password = request.POST.get("password")
	if username and password:
		if Credential.objects.filter(user_name=username).exists():
			return HttpResponse("user deja pris.", status=400)
		crednetial = Credential(user_name=username, password=password)
		crednetial.save()
		return HttpResponse("user registered")
	else:
		return HttpResponse("Error: missing password or username.", status=400)
	#return HttpResponse("Hello, world. You're at the polls index.")

@api_view(['POST'])
def login(request):
	username = request.POST.get("username")
	email = request.POST.get("email")
	password = request.POST.get("password")
	if username and password:
		try:
			credential = Credential.objects.get(user_name=username, password=password)
			return HttpResponse("Login Ok ! Welcome")
		except Credential.DoesNotExist:
			return HttpResponse("Login error.", status=400)
	else:
		return HttpResponse("Error: missing password or username.", status=400)