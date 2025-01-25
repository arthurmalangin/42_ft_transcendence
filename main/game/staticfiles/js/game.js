document.addEventListener('game_event', async()=>{
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
			history.pushState(null, '', '/menu');
			loadPage('/menu');
		});

		// const brickbreakerLabel = document.getElementById('btn_brickbreaker');
		// brickbreakerLabel.addEventListener('click', () => {
		// 	history.pushState(null, '', '/brickbreaker');
		// 	loadPage('/brickbreaker');
		// });
	}

	gameEvent();

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                       VARIABLES                         ////////////
	//////////////////////////////////////////////////////////////////////////////////

	function initPong() {

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
		let ballSpeed = 2;

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
		let opponentScore = -1;

		let keys = {};

		let powerUpsEnabled = false;
		let playerFrozen = false;

		let powerUp = null;
		const powerUpTypes = {
			ENLARGE_PADDLE: 'enlarge_paddle',
			FREEZE_OPPONENT: 'freeze_opponent'
		};

		const enlargePaddleImage = new Image();
		enlargePaddleImage.src = '/static/enlarge.svg';

		const freezeOpponentImage = new Image();
		freezeOpponentImage.src = '/static/freeze.svg';


		const FRAME_RATE = 60;
		const FRAME_DURATION = 1000 / FRAME_RATE;
		let gameIntervalId;
		let isPaused = false;

		let AIEnabled = false;

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                         EVENTS                          ////////////
	//////////////////////////////////////////////////////////////////////////////////

		let eventListeners = [];

		function addEventListenerWithTracking(target, type, listener, options = {}) {
			target.addEventListener(type, listener, options);
			eventListeners.push({ target, type, listener });
		}

		function removeAllEventListeners() {
			eventListeners.forEach(({ target, type, listener }) => {
				target.removeEventListener(type, listener);
			});
			eventListeners = [];
		}

		function addAllEventListeners() {
			const navbarElements = [
				'btn_logout',
				'btn_leaderboard',
				'btn_settings',
				'btn_home',
				'btn_friends',
				'btn_game',
			];

			navbarElements.forEach(id => {
				const element = document.getElementById(id);
				if (element)
					addEventListenerWithTracking(element, 'click', cleanupGame);
			});

			addEventListenerWithTracking(window, 'keydown', function (e) {
				if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 's') {
					e.preventDefault();
				}
				keys[e.key] = true;
			});
			
			addEventListenerWithTracking(window, 'keyup', function (e) {
				if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 's') {
					e.preventDefault();
				}
				keys[e.key] = false;
			});

			addEventListenerWithTracking(document.getElementById('btn_pause'), 'click', pauseGame);

			addEventListenerWithTracking(document, 'keydown', function(event) {
				if (event.code === 'Space')
					pauseGame();
				else if (event.code === 'Escape') {
					event.preventDefault();
					const settingsOverlay = document.getElementById('settingsOverlay');
					if (settingsOverlay.classList.contains('active')) {
						settingsOverlay.classList.remove('active');
						pauseGame();
						resetGame(true, false);
					} else {
						if (!isPaused)
							pauseGame();
						settingsOverlay.classList.add('active');
					}
				}
			});

			addEventListenerWithTracking(document.getElementById('btnSettingsPong'), 'click', function() {
				if (!isPaused)
					pauseGame();
				document.getElementById('settingsOverlay').classList.add('active');
			});

			addEventListenerWithTracking(document.getElementById('btnCloseSettingsPong'), 'click', function() {
				document.getElementById('settingsOverlay').classList.remove('active');
				pauseGame();
				resetGame(true, false);
			});

			addEventListenerWithTracking(document.getElementById('btnPlay'), 'click', function() {
                document.getElementById('settingsOverlay').classList.remove('active');
                pauseGame();
                resetGame(true, false);
            });

			function stopEventPropagationSettings(event) {
				const overlay = document.getElementById('settingsOverlay');
				if (overlay && overlay.classList.contains('active')) {
					if (event.type === 'click' &&
						event.target.id !== 'btnCloseSettingsPong' &&
						event.target.id !== 'btnEnablePowerups' &&
						event.target.id !== 'btnResetDefaultSettings' &&
						event.target.id !== 'btnEnableAI' &&
						event.target.id !== 'btnQuitSettings' &&
						event.target.id !== 'btnPlay') {
						event.stopPropagation();
						event.preventDefault();
					} else if (event.type === 'keydown' && [' '].includes(event.key)) {
						event.stopPropagation();
						event.preventDefault();
					}
				}
			}
			
			addEventListenerWithTracking(document, 'keydown', stopEventPropagationSettings, true);
			addEventListenerWithTracking(document, 'click', stopEventPropagationSettings, true);
			
			const ballSpeedSlider = document.getElementById('ballSpeedSlider');
			addEventListenerWithTracking(ballSpeedSlider, 'input', function() {
				const newSpeed = ballSpeedSlider.value;
				updateBallSpeed(newSpeed);
			});
			
			const paddleSpeedSlider = document.getElementById('paddleSpeedSlider');
			addEventListenerWithTracking(paddleSpeedSlider, 'input', function() {
				const newSpeed = paddleSpeedSlider.value;
				updatePaddleSpeed(newSpeed);
			});
			
			const btnEnablePowerups = document.getElementById('btnEnablePowerups');
			addEventListenerWithTracking(btnEnablePowerups, 'click', function() {
				togglePowerups();
			});
			
			const btnEnableAI = document.getElementById('btnEnableAI');
			addEventListenerWithTracking(btnEnableAI, 'click', function() {
				AIEnabled = !AIEnabled;
				btnEnableAI.textContent = AIEnabled ? 'DISABLE AI' : 'ENABLE AI';
			});

			const btnResetDefaultSettings = document.getElementById('btnResetDefaultSettings');
			addEventListenerWithTracking(btnResetDefaultSettings, 'click', function() {
				resetToDefaultSettings();
			});

			const quitButton = document.getElementById('btnQuitSettings');
			addEventListenerWithTracking(quitButton, 'click', function() {
				cleanupGame();
				history.pushState(null, '', '/menu');
				loadPage('/menu');
			});
		}

		addAllEventListeners();

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                       PONG GAME                         ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function gameLoop() {
			context.clearRect(0, 0, boardWidth, boardHeight);

			moveBall();
			movePowerUp();
			draw();
			updateOpponentPosition();
			updatePaddlePositions();
			checkPowerUpCollisions();

			if (playerScore >= 7 || opponentScore >= 7)
				cleanupGame(false);
		}

		function startGame() {
			board = document.getElementById('board');
			context = board.getContext('2d');
			board.width = boardWidth;
			board.height = boardHeight;
		}

		function resetGame(playerLost, spawnPowerUpFlag = true) {
			if (playerScore >= 7 || opponentScore >= 7)
				return;

			if (playerLost) {
				opponentScore++;
				document.getElementById('player2Score').textContent = opponentScore;
			} else {
				playerScore++;
				document.getElementById('player1Score').textContent = playerScore;
			}
		
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
		
			if (spawnPowerUpFlag)
				spawnPowerUp();
		}

		function pauseGame() {
			if (isPaused) {
				isPaused = false;
				gameIntervalId = setInterval(gameLoop, FRAME_DURATION);
			} else {
				isPaused = true;
				clearInterval(gameIntervalId);
			}
		}

		function cleanupGame(fullCleanup = true) {
			resetToDefaultSettings();
			resetGame(true, false);
			removeAllEventListeners();

			if (!isPaused)
				pauseGame();

			if (!fullCleanup)
				gameOver();
		}
			
		function gameOver() {
			const gameResultOverlay = document.getElementById('gameResultOverlay');
			const gameResultMessage = document.getElementById('gameResultMessage');
			if (gameResultOverlay && gameResultMessage) {
				gameResultMessage.textContent = playerScore === 7 ? 'PLAYER WON!' : 'GUEST WON!';
				updateScores(playerScore);
				gameResultOverlay.classList.add('active');
				updateData();
			}
			
			const playAgainButton = document.getElementById('btnPlayAgain');
			if (playAgainButton) {
				playAgainButton.addEventListener('click', () => {
					loadPage('/game');
				});
			}
			
			const quitButton = document.getElementById('btnQuit');
			if (quitButton) {
				quitButton.addEventListener('click', () => {
					history.pushState(null, '', '/menu');
					loadPage('/menu');
				});
			}
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                       DRAW FUNCS                        ////////////
	//////////////////////////////////////////////////////////////////////////////////
		
		function draw() {
			context.fillStyle = "#00ff00";
			context.fillRect(player.x, player.y, player.width, player.height);
			context.fillStyle = "#00ff00";
			context.fillRect(opponent.x, opponent.y, opponent.width, opponent.height);
		
			context.fillStyle = "#00ff00";
			context.beginPath();
			context.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, 2 * Math.PI);
			context.fill();

			if (powerUp) {
				const powerUpImage = powerUp.type === powerUpTypes.ENLARGE_PADDLE ? enlargePaddleImage : freezeOpponentImage;
				context.drawImage(powerUpImage, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
			}
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                  OBJECT INTERACTIONS                    ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function updatePaddlePositions() {
			if (!playerFrozen) {
				if ((keys['w'] || keys['W']) && player.y > 0)
				player.y -= player.speed;
			if ((keys['s'] || keys['S']) && player.y < boardHeight - player.height)
				player.y += player.speed;
			}
		
			if (keys['ArrowUp'] && opponent.y > 0)
				opponent.y -= opponent.speed;
			if (keys['ArrowDown'] && opponent.y < boardHeight - opponent.height)
				opponent.y += opponent.speed;
		}

		function moveBall() {
			ball.x += ball.velocityX;
			ball.y += ball.velocityY;

			if (ball.y <= 0) {
				ball.y = 0;
				ball.velocityY *= -1;
			} else if (ball.y + ball.height >= boardHeight) {
				ball.y = boardHeight - ball.height;
				ball.velocityY *= -1;
			}

			if (ball.x <= player.x + player.width && ball.y + ball.height >= player.y && ball.y <= player.y + player.height)
				handlePaddleCollision(ball, player, true);

			if (ball.x + ball.width >= opponent.x && ball.y + ball.height >= opponent.y && ball.y <= opponent.y + opponent.height)
				handlePaddleCollision(ball, opponent, false);

			// check for point
			if (ball.x <= 0)
				resetGame(true, true);
			if (ball.x + ball.width >= boardWidth)
				resetGame(false, true);
		}

		function handlePaddleCollision(ball, paddle, isPlayer) {
			let intersectY = ball.y + ball.height / 2 - paddle.y - paddle.height / 2;
			let normalizedIntersectY = intersectY / (paddle.height / 2);
			let bounceAngle = normalizedIntersectY * Math.PI / 4;
		
			if (ball.speed < 5) {
				ball.speed += 0.1;
			}
			ball.velocityX = (isPlayer ? 1 : -1) * ball.speed * Math.cos(bounceAngle);
			ball.velocityY = ball.speed * Math.sin(bounceAngle);
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

		function resetToDefaultSettings() {
			powerUpsEnabled = false;
			AIEnabled = false;
			const powerUpButton = document.getElementById('btnEnablePowerups');
			const AIButton = document.getElementById('btnEnableAI');
			powerUpButton.textContent = 'ENABLE POWERUPS';
			AIButton.textContent = 'ENABLE AI';

			updateBallSpeed(2);
			updatePaddleSpeed(2);
			document.getElementById('ballSpeedSlider').value = 2;
			document.getElementById('paddleSpeedSlider').value = 2;
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                   POWER-UPS FUNCTIONS                   ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function togglePowerups() {
			powerUpsEnabled = !powerUpsEnabled;
			const button = document.getElementById('btnEnablePowerups');
			button.textContent = powerUpsEnabled ? 'DISABLE POWERUPS' : 'ENABLE POWERUPS';

			if (!powerUpsEnabled) {
				powerUp = null; // rm all active powerUps
			}
		}

		function spawnPowerUp() {
			if (!powerUpsEnabled || powerUp)
				return;

				powerUp = {
				type: Math.random() < 0.5 ? powerUpTypes.ENLARGE_PADDLE : powerUpTypes.FREEZE_OPPONENT,
				x: boardWidth / 2,
				y: boardHeight / 2,
				width: 10,
				height: 10,
				velocityX: Math.random() < 0.5 ? 1 : -1,
				velocityY: Math.random() < 0.5 ? 1 : -1 
			};
		}

		function applyPowerUp(powerUp, player) {
			if (powerUp.type === powerUpTypes.ENLARGE_PADDLE) {
				if (player.y + player.height / 2 >= boardHeight / 2) {
					player.y -= 25;
				}
				player.height += 25;
			} else if (powerUp.type === powerUpTypes.FREEZE_OPPONENT) {
				if (player === opponent) {
					playerFrozen = true;
					setTimeout(() => {
						playerFrozen = false;
					}, 3000);
				} else {
					opponent.speed = 0;
					setTimeout(() => {
						opponent.speed = paddleSpeed;
					}, 3000);
				}
			}
		}

		function movePowerUp() {
			if (!powerUp)
				return;

			powerUp.x += powerUp.velocityX;
			powerUp.y += powerUp.velocityY;

			// collision check
			if (powerUp.x <= 0 || powerUp.x + powerUp.width >= boardWidth)
				powerUp.velocityX *= -1;
			if (powerUp.y <= 0 || powerUp.y + powerUp.height >= boardHeight)
				powerUp.velocityY *= -1;
		}

		function checkPowerUpCollisions() {
			if (!powerUp)
				return;

			if (powerUp.x <= player.x + player.width && powerUp.y + powerUp.height >= player.y && powerUp.y <= player.y + player.height) {
				applyPowerUp(powerUp, player);
				powerUp = null;
			} else if (powerUp.x + powerUp.width >= opponent.x && powerUp.y + powerUp.height >= opponent.y && powerUp.y <= opponent.y + opponent.height) {
				applyPowerUp(powerUp, opponent);
				powerUp = null;
			}
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                      AI OPPONENT                        ////////////
	//////////////////////////////////////////////////////////////////////////////////

		let lastUpdateTime = 0;
		let prevTargetY = boardHeight / 2;

		function updateOpponentPosition() {
			if (!AIEnabled)
				return;

			const currentTime = Date.now();
		
			if (!OneSecElapsed(currentTime)) {
				moveTowardsTargetY(prevTargetY);
				return;
			}

			console.log("AI: reading gamestate");
			lastUpdateTime = currentTime;
		
			const ballPredictedY = predictBallYAtX(475);
			const pwrPredictedY = predictPowerupYAtX(475);
			const ballPredictedTime = predictBallImpactTime();
			const pwrPredictedTime = predictPowerupImpactTime();
			const playerDistanceFromTop = player.y;
			const playerDistanceFromBottom = boardHeight - (player.y + player.height);

			let targetY;
			let isPowerup = false;

			if (hasTimeForPowerup(ballPredictedTime, pwrPredictedTime, ballPredictedY, pwrPredictedY)) {
				targetY = pwrPredictedY;
				isPowerup = true;
			} else
				targetY = ballPredictedY;
		
			prevTargetY = calculateTargetY(targetY, playerDistanceFromTop, playerDistanceFromBottom, isPowerup) + (Math.random() - 0.5) * 10;		
			moveTowardsTargetY(prevTargetY);
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
				if (predictedY - ball.height / 2 <= 0 || predictedY + ball.height / 2 >= boardHeight)
					velocityY *= -1;
		
				if (predictedX <= 25)
					break;
			}
		
			return predictedY;
		}

		function predictBallImpactTime() {
			let predictedX = ball.x + ball.width / 2;
			let velocityX = ball.velocityX;
			let timeElapsed = 0;
			let maxIterations = 1000;
		
			while (predictedX < 475 && timeElapsed < maxIterations) {
				predictedX += velocityX;
				timeElapsed += 1;
		
				if (predictedX <= 25)
					velocityX *= -1;
				// console.log(timeElapsed);
			}
		
			return timeElapsed;
		}

		function predictPowerupYAtX(targetX) {
			if (!powerUp)
				return 999;

			let predictedX = powerUp.x + powerUp.width / 2;
			let predictedY = powerUp.y + powerUp.height / 2;
			let velocityX = powerUp.velocityX;
			let velocityY = powerUp.velocityY;
		
			while (predictedX < targetX) {
				predictedX += velocityX;
				predictedY += velocityY;
		
				// top and bottom walls collision check
				if (predictedY - powerUp.height / 2 <= 0 || predictedY + powerUp.height / 2 >= boardHeight)
					velocityY *= -1;
		
				if (predictedX <= 0)
					velocityX *= -1;
			}
		
			return predictedY
		}

		function predictPowerupImpactTime() {
			if (!powerUp)
				return 999;
		
			let predictedX = powerUp.x + powerUp.width / 2;
			let velocityX = powerUp.velocityX;
			let timeElapsed = 0;
			let maxIterations = 1000;
		
			while (predictedX < 475 && timeElapsed < maxIterations) {
				predictedX += velocityX;
				timeElapsed += 1;
		
				if (predictedX <= 0)
					velocityX *= -1;
			}

			return timeElapsed;
		}

		function hasTimeForPowerup(ballPredictedTime, pwrPredictedTime, ballPredictedY, pwrPredictedY) {
			if (pwrPredictedTime === 999)
				return false;

			const availableTime = ballPredictedTime - pwrPredictedTime;
			const distanceToPowerup = Math.abs(opponent.y - pwrPredictedY);		
			const distanceToBall = Math.abs(pwrPredictedY - ballPredictedY);
			const timeToBallfromPowerup = distanceToBall / opponent.speed;	
			
			return (timeToBallfromPowerup <= availableTime);
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

		function moveTowardsTargetY(targetY) {
			const diff = calculateDiff(targetY, opponent.y);
			const threshold = paddleSpeed; // threshold to prevent wiggling
		
			updateKeys(diff, threshold);
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
		
		function calculateTargetY(predictedY, playerDistanceFromTop, playerDistanceFromBottom, isPowerup) {
			const playerDistanceFromEdge = Math.min(playerDistanceFromTop, playerDistanceFromBottom) / (boardHeight / 2);
			let targetY;
		
			if (isPowerup)
				targetY = predictedY;
			else {
				if (ball.velocityX > 0) { // ball was last hit by the player
					let offset = (1 - playerDistanceFromEdge) * 0.5 * opponent.height;
		
					if (playerDistanceFromTop < playerDistanceFromBottom)
						targetY = predictedY - offset; // aim for bottom
					else
						targetY = predictedY + offset; // aim for top
				} else
					targetY = boardHeight / 2;
			}
		
			return targetY;
		}

		startGame();
		pauseGame();
	}

	initPong();
})

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                      UPDATE DATA                        ////////////
	//////////////////////////////////////////////////////////////////////////////////

	async function updateScores(playerScore){
		if(playerScore == 7)
			try{
				const response = await fetch('/api/add_win/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': getCSRFToken()
					}
				});
				if (!response.ok) {
					throw new Error(`Erreur API : ${response.statusText}`);
				}
			} catch (error) {
				console.error('Erreur lors de l’appel API :', error);
			}
		else
		try{
			const response = await fetch('/api/add_lose/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});
			if (!response.ok) {
				throw new Error(`Erreur API : ${response.statusText}`);
			}
		} catch (error) {
			console.error('Erreur lors de l’appel API :', error);
		}
	}

	async function updateData(){
		try{
			const response = await fetch('/api/update_win_rate/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});
			if (!response.ok) {
				throw new Error(`Erreur API : ${response.statusText}`);
			}
		} catch (error) {
			console.error('Erreur lors de l’appel API :', error);
		}
	}
		
