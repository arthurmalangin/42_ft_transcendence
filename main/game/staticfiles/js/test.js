function testWS() {
	// game.js
	const roomName = "123456"; // Exemple de room_name, peut être récupéré dynamiquement
	const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
	const wsUrl = `${wsProtocol}://${window.location.host}/pong/game/${roomName}/`;

	const socket = new WebSocket(wsUrl);

	// Événement lors de l'ouverture de la connexion
	socket.onopen = function (e) {
		console.log("WebSocket connection established!");
		// Envoyer un message au serveur
		socket.send(JSON.stringify({
			message: "Player has joined the game!"
		}));
	};

	// Événement lorsqu'un message est reçu
	socket.onmessage = function (e) {
		const data = JSON.parse(e.data);
		console.log("Message from server:", data.message);

		// Mettre à jour l'interface utilisateur en fonction du message reçu
	};

	// Événement lors de la fermeture de la connexion
	socket.onclose = function (e) {
		console.log("WebSocket connection closed.");
	};

	// Événement en cas d'erreur
	socket.onerror = function (e) {
		console.error("WebSocket error:", e);
	};

	// Pour envoyer un message (exemple à partir d'un bouton ou d'un événement)
	function sendMessage(message) {
		socket.send(JSON.stringify({ message: message }));
	}

}

testWS();