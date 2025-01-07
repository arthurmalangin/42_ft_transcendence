# rooting.py is used to define the routing configuration for websockets
# it matches specific URLS or URL patterns to a specific consumer.
# as_asgi wraps the base consumer class with ASGI-compatible methods.

from consumers import GameConsumer
from django.urls import re_path

websocket_urlpattern = [
    re_path(r"^pong/game/(?P<room_name>\d+)/$", GameConsumer.as_asgi()),
    # re_path(r"^notifications/(?P<stream>\w+)/$", LongPollConsumer.as_asgi()),
    # re_path(r"", get_asgi_application()),
]