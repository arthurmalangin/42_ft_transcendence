# apps.py used for configuring specif apps, here the "pong" app.
# the default auto field is used for database management. 

from django.apps import AppConfig

class PongConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pong'
