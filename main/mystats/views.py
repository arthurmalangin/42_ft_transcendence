from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def mystats(request):
	return render(request, 'mystats.html')