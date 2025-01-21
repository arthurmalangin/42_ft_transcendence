from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def game(request):
    return render(request, 'game.html')

@login_required
def menu(request):
    return render(request, 'menu.html')