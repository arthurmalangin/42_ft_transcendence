from django.shortcuts import render, redirect
from django.http import HttpResponse
from rest_framework.decorators import api_view, parser_classes
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from settings.models import PlayerData
from settings.models import MatchData
from settings.models import BrickData
import requests
import base64
import os
import hvac
from django.contrib.auth.hashers import make_password
from requests.exceptions import ConnectionError, RequestException

import warnings
import urllib3

# Désactiver les avertissements de type SSL
warnings.filterwarnings("ignore", category=urllib3.exceptions.InsecureRequestWarning)

token_file_path = '/shared-volume/token.txt'

def get_token(file_path):
    try:
        with open(file_path, 'r') as f:
            token = f.read().strip()
        if not token:
            print("Token is empty in the file.")
            return None
        return token
    except FileNotFoundError:
        print(f"Token file not found at {file_path}.")
        return None
    except Exception as e:
        print(f"Error when reading file: {str(e)}")
        return None

token = get_token(token_file_path)

if not token:
    print("No valid token found. Exiting.")
    exit(1)

client = hvac.Client(
    url='https://vault:8200',
    token=token,
	verify=False,
)

# Function to get secret from Vault
def get_vault_secret(path, key):
    try:
        secret = client.secrets.kv.v2.read_secret_version(path=path)
        return secret['data']['data'][key]
    except (ConnectionError, RequestException) as e:
        print(f'Failed to connect to Vault server: {e}')
        return None

def index(request):
	print("login render html call !")
	return render(request, 'login.html')

def register(request):
	return render(request, 'register.html')

@csrf_exempt
@api_view(['POST'])
def reqlogout(request):
    logout(request)
    return HttpResponse("success")

@csrf_exempt
@api_view(['POST'])
def reqregister(request):
	username = request.data.get("username")
	email = username
	password = request.data.get("password")
	if username and password:
		if User.objects.filter(username=username).exists():
			print("User déjà pris.")
			return HttpResponse("User déjà pris.")
		user = User.objects.create_user(username=username, password=password) #  hash auto en sha256
		user.save()
		player_data = PlayerData.objects.create(username=user.username, email=email)
		player_data.is_42 = False
		player_data.save()
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

@api_view(['GET'])
def reqlogin42(request):
	token = _getToken("https://127.0.0.1/srclogin/reqlogin42/", request.query_params["code"])
	# print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasaaaaaaaaaaaa : " + request.query_params["code"])
	user_info = _get42Info(token)
 
	# print("DEBUG reqlogin42: user_info:", user_info)

	if 'login' not in user_info:
		print("Error: login is not in user_info")
		return HttpResponse("Error: login is not in user_info", status=500)

	username = user_info['login']
	print(user_info)
	print("logsin 42 is :" + username)
	user = _login42(username, token)
	if user:
		print("yes")
		login(request, user)
		return (redirect('https://127.0.0.1/'))
	else:
		print("Error: user not set.")
		return HttpResponse("Error: user not set.")

def _login42(username, token):
	if User.objects.filter(username=username).exists():
		user = User.objects.get(username=username)
		user.set_password(make_password(token))
		user.save()
		return (user)
	else:
		user = User.objects.create_user(username=username, email=username, password=make_password(token))
		pdata = PlayerData.objects.create(username=username, email=username)
		pdata.is_42 = True
		user_info = _get42Info(token)
		_updateAvatar42Img(pdata, user_info['image']['versions']['medium'])
		pdata.save()
		return (user)

def _updateAvatar42Img(pdata, linkIntraPics):
	response_img = requests.get(linkIntraPics)
	
	if response_img.status_code == 200:
		image_base64 = base64.b64encode(response_img.content).decode('utf-8')
		pdata.avatar_base64 = image_base64
		print(image_base64)
	else:
		print("Erreur lors de la récupération de l'image.")


# Récupérer les secrets depuis Vault
CLIENT_42_ID=get_vault_secret('42_API/credentials', 'client_id')
API_42_SC=get_vault_secret('42_API/credentials', 'API_secret')
CLIENT_42_SC=get_vault_secret('42_API/credentials', 'client_secret')

def _get42Info(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get('https://api.intra.42.fr/v2/me', headers=headers)
    return (response.json())

def _getApiToken():
    body = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_42_ID,
        "client_secret": API_42_SC
    }
    headers = {"Content-Type": "application/json; charset=utf-8"}
    response = requests.post('https://api.intra.42.fr/oauth/token', headers=headers, json=body)
    return (response.json().get("access_token"))

def _getToken(reurl, code):
    # POST https://api.intra.42.fr/oauth/token
    # in body:
    # 	grant_type = client_credentials
    #	client_id = api uuid
    #	client_secret = api secret
    # return access_token
    body = {
        "grant_type": "authorization_code",
        "client_id": CLIENT_42_ID,
        "client_secret": CLIENT_42_SC,
        "code": code,
        "redirect_uri": reurl
    }
    headers = {"Content-Type": "application/json; charset=utf-8"}
    response = requests.post('https://api.intra.42.fr/oauth/token', headers=headers, json=body)
    return (response.json().get("access_token"))