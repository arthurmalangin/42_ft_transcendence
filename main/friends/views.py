from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def friends(request):
	return render(request, 'friends.html')