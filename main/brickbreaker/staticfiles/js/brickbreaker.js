document.addEventListener('brickbreaker_event', async()=>{
	function brickbreakerEvent() {
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

	brickbreakerEvent();

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                       VARIABLES                         ////////////
	//////////////////////////////////////////////////////////////////////////////////


	function initBrickbreaker() {
		let board;
		let boardWidth = 500;
		let boardHeight = 500;
		let context;

		let paddleWidth = 50;
		let paddleHeight = 10;
		let paddleSpeed = 2;

		let lives = 4;
		let level = 1;

		let player = {
			width: paddleWidth,
			height: paddleHeight,
			speed: paddleSpeed,
			lives: lives,
			x: boardWidth / 2 - paddleWidth / 2,
			y: 490 - paddleHeight
		};

		let ballWidth = 10;
		let ballHeight = 10;
		let ballSpeed = 2;

		let ball = {
			width: ballWidth,
			height: ballHeight,
			speed: ballSpeed,
			velocityX: 0,
			velocityY: -ballSpeed,
			x: boardWidth / 2 - ballWidth / 2,
			y: 490 - ballHeight - paddleHeight
		};

		let bricks = [];
		// const brickRows = 12;
		// const brickCols = 10;
		const brickWidth = 48;
		const brickGap = 2;
		const brickHeight = 18;
		const brickTypes = [
			{ type: 1, color: "rgba(0, 255, 0, 0.3)", hitPoints: 1 },
			{ type: 2, color: "rgba(0, 255, 0, 0.6)", hitPoints: 2 },
			{ type: 3, color: "rgba(0, 255, 0, 1)", hitPoints: 3 },
			{ type: 4, color: "black", hitPoints: Infinity }
		];

		let totalTime = 0;
		let cooldownTime = 0;

		let keys = {};

		const FRAME_RATE = 60;
		const FRAME_DURATION = 1000 / FRAME_RATE;
		let gameIntervalId;
		let isPaused = false;

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
			document.removeEventListener('game_event', async () => {});
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
						event.target.id !== 'btnEnablePowerups' &&
						event.target.id !== 'btnResetDefaultSettings' &&
						event.target.id !== 'btnEnableAI' &&
						event.target.id !== 'btnQuitSettings' &&
						event.target.id !== 'btnPlay') {
						event.stopPropagation();
						event.preventDefault();
					} else if (event.type === 'keydown') {
						const blockedKeys = ['a', 'd', ' '];
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
				history.pushState(null, '', '/');
				loadPage('/');
			});
		}

	addAllEventListeners();

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                      BRICKBREAKER                       ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function gameLoop() {
			context.clearRect(0, 0, boardWidth, boardHeight);

			moveball();
			draw();
			drawBricks();
			updatePlayerPosition();

			totalTime += FRAME_DURATION / 1000;
			const minutes = Math.floor(totalTime / 60);
			const seconds = (totalTime % 60).toFixed(1);
			document.getElementById('time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
			
			if (cooldownTime <= 3)
				cooldownTime += FRAME_DURATION / 1000;
		}

		function startGame() {
			board = document.getElementById('board');
			context = board.getContext('2d');
			board.width = boardWidth;
			board.height = boardHeight;

			loadCSVLevel('https://127.0.0.1/static/level1.csv', generateBricksFromCSV);
		}

		function resetGame() {
			cooldownTime = 0;
			lives--;
			document.getElementById('lives').textContent = lives;
			document.getElementById('level').textContent = level;
			console.log(ballSpeed);
			ball.speed = ballSpeed;
			player.x = boardWidth / 2 - paddleWidth / 2;
			ball.x = player.x + player.width / 2 - ball.width / 2;
			ball.y = 490 - ball.height - paddleHeight;
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
			resetGame();
			removeAllEventListeners();

			if (!isPaused)
				pauseGame();

			if (fullCleanup) 
				return;
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
						const brickX = c * (brickWidth + brickGap);
						const brickY = r * (brickHeight + brickGap);
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
					} else {
						bricks[r][c] = null;
					}
				}
			}
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                       DRAW FUNCS                        ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function draw() {
			context.fillStyle = '#ffffff';
			context.fillRect(player.x, player.y, player.width, player.height);

			context.fillStyle = "#00ff00";
			context.beginPath();
			context.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, 2 * Math.PI);
			context.fill();
		}

		function drawBricks() {
			for (let r = 0; r < bricks.length; r++) {
				for (let c = 0; c < bricks[r].length; c++) {
					const brick = bricks[r][c];
					if (brick && !brick.isBroken && brick.needsRedraw) {
						context.fillStyle = brick.color;
						context.fillRect(brick.x, brick.y, brick.width, brick.height);
					}
				}
			}
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                  OBJECT INTERACTIONS                    ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function updatePlayerPosition() {
			if (keys['a'] && player.x > 0)
				player.x -= player.speed;
			if (keys['d'] && player.x + paddleWidth < boardWidth)
				player.x += player.speed;
		}

		function moveball() {
			if (cooldownTime < 3) {
				ball.x = player.x + player.width / 2 - ball.width / 2;

				let direction = (player.x + player.width / 2 - boardWidth / 2) / (boardWidth / 2);
				ball.velocityX = direction * ball.speed;
				return;
			}

			ball.x += ball.velocityX;
			ball.y += ball.velocityY;
			
			if (ball.x <= 0 || ball.x + ball.width >= boardWidth)
				ball.velocityX *= -1;
			if (ball.y <= 0)
				ball.velocityY *= -1;

			if (ball.x + ball.width >= player.x && ball.x <= player.x + player.width && ball.y + ball.height >= player.y) {
				let intersectX = ball.x + ball.width / 2 - player.x - player.width / 2;
				let normalizedIntersectX = intersectX / (player.width / 2);
				let bounceAngle = normalizedIntersectX * Math.PI / 4;
			
				if (ball.speed < 12)
					ball.speed += 0.1;
				ball.velocityX = ball.speed * Math.sin(bounceAngle);
				ball.velocityY = -ball.speed * Math.cos(bounceAngle);
			}

			for (let r = 0; r < bricks.length; r++) {
				for (let c = 0; c < bricks[r].length; c++) {
					const brick = bricks[r][c];
					if (brick && !brick.isBroken) {
						if (handleBallCollisionWithBrick(brick)) {
							if (brick.type === 1)
								brick.isBroken = true;
							else if (brick.type != 4) {
								brick.type -= 1;
								const newBrickType = brickTypes[brick.type - 1];
								brick.color = newBrickType.color;
								brick.hitPoints = newBrickType.hitPoints;
							}
						}
					}
				}
			}

			if (ball.y + ball.height >= boardHeight)
				resetGame();
		}

		function handleBallCollisionWithBrick(brick) {
			if (ball.x < brick.x + brick.width &&
				ball.x + ball.width > brick.x &&
				ball.y < brick.y + brick.height &&
				ball.y + ball.height > brick.y) {
		
				console.log('collision');
		
				const collisionFromLeft = ball.x + ball.width - brick.x;
				const collisionFromRight = brick.x + brick.width - ball.x;
				const collisionFromTop = ball.y + ball.height - brick.y;
				const collisionFromBottom = brick.y + brick.height - ball.y;
		
				const minCollision = Math.min(collisionFromLeft, collisionFromRight, collisionFromTop, collisionFromBottom);
		
				if (minCollision === collisionFromLeft || minCollision === collisionFromRight) {
					ball.velocityX *= -1;
				} else {
					ball.velocityY *= -1;
				}

				brick.needsRedraw = true;
		
				return true;
			}
			return false;
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                    SETTINGS FUNCS                       ////////////
	//////////////////////////////////////////////////////////////////////////////////

		// TODO ball speed is not applied. Check resetGame() function?
		function updateBallSpeed(speed) {
			ballSpeed = parseFloat(speed);
			ball.speed = ballSpeed;
			ball.velocityY = -ball.speed;
			console.log(ballSpeed);
		}

		function updatePaddleSpeed(speed) {
			player.speed = parseFloat(speed);
		}

		function resetToDefaultSettings() {
			updateBallSpeed(2);
			updatePaddleSpeed(2);
			document.getElementById('ballSpeedSlider').value = 2;
			document.getElementById('paddleSpeedSlider').value = 2;
		}

		startGame();
		pauseGame();
	}

	initBrickbreaker();
});