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

//////////////////////////////////////////////////////////////////////////////////
/////////////                       VARIABLES                         ////////////
//////////////////////////////////////////////////////////////////////////////////

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

	let keys = {};

	let powerupsEnabled = false;

	let powerUps = [];
	const powerUpTypes = {
		ENLARGE_PADDLE: 'enlarge_paddle',
		FREEZE_OPPONENT: 'freeze_opponent'
	};

//////////////////////////////////////////////////////////////////////////////////
/////////////                         EVENTS                          ////////////
//////////////////////////////////////////////////////////////////////////////////

	window.addEventListener('keydown', function (e) {
		keys[e.key] = true;
	});

	window.addEventListener('keyup', function (e) {
		keys[e.key] = false;
	});

	document.getElementById('btn_pause').addEventListener('click', pauseGame);

	document.addEventListener('keydown', function(event) {
		if (event.code === 'Space') {
			pauseGame();
		}
	});

	document.getElementById('btn_settings_pong').addEventListener('click', function() {
		if (!isPaused)
			pauseGame();
		document.getElementById('settingsOverlay').style.display = 'flex';
	});
	
	document.getElementById('btn_close_settings_pong').addEventListener('click', function() {
		document.getElementById('settingsOverlay').style.display = 'none';
		pauseGame();
		resetGame(true, false);
	});
	
	function stopEventPropagation(event) {
		const overlay = document.getElementById('settingsOverlay');
		if (overlay.style.display === 'flex') {
			if (event.type === 'click' && event.target.id !== 'btn_close_settings_pong' && event.target.id !== 'enablePowerupsButton') {
				event.stopPropagation();
				event.preventDefault();
			} else if (event.type === 'keydown') {
				const blockedKeys = ['s', 'w', ' '];
				if (blockedKeys.includes(event.key)) {
					event.stopPropagation();
					event.preventDefault();
				}
			}
		}
	}

	document.addEventListener('keydown', stopEventPropagation, true);
	document.addEventListener('click', stopEventPropagation, true);

	const ballSpeedSlider = document.getElementById('ballSpeedSlider');
	ballSpeedSlider.addEventListener('input', function() {
		const newSpeed = ballSpeedSlider.value;
		updateBallSpeed(newSpeed);
	});

	const paddleSpeedSlider = document.getElementById('paddleSpeedSlider');
	paddleSpeedSlider.addEventListener('input', function() {
		const newSpeed = paddleSpeedSlider.value;
		updatePaddleSpeed(newSpeed);
	});

	const enablePowerupsButton = document.getElementById('enablePowerupsButton');
	enablePowerupsButton.addEventListener('click', togglePowerups);

//////////////////////////////////////////////////////////////////////////////////
/////////////                       PONG GAME                         ////////////
//////////////////////////////////////////////////////////////////////////////////

	let isPaused = false;
	let animationFrameId;

	function gameLoop() {
		context.clearRect(0, 0, boardWidth, boardHeight);
	
		moveBall();
		movePowerUps();
		draw();
		updateOpponentPosition();
		updatePaddlePositions();
		checkPowerUpCollisions();
	
		animationFrameId = requestAnimationFrame(gameLoop);
	}

	function startGame() {
		board = document.getElementById('board');
		context = board.getContext('2d');
		board.width = boardWidth;
		board.height = boardHeight;

		animationFrameId = requestAnimationFrame(gameLoop);
	}

	function resetGame(playerLost, spawnPowerUpFlag = true) {
		ball.x = boardWidth / 2 - ball.width / 2;
		ball.y = boardHeight / 2 - ball.height / 2;
		ball.speed = ballSpeed;
		player.height = paddleHeight;
		opponent.height = paddleHeight;

		if (playerLost)
			ball.velocityX = ballSpeed;
		else
			ball.velocityX = -ballSpeed;
		ball.velocityY = 0;

		player.y = boardHeight / 2 - player.height / 2;
		opponent.y = boardHeight / 2 - opponent.height / 2;

		if (spawnPowerUpFlag) {
			spawnPowerUp();
		}
	}

	function pauseGame() {
		if (isPaused) {
			isPaused = false;
			animationFrameId = requestAnimationFrame(gameLoop);
		} else {
			isPaused = true;
			cancelAnimationFrame(animationFrameId);
		}
	}

//////////////////////////////////////////////////////////////////////////////////
/////////////                       DRAW FUNCS                        ////////////
//////////////////////////////////////////////////////////////////////////////////
	
	function draw() {
		context.fillStyle = "#ffffff";
		context.fillRect(player.x, player.y, player.width, player.height);
	
		context.fillStyle = "#00ff00";
		context.fillRect(opponent.x, opponent.y, opponent.width, opponent.height);
	
		context.fillStyle = "#00ff00";
		context.beginPath();
		context.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, 2 * Math.PI);
		context.fill();

		powerUps.forEach(powerUp => {
			context.fillStyle = powerUp.type === powerUpTypes.ENLARGE_PADDLE ? "#ff0000" : "#0000ff";
			context.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
		});
	}
	
	function drawHighlightedPositions() {
		// player's position
		context.fillStyle = "rgba(255, 0, 0, 0.5)";
		context.fillRect(player.x, player.y, player.width, player.height);
	
		// ball's position
		context.fillStyle = "rgba(255, 0, 0, 0.5)";
		context.beginPath();
		context.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, 2 * Math.PI);
		context.fill();
	}

	function drawPredictedTrajectory() {
		let predictedX = ball.x + ball.width / 2;
		let predictedY = ball.y + ball.height / 2;
		let velocityX = ball.velocityX;
		let velocityY = ball.velocityY;
	
		context.strokeStyle = "rgba(255, 0, 0, 0.5)";
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(predictedX, predictedY);
	
		while (predictedX <= 475 && predictedX >= 25) {
			predictedX += velocityX;
			predictedY += velocityY;
	
			if (predictedY <= 0 + ball.height / 2 || predictedY >= boardHeight - ball.height / 2) {
				velocityY = -velocityY;
			}
	
			context.lineTo(predictedX, predictedY);
		}
	
		context.stroke();
	
		// predicted ball position when hitting opponent's paddle 
		context.fillStyle = "rgba(255, 0, 0, 0.5)";
		context.beginPath();
		context.arc(predictedX, predictedY, ball.width / 2, 0, 2 * Math.PI);
		context.fill();
	}

//////////////////////////////////////////////////////////////////////////////////
/////////////                  OBJECT INTERACTIONS                    ////////////
//////////////////////////////////////////////////////////////////////////////////

	function updatePaddlePositions() {
		if (keys['w'] && player.y > 0)
			player.y -= player.speed;
		if (keys['s'] && player.y < boardHeight - player.height)
			player.y += player.speed;
	
		if (keys['ArrowUp'] && opponent.y > 0)
			opponent.y -= opponent.speed;
		if (keys['ArrowDown'] && opponent.y < boardHeight - opponent.height)
			opponent.y += opponent.speed;
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
			resetGame(false);
		}
		if (ball.x + ball.width >= boardWidth) {
			resetGame(true);
		}
	}

//////////////////////////////////////////////////////////////////////////////////
/////////////                    SETTINGS FUNCS                       ////////////
//////////////////////////////////////////////////////////////////////////////////

function updateBallSpeed(speed) {
	ballSpeed = parseFloat(speed);
	ball.speed = ballSpeed;
}

function updatePaddleSpeed(speed) {
	player.speed = parseFloat(speed);
	opponent.speed = parseFloat(speed);
}

//////////////////////////////////////////////////////////////////////////////////
/////////////                   POWER-UPS FUNCTIONS                   ////////////
//////////////////////////////////////////////////////////////////////////////////

function togglePowerups() {
	powerupsEnabled = !powerupsEnabled;
	const button = document.getElementById('enablePowerupsButton');
	button.textContent = powerupsEnabled ? 'DISABLE POWERUPS' : 'ENABLE POWERUPS';

	if (!powerupsEnabled) {
		powerUps = []; // rm all active powerups
	}
}

function spawnPowerUp() {
	if (!powerupsEnabled) return;
	const powerUp = {
		type: Math.random() < 0.5 ? powerUpTypes.ENLARGE_PADDLE : powerUpTypes.FREEZE_OPPONENT,
		x: boardWidth / 2,
		y: boardHeight / 2,
		width: 10,
		height: 10,
		velocityX: Math.random() < 0.5 ? 1 : -1,
		velocityY: Math.random() < 0.5 ? 1 : -1 
	};
	powerUps.push(powerUp);
}

function applyPowerUp(powerUp, player) {
	if (powerUp.type === powerUpTypes.ENLARGE_PADDLE) {
		if (player.y + player.height / 2 >= boardHeight / 2) {
			player.y -= 25;
		}
		player.height += 25;
	} else if (powerUp.type === powerUpTypes.FREEZE_OPPONENT) {
		opponent.speed = 0;
		setTimeout(() => {
			opponent.speed = paddleSpeed;
		}, 3000);
	}
}

function movePowerUps() {
	powerUps.forEach(powerUp => {
		powerUp.x += powerUp.velocityX;
		powerUp.y += powerUp.velocityY;

		// collision check
		if (powerUp.x <= 0 || powerUp.x + powerUp.width >= boardWidth) {
			powerUp.velocityX *= -1;
		}
		if (powerUp.y <= 0 || powerUp.y + powerUp.height >= boardHeight) {
			powerUp.velocityY *= -1;
		}
	});
}

function checkPowerUpCollisions() { // with player/opponent
	powerUps = powerUps.filter(powerUp => {
		if (powerUp.x <= player.x + player.width && powerUp.y + powerUp.height >= player.y && powerUp.y <= player.y + player.height) {
			applyPowerUp(powerUp, player);
			return false;
		}
		if (powerUp.x + powerUp.width >= opponent.x && powerUp.y + powerUp.height >= opponent.y && powerUp.y <= opponent.y + opponent.height) {
			applyPowerUp(powerUp, opponent);
			return false;
		}
		return true;
	});
}

//////////////////////////////////////////////////////////////////////////////////
/////////////                      AI OPPONENT                        ////////////
//////////////////////////////////////////////////////////////////////////////////

	let lastUpdateTime = 0;
	let prevTargetY = boardHeight / 2;

	function updateOpponentPosition() {
		const currentTime = Date.now();
	
		if (!OneSecElapsed(currentTime)) {
			moveTowardsPredictedBall(prevTargetY);
			return;
		}
	
		lastUpdateTime = currentTime;
	
		drawPredictedTrajectory();
		drawHighlightedPositions();
	
		const predictedY = predictBallYAtX(475);
		const playerDistanceFromTop = player.y;
		const playerDistanceFromBottom = boardHeight - (player.y + player.height);
	
		prevTargetY = calculateTargetY(predictedY, playerDistanceFromTop, playerDistanceFromBottom) + (Math.random() - 0.5) * 10;
	
		moveTowardsPredictedBall(prevTargetY);
	}

	function predictBallYAtX(targetX) {
		let predictedX = ball.x + ball.width / 2;
		let predictedY = ball.y + ball.height / 2;
		let velocityX = ball.velocityX;
		let velocityY = ball.velocityY;

		while (predictedX < targetX) {
			predictedX += velocityX;
			predictedY += velocityY;

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

//////////////////////////////////////////////////////////////////////////////////
/////////////                   AI OPPONENT UTILS                     ////////////
//////////////////////////////////////////////////////////////////////////////////

	function OneSecElapsed(currentTime) {
		return currentTime - lastUpdateTime >= 1000;
	}
	
	function calculateDiff(targetY, opponentY) {
		return targetY - (opponentY + opponent.height / 2);
	}

	function moveTowardsPredictedBall(targetY) {
		const diff = calculateDiff(targetY, opponent.y);
		const threshold = paddleSpeed; // threshold to prevent wiggling
	
		updateKeys(diff, threshold);
	
		opponent.y = Math.max(0, Math.min(opponent.y, boardHeight - opponent.height));
	}
	
	function updateKeys(diff, threshold) {
		if (Math.abs(diff) > threshold) {
			if (diff > 0) {
				keys['ArrowDown'] = true;
				keys['ArrowUp'] = false;
			} else if (diff < 0) {
				keys['ArrowUp'] = true;
				keys['ArrowDown'] = false;
			}
		} else {
			keys['ArrowUp'] = false;
			keys['ArrowDown'] = false;
		}
	}
	
	function calculateTargetY(predictedY, playerDistanceFromTop, playerDistanceFromBottom) {
		const playerDistanceFromEdge = Math.min(playerDistanceFromTop, playerDistanceFromBottom) / (boardHeight / 2);
		let targetY;
	
		if (ball.velocityX > 0) { // ball was last hit by the player
			let offset = (1 - playerDistanceFromEdge) * 0.5 * opponent.height;
	
			if (playerDistanceFromTop < playerDistanceFromBottom) {
				targetY = predictedY - offset; // aim for bottom
			} else {
				targetY = predictedY + offset; // aim for top
			}
		} else {
			targetY = boardHeight / 2;
		}
	
		return targetY;
	}

startGame();
}

init_pong();