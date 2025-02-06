from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def tourbrickbreaker(request):
	return render(request, 'tourbrickbreaker.html')