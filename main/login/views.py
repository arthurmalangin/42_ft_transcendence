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
from django.contrib.auth.hashers import make_password
<<<<<<< Updated upstream
=======
from requests.exceptions import ConnectionError, RequestException


# Initialise environ
env = environ.Env(
    DEBUG=(bool, False)
)

# settup the vault client
client = hvac.Client(
    url='https://vault:8200',
    token= env('VAULT_DEV_ROOT_TOKEN_ID'),
)

# Function to get secret from Vault
def get_vault_secret(path, key):
    try:
        secret = client.secrets.kv.v2.read_secret_version(path=path)
        return secret['data']['data'][key]
    except (ConnectionError, RequestException) as e:
        print(f'Failed to connect to Vault server: {e}')
        return None
>>>>>>> Stashed changes

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
	email = username
	password = request.data.get("password")
	if username and password:
		if User.objects.filter(username=username).exists():
			print("User déjà pris.")
			return HttpResponse("User déjà pris.")
		user = User.objects.create_user(username=username, password=password)
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
	token = _getToken("https://181.214.189.28/srclogin/reqlogin42/", request.query_params["code"])
	# print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa : " + request.query_params["code"])
	user_info = _get42Info(token)
	username = user_info['login']
	print(user_info)
	print("logsin 42 is :" + username)
	user = _login42(username, token)
	if user:
		print("yes")
		login(request, user)
		return (redirect('https://181.214.189.28/'))
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


def _get42Info(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get('https://api.intra.42.fr/v2/me', headers=headers)
    return (response.json())

def _getApiToken():
    body = {
        "grant_type": "client_credentials",
        "client_id": "u-s4t2ud-53158e8ed2199eb8c7fd7bfa6e9909286f03eebc6c40f2868592dc4af0c69174",
        "client_secret": "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"
    }
    headers = {"Content-Type": "application/json; charset=utf-8"}
    response = requests.post('https://api.intra.42.fr/oauth/token', headers=headers, json=body)
    return (response.json().get("access_token"))

def _getToken(reurl, code):
    # POST https://api.intra.42.fr/oauth/token
    # in body:
    # 	grant_type = client_credentials
    #	client_id = u-s4t2ud-53158e8ed2199eb8c7fd7bfa6e9909286f03eebc6c40f2868592dc4af0c69174
    #	client_secret = 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
    # return access_token
    body = {
        "grant_type": "authorization_code",
        "client_id": "u-s4t2ud-53158e8ed2199eb8c7fd7bfa6e9909286f03eebc6c40f2868592dc4af0c69174",
        "client_secret": "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",
        "code": code,
        "redirect_uri": reurl
    }
    headers = {"Content-Type": "application/json; charset=utf-8"}
    response = requests.post('https://api.intra.42.fr/oauth/token', headers=headers, json=body)
    return (response.json().get("access_token"))