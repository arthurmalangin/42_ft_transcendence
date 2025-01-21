from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def multipong(request):
	return render(request, 'multipong.html')