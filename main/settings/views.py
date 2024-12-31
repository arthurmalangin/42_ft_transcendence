from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def settings(request):
	return render(request, 'settings.html')