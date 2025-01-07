function gameEvent() {
	const registerLabel = document.getElementById('btn_logout');
	registerLabel.addEventListener('click', () => {
		logout();
	});

	const leaderboardLabel = document.getElementById('btn_leaderboard');
	leaderboardLabel.addEventListener('click', () => {
		history.pushState(null, '', '/leaderboard');
		loadPage('/leaderboard');
	});

	const settingsLabel = document.getElementById('btn_settings');
	settingsLabel.addEventListener('click', () => {
		history.pushState(null, '', '/');
		loadPage('/settings');
	});

	const homeLabel = document.getElementById('btn_home');
	homeLabel.addEventListener('click', () => {
		history.pushState(null, '', '/');
		loadPage('/');
	});

	const friendsLabel = document.getElementById('btn_friends');
	friendsLabel.addEventListener('click', () => {
		history.pushState(null, '', '/friends');
		loadPage('/friends');
	});

	const gameLabel = document.getElementById('btn_game');
	gameLabel.addEventListener('click', () => {
		history.pushState(null, '', '/game');
		loadPage('/game');
	});
}

gameEvent();

function init_pong() {

	let board;
	let boardWidth = 500;
	let boardHeight = 500;
	let context;

	let paddleWidth = 10;
	let paddleHeight = 50;
	let paddleSpeed = 2;

	let player = {
		width: paddleWidth,
		height: paddleHeight,
		speed: paddleSpeed,
		x: 10,
		y: boardHeight / 2 - paddleHeight / 2
	};

	let opponent = {
		width: paddleWidth,
		height: paddleHeight,
		speed: paddleSpeed,
		x: boardWidth - paddleWidth - 10,
		y: boardHeight / 2 - paddleHeight / 2
	};

	let ballWidth = 10;
	let ballHeight = 10;
	let ballSpeed = 3;

	let ball = {
		width: ballWidth,
		height: ballHeight,
		speed: ballSpeed,
		velocityX: -ballSpeed, // set up first ball behavior
		velocityY: 0,
		x: boardWidth / 2 - ballWidth / 2,
		y: boardHeight / 2 - ballHeight / 2
	};

	let playerScore = 0;
	let opponentScore = 0;

	let keys = {};

	window.addEventListener('keydown', function (e) {
		keys[e.key] = true;
	});

	window.addEventListener('keyup', function (e) {
		keys[e.key] = false;
	});

	function updatePaddlePositions() {
		if (keys['w'] && player.y > 0)
			player.y -= player.speed;
		if (keys['s'] && player.y < boardHeight - player.height)
			player.y += player.speed;
	}

	function gameLoop() {
		updatePaddlePositions();
		updateOpponentPosition();
		moveBall();

		context.clearRect(0, 0, boardWidth, boardHeight);
		draw();

		requestAnimationFrame(gameLoop);
	}

	function draw() {
		context.fillStyle = "#ffffff";
		context.fillRect(player.x, player.y, player.width, player.height);

		context.fillStyle = "#00ff00";
		context.fillRect(opponent.x, opponent.y, opponent.width, opponent.height);

		context.fillStyle = "#00ff00";
		context.beginPath();
		context.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, 2 * Math.PI);
		context.fill();

		document.getElementById('playerScore').innerText = "Player: " + playerScore;
		document.getElementById('opponentScore').innerText = "Opponent: " + opponentScore;
	}

	// let previousPlayerScore = 0;
	// let previousOpponentScore = 0;

	function draw() {
		context.fillStyle = "#ffffff";
		context.fillRect(player.x, player.y, player.width, player.height);

		context.fillStyle = "#00ff00";
		context.fillRect(opponent.x, opponent.y, opponent.width, opponent.height);

		context.fillStyle = "#00ff00";
		context.beginPath();
		context.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, 2 * Math.PI);
		context.fill();

		// const playerScoreElement = document.getElementById('playerScore');
		// const opponentScoreElement = document.getElementById('opponentScore');

		// if (playerScoreElement && opponentScoreElement) {
			// if (playerScore !== previousPlayerScore) {
				// playerScoreElement.innerText = "Player: " + playerScore;
				// previousPlayerScore = playerScore;
			// }
			// if (opponentScore !== previousOpponentScore) {
				// opponentScoreElement.innerText = "Opponent: " + opponentScore;
				// previousOpponentScore = opponentScore;
			// }
		// }
	}

	function startGame() {
		board = document.getElementById('board');
		context = board.getContext('2d');
		board.width = boardWidth;
		board.height = boardHeight;

		requestAnimationFrame(gameLoop);
	}

	function resetGame(playerLost) {
		ball.x = boardWidth / 2 - ball.width / 2;
		ball.y = boardHeight / 2 - ball.height / 2;
		ball.speed = ballSpeed;

		if (playerLost)
			ball.velocityX = ballSpeed;
		else
			ball.velocityX = -ballSpeed;
		ball.velocityY = 0;

		player.y = boardHeight / 2 - player.height / 2;
		opponent.y = boardHeight / 2 - opponent.height / 2;
	}

	function isNextOutOfBounds(paddle, sign) {
		if ((sign == '-' && paddle.y - paddle.speed < 0) ||
			(sign == '+' && paddle.y + paddle.height + paddle.speed > boardHeight))
			return true;
		return false;
	}

	function moveBall() {
		ball.x += ball.velocityX;
		ball.y += ball.velocityY;

		if (ball.y <= 0 || ball.y + ball.height >= boardHeight)
			ball.velocityY *= -1

		// player
		if (ball.x <= player.x + player.width && ball.y + ball.height >= player.y && ball.y <= player.y + player.height) {
			let intersectY = ball.y + ball.height / 2 - player.y - player.height / 2;
			let normalizedIntersectY = intersectY / (player.height / 2);
			let bounceAngle = normalizedIntersectY * Math.PI / 4;

			if (ball.speed < 12)
				ball.speed += 0.1;
			ball.velocityX = ball.speed * Math.cos(bounceAngle);
			ball.velocityY = ball.speed * Math.sin(bounceAngle);
		}

		// opponent
		if (ball.x + ball.width >= opponent.x && ball.y + ball.height >= opponent.y && ball.y <= opponent.y + opponent.height) {
			let intersectY = ball.y + ball.height / 2 - opponent.y - opponent.height / 2;
			let normalizedIntersectY = intersectY / (opponent.height / 2);
			let bounceAngle = normalizedIntersectY * Math.PI / 4;

			if (ball.speed < 12)
				ball.speed += 0.1;
			ball.velocityX = -ball.speed * Math.cos(bounceAngle);
			ball.velocityY = ball.speed * Math.sin(bounceAngle);
		}

		// check for point
		if (ball.x <= 0) {
			opponentScore++;
			resetGame(false);
		}
		if (ball.x + ball.width >= boardWidth) {
			playerScore++;
			resetGame(true);
		}
	}

	// AI opponent

	function updateOpponentPosition() {
		const predictedY = predictBallYAtX(475);
		const playerDistanceFromTop = player.y;
		const playerDistanceFromBottom = boardHeight - (player.y + player.height);
		const playerDistanceFromEdge = Math.min(playerDistanceFromTop, playerDistanceFromBottom) / (boardHeight / 2);

		let targetY;

		if (ball.velocityX > 0) { // ball was last hit by player
			// aim where player isn't
			let offset = (1 - playerDistanceFromEdge) * 0.5 * opponent.height;

			// offset paddle accordingly
			if (playerDistanceFromTop < playerDistanceFromBottom) {
				targetY = predictedY - offset; // aim for bottom
			} else {
				targetY = predictedY + offset; // aim for top
			}
		} else {
			targetY = boardHeight / 2;
		}

		const diff = targetY - (opponent.y + opponent.height / 2);

		if (diff > 0) {
			opponent.y += paddleSpeed;
		} else if (diff < 0) {
			opponent.y -= paddleSpeed;
		}

		opponent.y = Math.max(0, Math.min(opponent.y, boardHeight - opponent.height));
	}

	function updateOpponentPosition() {
		const predictedY = predictBallYAtX(475);
		const playerDistanceFromTop = player.y;
		const playerDistanceFromBottom = boardHeight - (player.y + player.height);
		const playerDistanceFromEdge = Math.min(playerDistanceFromTop, playerDistanceFromBottom) / (boardHeight / 2);

		let targetY;

		if (ball.velocityX > 0) { // ball was last hit by the player
			// aim where player isn't
			let offset = (1 - playerDistanceFromEdge) * 0.5 * opponent.height;

			// offset paddle accordingly
			if (playerDistanceFromTop < playerDistanceFromBottom) {
				targetY = predictedY - offset; // aim for bottom
			} else {
				targetY = predictedY + offset; // aim for top
			}
		} else {
			targetY = boardHeight / 2;
		}

		const diff = targetY - (opponent.y + opponent.height / 2);
		const threshold = paddleSpeed * 2; // threshold to prevent small movements/wiggling

		if (Math.abs(diff) > threshold) {
			if (diff > 0) {
				opponent.y += paddleSpeed;
			} else if (diff < 0) {
				opponent.y -= paddleSpeed;
			}
		}

		opponent.y = Math.max(0, Math.min(opponent.y, boardHeight - opponent.height));
	}

	function predictBallYAtX(targetX) {
		let predictedX = ball.x + ball.width / 2;
		let predictedY = ball.y + ball.height / 2;
		let velocityX = ball.velocityX;
		let velocityY = ball.velocityY;
		const predictionInterval = 1000; // prediction interval

		while (predictedX < targetX) {
			predictedX += velocityX * (predictionInterval / 1000);
			predictedY += velocityY * (predictionInterval / 1000);

			// top and bottom walls collision check
			if (predictedY - ball.height / 2 <= 0 || predictedY + ball.height / 2 >= boardHeight) {
				velocityY *= -1;
			}

			if (predictedX <= 0) {
				break;
			}
		}

		return predictedY;
	}
	startGame();
}

init_pong();