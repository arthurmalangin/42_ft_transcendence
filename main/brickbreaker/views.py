from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def brickbreaker(request):
	return render(request, 'brickbreaker.html')