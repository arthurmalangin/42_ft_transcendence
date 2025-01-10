# This file handles game logic for the game
import threading


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
        
    def execute_party(self):
        print("Start Party !!!")
        
    
    def start_party(self):
        thread = threading.Thread(target=self.execute_party)
        thread.start()
        thread.join()
        print("End thread party...")
    