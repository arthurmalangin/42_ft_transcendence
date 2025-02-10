document.addEventListener('tourbrickbreaker_event', async()=>{
	function tourbrickbreakerEvent() {
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

	tourbrickbreakerEvent();

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                       VARIABLES                         ////////////
	//////////////////////////////////////////////////////////////////////////////////

	function initBrickbreaker() {
		let board;
		let boardWidth = 600;
		let boardHeight = 500;
		let context;

		let paddleWidth = 50;
		let paddleHeight = 10;
		let paddleSpeed = 2;

		let lives = 999;
		let playerScore = 0;
		let guestScore = 0;

		let player = {
			width: paddleWidth,
			height: paddleHeight,
			speed: paddleSpeed,
			lives: lives,
			x: 175,
			y: 490 - paddleHeight
		};

		let guest = {
			width: paddleWidth,
			height: paddleHeight,
			speed: paddleSpeed,
			lives: lives,
			x: 375,
			y: 490 - paddleHeight
		};

		let playerCount = 4;

		let ballWidth = 10;
		let ballHeight = 10;
		let ballSpeed = 2;

		let ball1 = {
			width: ballWidth,
			height: ballHeight,
			speed: ballSpeed,
			velocityX: 0,
			velocityY: -ballSpeed,
			x: boardWidth / 2 - ballWidth / 2,
			y: 490 - ballHeight - paddleHeight,
			lastTouch: player,
			onFire: false,
		};

		let ball2 = {
			width: ballWidth,
			height: ballHeight,
			speed: ballSpeed,
			velocityX: 0,
			velocityY: -ballSpeed,
			x: boardWidth / 2 - ballWidth / 2,
			y: 490 - ballHeight - paddleHeight,
			lastTouch: guest,
			onFire: false,
		};

		let bricks = [];
		const brickWidth = 50;
		const brickHeight = 20;
		const brickTypes = [
			{ type: 1, color: "rgba(0, 255, 0, 0.3)", hitPoints: 1 },
			{ type: 2, color: "rgba(0, 255, 0, 0.6)", hitPoints: 2 },
			{ type: 3, color: "rgba(0, 255, 0, 1)", hitPoints: 3 }
		];

		let powerUpsEnabled = false;
		
		let powerUp = null;
		const powerUpTypes = {
			FIREBALL: 'fireball',
			ENLARGE_PADDLE: 'enlarge_paddle'
		};

		const fireballImage = new Image();
		fireballImage.src = '/static/fireball.svg';

		const enlargePaddleImage = new Image();
		enlargePaddleImage.src = '/static/enlarge.svg';

		let totalTime = 0;
		let cooldownTime = 0;
		let lastGameAction = 0;

		let isGameOver = false;

		let keys = {};

		const FRAME_RATE = 60;
		const FRAME_DURATION = 1000 / FRAME_RATE;
		let gameIntervalId;
		let isPaused = false;

		let matchups = [];
		let participants = [];

		let playerSide;
		let guestSide;

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
			document.removeEventListener('tourbrickbreaker_event', async () => {});
		}

		function addAllEventListeners() {
			const navbarElements = [
				'btn_logout',
				'btn_leaderboard',
				'btn_settings',
				'btn_home',
				'btn_friends',
				'btn_game'
			];

			navbarElements.forEach(id => {
				const element = document.getElementById(id);
				if (element)
					addEventListenerWithTracking(element, 'click', cleanupGame);
			});

			addEventListenerWithTracking(window, 'keydown', function (e) {
				keys[e.key] = true;
			});

			addEventListenerWithTracking(window, 'keyup', function (e) {
				keys[e.key] = false;
			});

			addEventListenerWithTracking(document.getElementById('btnPause'), 'click', pauseGame);

			addEventListenerWithTracking(document, 'keydown', function(event) {
				if (event.code === 'Space' && !gameResultOverlay.classList.contains('active')) {
					// startGame();
					pauseGame();
				}
			});

			addEventListenerWithTracking(document.getElementById('btnPlay'), 'click', function() {
                document.getElementById('tournamentSettingsOverlay').classList.remove('active');
                drawTable();
				announceNextMatch();
				// pauseGame();
                resetGame(true, false);
            });

			function stopEventPropagationSettings(event) {
				const overlay = document.getElementById('tournamentSettingsOverlay');
				if (overlay && overlay.classList.contains('active')) {
					if (event.type === 'click' &&
						event.target.id !== 'btnEnablePowerups' &&
						event.target.id !== 'btnResetDefaultSettings' &&
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

			const numPlayersSelect = document.getElementById('numPlayers');
			addEventListenerWithTracking(numPlayersSelect, 'change', function() {
				updatePlayerCount(numPlayersSelect.value);
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

			addEventListenerWithTracking(document, 'keydown', function(event) {
				const matchAnnounceOverlay = document.getElementById('matchAnnounceOverlay');
				if (event.code === 'Space' && matchAnnounceOverlay && matchAnnounceOverlay.classList.contains('active')) {
					matchAnnounceOverlay.classList.remove('active');
				}
			});
		}

		addAllEventListeners();

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                    TOURNAMENT MGMT                      ////////////
	//////////////////////////////////////////////////////////////////////////////////
	
		function getTournamentParticipants() {
			for (let i = 1; i <= playerCount; i++) {
				const input = document.getElementById(`player${i}Nickname`);
				if (input && input.value.trim() === "") {
					input.value = "PLAYER" + i;
				}
				participants.push(input.value);
			}
			return participants;
		}

		function drawTable() {
			if (participants.length === 0) {
				participants = getTournamentParticipants();
				participants.sort(() => Math.random() - 0.5);
			}
		
			for (let i = 0; i < participants.length; i += 2) {
				matchups.push([participants[i], participants[i + 1]]);
			}
		
			const tableContainer = document.getElementById('matchupTable');
			tableContainer.innerHTML = '';
		
			matchups.forEach(matchup => {
				const matchupElement = document.createElement('div');
				matchupElement.textContent = `${matchup[0]} vs ${matchup[1]}`;
				tableContainer.appendChild(matchupElement);
			});
		}

		function announceNextMatch() {
			let nextMatch = matchups.shift();

			if (!nextMatch) {
				drawTable();
				nextMatch = matchups.shift();
			}

			playerSide = nextMatch[0];
			guestSide = nextMatch[1];

			const matchAnnouncement = document.getElementById('matchAnnounceOverlay');
			const playerSideElement = document.getElementById('playerSidePlayer');
			const guestSideElement = document.getElementById('guestSidePlayer');
			if (matchAnnouncement && playerSideElement && guestSideElement) {
				playerSideElement.textContent = playerSide;
				guestSideElement.textContent = guestSide;
				matchAnnouncement.classList.add('active');
			}
			totalTime = 0;
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                      BRICKBREAKER                       ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function gameLoop() {
			// context.clearRect(Math.ceil(ball1.x), Math.ceil(ball1.y), ball1.width, ball1.height);
			// context.clearRect(Math.ceil(ball2.x), Math.ceil(ball2.y), ball2.width, ball2.height);
			// context.clearRect(player.x, player.y, player.width, player.height);
			// context.clearRect(guest.x, guest.y, guest.width, guest.height);

			context.clearRect(0, 0, boardWidth, boardHeight);

			player.x = Math.min(Math.max(player.x, 0), boardWidth - player.width);
			
			moveBalls();
			updatePlayersPosition();
			movePowerUp();
			draw();

			totalTime += FRAME_DURATION / 1000;
			// const minutes = Math.floor(totalTime / 60);
			// const seconds = (totalTime % 60).toFixed(1);
			// document.getElementById('time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

			if (totalTime >= 60 && totalTime < 220 && totalTime - lastGameAction >= 10) {
				moveBricksDown();
				lastGameAction = totalTime;
			} else if (totalTime >= 220 && totalTime - lastGameAction >= 30) {
				spawnPowerUp();
				lastGameAction = totalTime;
			}
			
			if (cooldownTime <= 3)
				cooldownTime += FRAME_DURATION / 1000;

			if (isGameOver)
				cleanupGame(false);
		}

		function startGame() {
			board = document.getElementById('board');
			context = board.getContext('2d');
			board.width = boardWidth;
			board.height = boardHeight;

			loadCSVLevel('/static/level_42_tournament.csv', generateBricksFromCSV);
		}

		function resetGame() {
			cooldownTime = 0;
			
			if (player.lives <= 0) {
				player.lives = 0
				document.getElementById('playerLives').textContent = player.lives;
				isGameOver = true;
				return;
			}
			document.getElementById('playerLives').textContent = player.lives;

			if (guest.lives <= 0) {
				guest.lives = 0;
				document.getElementById('guestLives').textContent = guest.lives;
				isGameOver = true;
				return;
			}
			document.getElementById('guestLives').textContent = guest.lives;
		
			ball1.speed = ballSpeed;
			ball2.speed = ballSpeed;
			ball1.velocityX = 0;
			ball2.velocityX = 0;
			ball1.velocityY = -ballSpeed;
			ball2.velocityY = -ballSpeed;

			context.clearRect(Math.ceil(ball1.x), Math.ceil(ball1.y), ball1.width, ball1.height);
			context.clearRect(Math.ceil(ball2.x), Math.ceil(ball2.y), ball2.width, ball2.height);
			context.clearRect(player.x, player.y, player.width, player.height);
			context.clearRect(guest.x, guest.y, guest.width, guest.height);

			player.x = 175;
			guest.x = 375;

			ball1.x = player.x + player.width / 2 - ball1.width / 2;
			ball1.y = 490 - ball1.height - paddleHeight;
			ball2.x = guest.x + player.width / 2 - ball2.width / 2;
			ball2.y = 490 - ball2.height - paddleHeight;
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
			if (fullCleanup) {
				resetToDefaultSettings();
				removeAllEventListeners();
				participants = [];
				matchups = [];
			}

			isGameOver = false;
			bricks = [];
			context.clearRect(0, 0, boardWidth, boardHeight);

			loadCSVLevel('/static/level_42_tournament.csv', generateBricksFromCSV);

			if (!isPaused)
				pauseGame();

			if (!fullCleanup)
				gameOver();
		}

		function calculatePlayerScore() {
			const brickScore = document.getElementById('brickScorePlayer');
			const timeScore = document.getElementById('timeScorePlayer');
			const livesScore = document.getElementById('livesScorePlayer');
			const powerUpScore = document.getElementById('powerUpScorePlayer');
			if (gameResultOverlay && gameResultMessage && brickScore && timeScore && livesScore) {
				let scoreFromBricks = playerScore;
				let scoreFromTime = player.lives === 0 ? 0 : Math.max(0, 10000 - Math.floor(totalTime) * 10);
				let scoreFromLives = player.lives * 1000;
				let scoreFromPowerUps = powerUpsEnabled ? 0 : 2500;
				let scoreFromAll = scoreFromBricks + scoreFromTime + scoreFromLives + scoreFromPowerUps;

				brickScore.textContent = scoreFromBricks;
				timeScore.textContent = scoreFromTime;
				livesScore.textContent = scoreFromLives;
				powerUpScore.textContent = scoreFromPowerUps;
				
				return scoreFromAll;
			}
		}

		function calculateGuestScore() {
			const brickScore = document.getElementById('brickScoreGuest');
			const timeScore = document.getElementById('timeScoreGuest');
			const livesScore = document.getElementById('livesScoreGuest');
			const powerUpScore = document.getElementById('powerUpScoreGuest');
			if (gameResultOverlay && gameResultMessage && brickScore && timeScore && livesScore) {
				let scoreFromBricks = guestScore;
				let scoreFromTime = guest.lives === 0 ? 0 : Math.max(0, 10000 - Math.floor(totalTime) * 10);
				let scoreFromLives = guest.lives * 1000;
				let scoreFromPowerUps = powerUpsEnabled ? 0 : 2500;
				let scoreFromAll = scoreFromBricks + scoreFromTime + scoreFromLives + scoreFromPowerUps;

				brickScore.textContent = scoreFromBricks;
				timeScore.textContent = scoreFromTime;
				livesScore.textContent = scoreFromLives;
				powerUpScore.textContent = scoreFromPowerUps;
				
				return scoreFromAll;
			}
		}

		function gameOver() {
			const playerIndex = participants.indexOf(playerSide);
			if (playerIndex > -1)
				participants.splice(playerIndex, 1);
			
			const opponentIndex = participants.indexOf(guestSide);
			if (opponentIndex > -1)
				participants.splice(opponentIndex, 1);

			const playerFinalScore = calculatePlayerScore();
			const opponentFinalScore = calculateGuestScore();
			
			if (playerFinalScore >= opponentFinalScore)
				participants.push(playerSide);
			else
				participants.push(guestSide);

			const gameResultOverlay = document.getElementById('gameResultOverlay');
			const gameResultMessage = document.getElementById('gameResultMessage');
			const playerFinalScoreText = document.getElementById('playerFinalScore');
			const guestFinalScoreText = document.getElementById('guestFinalScore');
			if (gameResultOverlay && gameResultMessage && playerFinalScoreText && guestFinalScoreText) {
				playerFinalScoreText.textContent = playerFinalScore;
				guestFinalScoreText.textContent = opponentFinalScore;
				if (participants.length > 1)
					gameResultMessage.textContent = playerFinalScore >= guestFinalScore ? playerSide + ' WON!' : guestSide + ' WON!';
				else
					gameResultMessage.textContent = playerFinalScore >= guestFinalScore ? playerSide + ' WON THE TOURNAMENT!' : guestSide + ' WON THE TOURNAMENT!';
				gameResultOverlay.classList.add('active');
			}
			
			const btnPlayNextMatch = document.getElementById('btnPlayNextMatch');
			const nextRoundMessage = document.getElementById('nextRoundMessage');
			if (btnPlayNextMatch && nextRoundMessage) {
				if (participants.length === 1) {
					btnPlayNextMatch.textContent = 'FINISH TOURNAMENT';
					nextRoundMessage.textContent = 'ROBCO INDUSTRIES CONGRATULATES YOU FOR THIS OUTSTANDING VICTORY!';
				}

				btnPlayNextMatch.addEventListener('click', () => {
					if (participants.length > 1) {
						playerScore = 0;
						guestScore = 0;
						player.lives = 3;
						guest.lives = 3;
						resetGame(true, false);
						document.getElementById('playerScore').textContent = playerScore;
						document.getElementById('guestScore').textContent = guestScore;
						document.getElementById('playerLives').textContent = player.lives;
						document.getElementById('guestLives').textContent = guest.lives;		
						if (powerUp)
							powerUp = null;
					} else {
						cleanupGame();
						history.pushState(null, '', '/menu');
						loadPage('/menu');
					}

					gameResultOverlay.classList.remove('active');
					announceNextMatch();
				});
			}
		}
	
	//////////////////////////////////////////////////////////////////////////////////
	/////////////                    BRICK GENERATION                     ////////////
	//////////////////////////////////////////////////////////////////////////////////
		
		function loadCSVLevel(levelFilePath, callback) {
			fetch(levelFilePath)
				.then(response => response.text())
				.then(data => {
					const rows = data.trim().split('\n');
					const levelData = rows.map(row => row.split(',').map(Number));
					callback(levelData);
				})
				.catch(error => console.error('Error loading level:', error));
		}

		function generateBricksFromCSV(levelData) {
			bricks = [];
		
			for (let r = 0; r < levelData.length; r++) {
				bricks[r] = [];
				for (let c = 0; c < levelData[r].length; c++) {
					const brickTypeIndex = levelData[r][c];
					if (brickTypeIndex > 0) {
						const brickType = brickTypes[brickTypeIndex - 1];
						const brickX = c * brickWidth;
						const brickY = r * brickHeight;
						bricks[r][c] = {
							x: brickX,
							y: brickY,
							width: brickWidth,
							height: brickHeight,
							type: brickType.type,
							color: brickType.color,
							hitPoints: brickType.hitPoints,
							needsRedraw: true,
							isBroken: false
						};
					} else
						bricks[r][c] = null;
				}
			}
		}

		function moveBricksDown() {
			context.clearRect(bricks[0][0].x, bricks[0][0].y, boardWidth, boardHeight);

			for (let r = 0; r < bricks.length; r++) {
				for (let c = 0; c < bricks[r].length; c++) {
					const brick = bricks[r][c];
					if (brick && !brick.isBroken) {
						brick.y += 10;
						brick.needsRedraw = true;
					}
				}
			}
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                       DRAW FUNCS                        ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function draw() {
			context.fillStyle = '#00ff00';
			context.fillRect(player.x, player.y, player.width, player.height);
			context.fillRect(guest.x, guest.y, guest.width, guest.height);

			context.fillStyle = "#00ff00";
			context.beginPath();
			context.arc(Math.ceil(ball1.x) + ball1.width / 2, Math.ceil(ball1.y) + ball1.height / 2, ball1.width / 2, 0, 2 * Math.PI);
			context.arc(Math.ceil(ball2.x) + ball2.width / 2, Math.ceil(ball2.y) + ball2.height / 2, ball2.width / 2, 0, 2 * Math.PI);
			context.fill();

			drawBricks();

			if (powerUp) {
				const powerUpImage = powerUp.type === powerUpTypes.FIREBALL ? fireballImage : enlargePaddleImage;
				context.drawImage(powerUpImage, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
			}
		}
		
		function drawBricks() {
			for (let r = 0; r < bricks.length; r++) {
				for (let c = 0; c < bricks[r].length; c++) {
					const brick = bricks[r][c];
					// if (brick && !brick.isBroken && brick.needsRedraw) {
					if (brick && !brick.isBroken) {
						context.clearRect(brick.x, brick.y, brick.width, brick.height);
						context.fillStyle = brick.color;
						context.fillRect(brick.x + 3, brick.y + 3, brick.width - 6, brick.height - 6);
						brick.needsRedraw = false;
					}
				}
			}
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                  OBJECT INTERACTIONS                    ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function updatePlayersPosition() {
			if ((keys['a'] || keys['A']) && player.x > 0)
				player.x -= player.speed;
			if (keys['d'] || keys['D'] && player.x + player.width < boardWidth) {
				let moveRightFlag = playerCanMoveRight();
				if (moveRightFlag != -1)
					player.x += player.speed;
				if (moveRightFlag === 0 && guest.x + guest.width < boardWidth)
					guest.x += player.speed;
			}

			if (keys['ArrowLeft'] && guest.x > 0) {
				let moveLeftFlag = guestCanMoveLeft();
				if (moveLeftFlag != -1)
					guest.x -= guest.speed;
				if (moveLeftFlag === 0)
					player.x -= guest.speed;
			}
			if ((keys['ArrowRight']) && guest.x + guest.width < boardWidth)
				guest.x += guest.speed;
		}

		function moveBalls() {
			if (cooldownTime < 3) {
				resetBallPosition(1);
				resetBallPosition(2);
				return;
			}
		
			updateBallsPosition();
			checkWallCollisions();
			checkPlayerCollision();
			checkBrickCollisions();
		
			if (ball1.y + ball1.height >= boardHeight || ball2.y + ball2.height >= boardHeight) {
				let lostBall = ball1.y + ball1.height >= boardHeight ? ball1 : ball2;
				lostBall.lastTouch.lives -= 1;
				resetGame();
			}
		}
		
		function resetBallPosition(id) {
			if (id === 1) {
				ball1.x = player.x + player.width / 2 - ball1.width / 2;
				let ball1Direction = (player.x + player.width / 2 - boardWidth / 2) / (boardWidth / 2);
				ball1.velocityX = ball1Direction * ball1.speed;
			} else if (id === 2) {
				ball2.x = guest.x + guest.width / 2 - ball2.width / 2;
				let ball2Direction = (guest.x + guest.width / 2 - boardWidth / 2) / (boardWidth / 2);
				ball2.velocityX = ball2Direction * ball2.speed;
			}
		}
		
		function updateBallsPosition() {
			ball1.x += ball1.velocityX;
			ball1.y += ball1.velocityY;

			ball2.x += ball2.velocityX;
			ball2.y += ball2.velocityY;
		}
		
		function checkWallCollisions() {
			if (ball1.x <= 0 || ball1.x + ball1.width >= boardWidth) {
				ball1.x = ball1.x <= 0 ? 0 : boardWidth - ball1.width;
				ball1.velocityX *= -1;
			}
			if (ball1.y <= 0)
				ball1.velocityY *= -1;

			if (ball2.x <= 0 || ball2.x + ball2.width >= boardWidth) {
				ball2.x = ball2.x <= 0 ? 0 : boardWidth - ball2.width;
				ball2.velocityX *= -1;
			}
			if (ball2.y <= 0)
				ball2.velocityY *= -1;
		}
		
		function checkPlayerCollision() {
			[ball1, ball2].forEach(ball => {
				[player, guest].forEach(paddle => {
					if (ball.x + ball.width >= paddle.x && ball.x <= paddle.x + paddle.width && ball.y + ball.height >= paddle.y) {
						let intersectX = ball.x + ball.width / 2 - paddle.x - paddle.width / 2;
						let normalizedIntersectX = intersectX / (paddle.width / 2);
						let bounceAngle = normalizedIntersectX * Math.PI / 4;
		
						if (ball.speed < 5)
							ball.speed += 0.1;
						ball.velocityX = ball.speed * Math.sin(bounceAngle);
						ball.velocityY = -ball.speed * Math.cos(bounceAngle);
						ball.lastTouch = paddle;
					}
				});
			});
		}
		
		function checkBrickCollisions() {
			for (let r = 0; r < bricks.length; r++) {
				for (let c = 0; c < bricks[r].length; c++) {
					const brick = bricks[r][c];
					if (brick && !brick.isBroken) {
						const ball = handleBallsCollisionWithBrick(brick);
						if (ball) {
							handleBrickHit(ball, brick);
							return;
						}
					}
				}
			}
		}
		
		function handleBallsCollisionWithBrick(brick) {
			const balls = [ball1, ball2];
			for (let ball of balls) {
				if (ball.x < brick.x + brick.width &&
					ball.x + ball.width > brick.x &&
					ball.y < brick.y + brick.height &&
					ball.y + ball.height > brick.y) {
					
					const collisionFromLeft = ball.x + ball.width - brick.x;
					const collisionFromRight = brick.x + brick.width - ball.x;
					const collisionFromTop = ball.y + ball.height - brick.y;
					const collisionFromBottom = brick.y + brick.height - ball.y;
			
					const minCollision = Math.min(collisionFromLeft, collisionFromRight, collisionFromTop, collisionFromBottom);
			
					if (!ball.onFire && (minCollision === collisionFromLeft || minCollision === collisionFromRight)) {
						ball.x -= ball.velocityX;
						ball.velocityX *= -1;
					} else if (!ball.onFire) {
						ball.y -= ball.velocityY;
						ball.velocityY *= -1;
					}
		
					brick.needsRedraw = true;
			
					return ball;
				}
			}
			return null;
		}
		
		function handleBrickHit(ball, brick) {
			let scoreIncrement = 0;
		
			if (brick.type === 1) {
				brick.isBroken = true;
				scoreIncrement = 50;
			} else if (brick.type != 4) {
				brick.type -= 1;
				const newBrickType = brickTypes[brick.type - 1];
				brick.color = newBrickType.color;
				brick.hitPoints = newBrickType.hitPoints;
				scoreIncrement = 10;
			}
		
			if (ball.lastTouch === player) {
				playerScore += scoreIncrement;
				document.getElementById('playerScore').textContent = playerScore;
			} else if (ball.lastTouch === guest) {
				guestScore += scoreIncrement;
				document.getElementById('guestScore').textContent = guestScore;
			}
		
			if (playerScore + guestScore === 74100) // TODO calc max score
				isGameOver = true;
		
			context.clearRect(brick.x, brick.y, brick.width, brick.height);
		}

		function playerCanMoveRight() {
			if (player.x + player.width < guest.x - player.speed)
				return 1;
			else if (!keys['ArrowLeft'] && guest.x + guest.width < boardWidth)
				return 0;
			return -1;
		}

		function guestCanMoveLeft() {
			if (guest.x > player.x + player.width + guest.speed)
				return 1;
			else if (!keys['d'] && !keys['D'] && player.x > 0)
				return 0;
			return -1;
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                    SETTINGS FUNCS                       ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function updateBallSpeed(speed) {
			ballSpeed = parseFloat(speed);
			ball1.speed = ballSpeed;
			ball1.velocityY = -ball1.speed;

			ball2.speed = ballSpeed;
			ball2.velocityY = -ball2.speed;
		}

		function updatePaddleSpeed(speed) {
			player.speed = parseFloat(speed);
			guest.speed = parseFloat(speed);
		}

		function resetToDefaultSettings() {
			updateBallSpeed(2);
			updatePaddleSpeed(2);
			document.getElementById('ballSpeedSlider').value = 2;
			document.getElementById('paddleSpeedSlider').value = 2;

			powerUpsEnabled = false;
			const btnEnablePowerups = document.getElementById('btnEnablePowerups');
			btnEnablePowerups.textContent = 'ENABLE POWERUPS';
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                   POWER-UPS FUNCTIONS                   ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function togglePowerups() {
			powerUpsEnabled = !powerUpsEnabled;
			const button = document.getElementById('btnEnablePowerups');
			button.textContent = powerUpsEnabled ? 'DISABLE POWERUPS' : 'ENABLE POWERUPS';

			if (!powerUpsEnabled)
				powerUp = null; // rm all active powerUps
		}

		function spawnPowerUp() {
			if (!powerUpsEnabled || powerUp)
				return;

				powerUp = {
				type: Math.random() < 0.5 ? powerUpTypes.FIREBALL : powerUpTypes.ENLARGE_PADDLE,
				x: Math.random() * (boardWidth - 10),
				y: 0,
				width: 10,
				height: 10,
				velocityX: 0,
				velocityY: 0.5
			};
		}

		function movePowerUp() {
			if (!powerUp)
				return;

			context.clearRect(Math.floor(powerUp.x), Math.floor(powerUp.y), powerUp.width + 1, powerUp.height + 1);

			powerUp.y += powerUp.velocityY;

			[player, guest].forEach(paddle => {
				if (powerUp && powerUp.x + powerUp.width >= paddle.x && powerUp.x <= paddle.x + paddle.width && powerUp.y + powerUp.height >= paddle.y) {
					applyPowerUp(powerUp, paddle);
					powerUp = null;
					return;
				}
			});

			// for (let r = 0; r < bricks.length; r++) {
			// 	for (let c = 0; c < bricks[r].length; c++) {
			// 		const brick = bricks[r][c];
			// 		if (brick && !brick.isBroken) {
			// 			if (
			// 				powerUp.x < brick.x + brick.width &&
			// 				powerUp.x + powerUp.width > brick.x &&
			// 				powerUp.y < brick.y + brick.height &&
			// 				powerUp.y + powerUp.height > brick.y
			// 			) {
			// 				brick.needsRedraw = true;
			// 			}
			// 		}
			// 	}
			// }

			if (powerUp && powerUp.y > boardHeight) {
				powerUp = null;
			}
		}

		function applyPowerUp(powerUp, paddle) {
			console.log(powerUp.type, paddle);

			if (powerUp.type === powerUpTypes.ENLARGE_PADDLE) {
				if (paddle === player) {
					player.x -= 12;
					player.width += 25;
					console.log("enlarging player paddle");
					console.log(paddle);
				} else if (paddle === guest) {
					guest.x -= 12;
					guest.width += 25;
					console.log("enlarging guest paddle");
					console.log(paddle);
				}
			}
			else {
				[ball1, ball2].forEach(ball => {
					if (ball.lastTouch === paddle) {
						ball.onFire = true;
						setTimeout(() => {
							ball.onFire = false;
						}, 5000);
					}
				});
			}
		}

		startGame();
		pauseGame();
	}

	initBrickbreaker();
});
