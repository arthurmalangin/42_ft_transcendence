document.addEventListener('multipong_event', async()=>{
	function multipongEvent() {
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
	}

	multipongEvent();

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                        VARIABLES                        ////////////
	//////////////////////////////////////////////////////////////////////////////////


	function initMultipong () {
		let board;
		let boardWidth = 500;
		let boardHeight = 500;
		let context;

		let verticalPaddleWidth = 10;
		let verticalPaddleHeight = 50;
		let horizontalPaddleWidth = 50;
		let horizontalPaddleHeight = 10;
		let paddleSpeed = 2;
		
		let player1 = {
			width: verticalPaddleWidth,
			height: verticalPaddleHeight,
			speed: paddleSpeed,
			x: 10,
			y: boardHeight / 2 - verticalPaddleHeight / 2
		};
		console.log('Player 1:', player1);

		let player2 = {
			width: horizontalPaddleWidth,
			height: horizontalPaddleHeight,
			speed: paddleSpeed,
			x: boardWidth / 2 - horizontalPaddleWidth / 2,
			y: 10
		};
		console.log('Player 2:', player2);

		let player3 = {
			width: horizontalPaddleWidth,
			height: horizontalPaddleHeight,
			speed: paddleSpeed,
			x: boardWidth / 2 - horizontalPaddleWidth / 2,
			y: 490 - horizontalPaddleHeight
		};
		console.log('Player 3:', player3);

		let player4 = {
			width: verticalPaddleWidth,
			height: verticalPaddleHeight,
			speed: paddleSpeed,
			x: 490 - verticalPaddleWidth,
			y: boardHeight / 2 - verticalPaddleHeight / 2
		};
		console.log('Player 4:', player4);

		let players = [player1, player2, player3, player4];

		let ballWidth = 10;
		let ballHeight = 10;
		let ballSpeed = 2;

		let angle = Math.random() * 2 * Math.PI;
		let ball = {
			width: ballWidth,
			height: ballHeight,
			speed: ballSpeed,
			velocityX: ballSpeed * Math.cos(angle),
			velocityY: ballSpeed * Math.sin(angle),
			x: boardWidth / 2 - ballWidth / 2,
			y: boardHeight / 2 - ballHeight / 2
		};

		let playerScores = [0, 0, 0, 0];

		let keys = {};

		const FRAME_RATE = 60;
		const FRAME_DURATION = 1000 / FRAME_RATE;
		let gameIntervalId;
		let isPaused = false;

		let eventListeners = [];

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                         EVENTS                          ////////////
	//////////////////////////////////////////////////////////////////////////////////

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
						resetGame();
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
				resetGame();
			});

			addEventListenerWithTracking(document.getElementById('btnPlay'), 'click', function() {
                document.getElementById('settingsOverlay').classList.remove('active');
                pauseGame();
                resetGame();
            });

			function stopEventPropagationSettings(event) {
				const overlay = document.getElementById('settingsOverlay');
				if (overlay && overlay.classList.contains('active')) {
					if (event.type === 'click' &&
						event.target.id !== 'btnCloseSettingsPong' &&
						event.target.id !== 'btnResetDefaultSettings' &&
						event.target.id !== 'btnQuitSettings' &&
						event.target.id !== 'btnPlay') {
						event.stopPropagation();
						event.preventDefault();
					} else if (event.type === 'keydown') {
						const blockedKeys = ['s', 'w', ' ', 'ArrowUp', 'ArrowDown', 'c', 'v', ',', '.'];
						if (blockedKeys.includes(event.key)) {
							event.stopPropagation();
							event.preventDefault();
						}
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
	/////////////                     MULTIPONG GAME                      ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function gameLoop() {
			context.clearRect(0, 0, boardWidth, boardHeight);

			moveBall();
			draw();
			updatePaddlePositions();

			if (playerScores.some(score => score >= 7))
				cleanupGame(false);
		}

		function startGame() {
			board = document.getElementById('board');
			context = board.getContext('2d');
			board.width = boardWidth;
			board.height = boardHeight;
		}

		function resetGame() {
			ball.x = boardWidth / 2 - ball.width / 2;
			ball.y = boardHeight / 2 - ball.height / 2;
			ball.speed = ballSpeed;
		
			let angle = Math.random() * 2 * Math.PI;
			ball.velocityX = ballSpeed * Math.cos(angle);
			ball.velocityY = ballSpeed * Math.sin(angle);

			player1.y = boardHeight / 2 - verticalPaddleHeight / 2;
			player2.x = boardWidth / 2 - horizontalPaddleWidth / 2;
			player3.x = boardWidth / 2 - horizontalPaddleWidth / 2;
			player4.y = boardHeight / 2 - verticalPaddleHeight / 2;
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
			// resetToDefaultSettings();
			// resetGame();
			// removeAllEventListeners();

			// if (!isPaused)
			// 	pauseGame();

			// if (!fullCleanup)
				gameOver();
		}
			
		function gameOver() {
			const gameResultOverlay = document.getElementById('gameResultOverlay');
			const gameResultMessage = document.getElementById('gameResultMessage');
			if (gameResultOverlay && gameResultMessage) {
				// gameResultMessage.textContent = playerScore === 7 ? 'PLAYER WON!' : 'GUEST WON!';
				// updateScores(playerScore);
				gameResultOverlay.classList.add('active');
				// updateData();
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
			context.fillStyle = "#ffffff";
			players.forEach(player => {
				context.fillRect(player.x, player.y, player.width, player.height);
			});
		
			context.fillStyle = "#00ff00";
			context.beginPath();
			context.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, 2 * Math.PI);
			context.fill();
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                  OBJECT INTERACTIONS                    ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function updatePaddlePositions() {
			if (keys['w'] && player1.y > 0)
				player1.y -= player1.speed;
			if (keys['s'] && player1.y < boardHeight - player1.height)
				player1.y += player1.speed;

			if (keys['c'] && player2.x > 0)
				player2.x -= player2.speed;
			if (keys['v'] && player2.x < boardWidth - player2.width)
				player2.x += player2.speed;
			
			if (keys[','] && player3.x > 0)
				player3.x -= player3.speed;
			if (keys['.'] && player3.x < boardWidth - player3.width)
				player3.x += player3.speed;
		
			if (keys['ArrowUp'] && player4.y > 0)
				player4.y -= player4.speed;
			if (keys['ArrowDown'] && player4.y < boardHeight - player4.height)
				player4.y += player4.speed;
		}

		function moveBall() {
			ball.x += ball.velocityX;
			ball.y += ball.velocityY;

			// players.forEach(player => {
			// 	if (ball.x <= player.x + player.width && ball.x + ball.width >= player.x &&
			// 		ball.y + ball.height >= player.y && ball.y <= player.y + player.height) {
					
			// 		let intersectY = ball.y + ball.height / 2 - player.y - player.height / 2;
			// 		let normalizedIntersectY = intersectY / (player.height / 2);
			// 		let bounceAngle = normalizedIntersectY * Math.PI / 4;
			
			// 		if (ball.speed < 5)
			// 			ball.speed += 0.1;
					
			// 		ball.velocityX = ball.speed * Math.cos(bounceAngle);
			// 		ball.velocityY = ball.speed * Math.sin(bounceAngle);
			// 	}
			// });

			// // check for point
			// if (ball.x <= 0)
			// 	resetGame(true, true);
			// if (ball.x + ball.width >= boardWidth)
			// 	resetGame(false, true);
		}
	
		startGame();
		pauseGame();
	}

	initMultipong();
});