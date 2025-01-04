from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from settings.models import PlayerData
from django.utils import timezone
from django.contrib.auth.signals import user_logged_in, user_logged_out

@receiver(user_logged_in)
def on_user_logged_in(sender, user, request, **kwargs):
    try:
        player = PlayerData.objects.get(username=user)
        player.is_online = True
        player.save()
    except PlayerData.DoesNotExist:
        user = User.objects.get(username=user)


@receiver(user_logged_out)
def on_user_logged_out(sender, user, request, **kwargs):
    try:
        player = PlayerData.objects.get(username=user)
        player.is_online = False
        player.lastConnexion = timezone.now()
        player.save()
    except PlayerData.DoesNotExist:
        user = User.objects.get(username=user)