
class GameEngine:
    def __init__(self):
        players = []
        nbPlayers = 0
        leftPaddleY = 0.00
        rightPaddleY = 0.00
        
    def add_player(self, player):
        if (self.nbPlayers < 2):
            self.players.append(player)
            self.nbPlayers += 1
            return True
        else:
            return False
        
    def start_party(self): # lancer la boucle du jeux dans un autre thread 
        return True