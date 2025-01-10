import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .GameEngine import GameEngine

# index room_name
game_engines = {}

class GameConsumer(AsyncWebsocketConsumer):
    #si variable def ici, tout les ws seront partager avec cette variable
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        
        if self.room_name not in game_engines:
            game_engines[self.room_name] = GameEngine()

        self.game_engine = game_engines[self.room_name]

        self.player_name = self.scope['user'].username

        if self.game_engine.add_player(self.player_name):
            print(f"{self.player_name} join Party :  {self.room_name}")
        else:
            print(f"Party {self.room_name} full, {self.player_name} cannot join !")
        
        if len(self.game_engine.players) == 2:
            self.game_engine.start_party()

        self.room_group_name = f"game_{self.room_name}"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        if self.player_name in self.game_engine.players:
            self.game_engine.players.remove(self.player_name)
            print(f"{self.player_name} leave the partie {self.room_name}")
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Recevoir un message du client et le renvoyer à tous les clients dans le groupe"""
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_message',
                'message': message
            }
        )

    async def game_message(self, event):
        """Repondre aux messages du groupe"""
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))
