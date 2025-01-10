from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def home(request):
	return render(request, 'home.html')

def p404(request):
    return render(request, '404.html')