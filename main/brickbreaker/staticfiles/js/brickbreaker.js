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
			history.pushState(null, '', '/settings');
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

		const mystatsLabel = document.getElementById('btn_mystats');
		mystatsLabel.addEventListener('click', () => {
			history.pushState(null, '', '/mystats');
			loadPage('/mystats');
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
		let score = 0;

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
		const brickWidth = 50;
		const brickHeight = 20;
		const brickTypes = [
			{ type: 1, color: "rgba(0, 255, 0, 0.3)", hitPoints: 1 },
			{ type: 2, color: "rgba(0, 255, 0, 0.6)", hitPoints: 2 },
			{ type: 3, color: "rgba(0, 255, 0, 1)", hitPoints: 3 }
		];

		let powerUpsEnabled = false;
		let ballOnFire = false;
		
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

			addEventListenerWithTracking(document.getElementById('btnPause'), 'click', pauseGame);

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
	/////////////                      BRICKBREAKER                       ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function gameLoop() {
			context.clearRect(Math.ceil(ball.x), Math.ceil(ball.y), ball.width, ball.height);
			context.clearRect(player.x, player.y, player.width, player.height);
			player.x = Math.min(Math.max(player.x, 0), boardWidth - player.width);
			
			moveball();
			updatePlayerPosition();
			movePowerUp();
			draw();

			totalTime += FRAME_DURATION / 1000;
			const minutes = Math.floor(totalTime / 60);
			const seconds = (totalTime % 60).toFixed(1);
			document.getElementById('time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

			if ( totalTime >= 60 && totalTime < 220 && totalTime - lastGameAction >= 10) {
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

			loadCSVLevel('/static/level_42.csv', generateBricksFromCSV);
		}

		function resetGame() {
			cooldownTime = 0;
			lives--;
			if (lives <= 0) {
				lives = 0;
				document.getElementById('lives').textContent = lives;
				isGameOver = true;
				console.log("game over - no more lives");
				return;
			}
			document.getElementById('lives').textContent = lives;
			ball.speed = ballSpeed;
			ball.velocityX = 0;
			ball.velocityY = -ballSpeed;
			context.clearRect(Math.ceil(ball.x), Math.ceil(ball.y), ball.width, ball.height);
			context.clearRect(player.x, player.y, player.width, player.height); 
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
			console.log("cleaning up game");
			lives++;
			resetGame();
			removeAllEventListeners();
			
			if (!isPaused)
				pauseGame();
			
			if (!fullCleanup)
				gameOver();
			resetToDefaultSettings();
		}

		function gameOver() {
			console.log("entering gameOver function");
			const gameResultOverlay = document.getElementById('gameResultOverlay');
			const gameResultMessage = document.getElementById('gameResultMessage');
			const finalScore = document.getElementById('finalScore');
			const brickScore = document.getElementById('brickScore');
			const timeScore = document.getElementById('timeScore');
			const livesScore = document.getElementById('livesScore');
			const powerUpScore = document.getElementById('powerUpScore');
			if (gameResultOverlay && gameResultMessage && finalScore && brickScore && timeScore && livesScore) {
				console.log("all elements loaded");
				let scoreFromBricks = score;
				let scoreFromTime = lives === 0 ? 0 : Math.max(0, 10000 - Math.floor(totalTime) * 10);
				let scoreFromLives = lives * 1000;
				let scoreFromPowerUps = powerUpsEnabled ? 0 : 2500;
				let scoreFromAll = scoreFromBricks + scoreFromTime + scoreFromLives + scoreFromPowerUps;
				updateData(scoreFromAll, totalTime);
				brickScore.textContent = scoreFromBricks;
				timeScore.textContent = scoreFromTime;
				livesScore.textContent = scoreFromLives;
				powerUpScore.textContent = scoreFromPowerUps;
				finalScore.textContent = scoreFromAll;
				gameResultOverlay.classList.add('active');
			}

			const playAgainButton = document.getElementById('btnPlayAgain');
			if (playAgainButton) {
				playAgainButton.addEventListener('click', () => {
					loadPage('/brickbreaker');
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
				.catch(error => console.log('Error loading level:', error));
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

			context.fillStyle = "#00ff00";
			context.beginPath();
			context.arc(Math.ceil(ball.x) + ball.width / 2, Math.ceil(ball.y) + ball.height / 2, ball.width / 2, 0, 2 * Math.PI);
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
					if (brick && !brick.isBroken && brick.needsRedraw) {
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

		function updatePlayerPosition() {
			if ((keys['a'] || keys['A'] || keys['ArrowLeft']) && player.x > 0)
				player.x -= player.speed;
			if ((keys['d'] || keys['D'] || keys['ArrowRight']) && player.x + paddleWidth < boardWidth)
				player.x += player.speed;
		}

		function moveball() {
			if (cooldownTime < 3) {
				resetBallPosition();
				return;
			}
		
			updateBallPosition();
			checkWallCollisions();
			checkPlayerCollision();
			checkBrickCollisions();
		
			if (ball.y + ball.height >= boardHeight)
				resetGame();
		}
		
		function resetBallPosition() {
			ball.x = player.x + player.width / 2 - ball.width / 2;
			let direction = (player.x + player.width / 2 - boardWidth / 2) / (boardWidth / 2);
			ball.velocityX = direction * ball.speed;
		}
		
		function updateBallPosition() {
			ball.x += ball.velocityX;
			ball.y += ball.velocityY;
		}
		
		function checkWallCollisions() {
			if (ball.x <= 0 || ball.x + ball.width >= boardWidth) {
				ball.x = ball.x <= 0 ? 0 : boardWidth - ball.width;
				ball.velocityX *= -1;
			}
			if (ball.y <= 0)
				ball.velocityY *= -1;
		}
		
		function checkPlayerCollision() {
			if (ball.x + ball.width >= player.x && ball.x <= player.x + player.width && ball.y + ball.height >= player.y) {
				let intersectX = ball.x + ball.width / 2 - player.x - player.width / 2;
				let normalizedIntersectX = intersectX / (player.width / 2);
				let bounceAngle = normalizedIntersectX * Math.PI / 4;
		
				if (ball.speed < 5)
					ball.speed += 0.1;
				ball.velocityX = ball.speed * Math.sin(bounceAngle);
				ball.velocityY = -ball.speed * Math.cos(bounceAngle);
			}
		}
		
		function checkBrickCollisions() {
			for (let r = 0; r < bricks.length; r++) {
				for (let c = 0; c < bricks[r].length; c++) {
					const brick = bricks[r][c];
					if (brick && !brick.isBroken) {
						if (handleBallCollisionWithBrick(brick)) {
							handleBrickHit(brick);
							return;
						}
					}
				}
			}
		}
		
		function handleBallCollisionWithBrick(brick) {
			if (ball.x < brick.x + brick.width &&
				ball.x + ball.width > brick.x &&
				ball.y < brick.y + brick.height &&
				ball.y + ball.height > brick.y) {
				
				const collisionFromLeft = ball.x + ball.width - brick.x;
				const collisionFromRight = brick.x + brick.width - ball.x;
				const collisionFromTop = ball.y + ball.height - brick.y;
				const collisionFromBottom = brick.y + brick.height - ball.y;
		
				const minCollision = Math.min(collisionFromLeft, collisionFromRight, collisionFromTop, collisionFromBottom);
		
				if (!ballOnFire && (minCollision === collisionFromLeft || minCollision === collisionFromRight)) {
					ball.x -= ball.velocityX;
					ball.velocityX *= -1;
				} else if (!ballOnFire) {
					ball.y -= ball.velocityY;
					ball.velocityY *= -1;
				}

				brick.needsRedraw = true;
		
				return true;
			}
			return false;
		}
		
		function handleBrickHit(brick) {
			if (brick.type === 1) {
				brick.isBroken = true;
				score += 50;
			} else if (brick.type != 4) {
				brick.type -= 1;
				const newBrickType = brickTypes[brick.type - 1];
				brick.color = newBrickType.color;
				brick.hitPoints = newBrickType.hitPoints;
				score += 10;
			}

			if (score === 7410) // total bricks score
				isGameOver = true;

			document.getElementById('score').textContent = score;
			context.clearRect(brick.x, brick.y, brick.width, brick.height);
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                    SETTINGS FUNCS                       ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function updateBallSpeed(speed) {
			ballSpeed = parseFloat(speed);
			ball.speed = ballSpeed;
			ball.velocityY = -ball.speed;
		}

		function updatePaddleSpeed(speed) {
			player.speed = parseFloat(speed);
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
			console.log(powerUp);
		}

		function movePowerUp() {
			if (!powerUp)
				return;

			context.clearRect(Math.floor(powerUp.x), Math.floor(powerUp.y), powerUp.width + 1, powerUp.height + 1);


			powerUp.y += powerUp.velocityY;

			// collision check
			if (powerUp.x + powerUp.width >= player.x && powerUp.x <= player.x + player.width && powerUp.y + powerUp.height >= player.y) {
				applyPowerUp(powerUp);
				powerUp = null;
				return;
			}

			for (let r = 0; r < bricks.length; r++) {
				for (let c = 0; c < bricks[r].length; c++) {
					const brick = bricks[r][c];
					if (brick && !brick.isBroken) {
						if (
							powerUp.x < brick.x + brick.width &&
							powerUp.x + powerUp.width > brick.x &&
							powerUp.y < brick.y + brick.height &&
							powerUp.y + powerUp.height > brick.y
						) {
							brick.needsRedraw = true;
						}
					}
				}
			}

			if (powerUp.y > boardHeight) {
				powerUp = null;
			}
		}

		function applyPowerUp(powerUp) {
			if (powerUp.type === powerUpTypes.ENLARGE_PADDLE) {
				if (player.x + player.width / 2 >= boardWidth / 2) {
					player.x -= 25;
				}
				player.width += 25;
			}
			else {
				ballOnFire = true;
				setTimeout(() => {
					ballOnFire = false;
				}, 5000);
			}
		}

		startGame();
		pauseGame();
	}

	initBrickbreaker();

	function logout() {
		fetch('/srclogin/logout/', {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCSRFToken()
			},
		})
		.then(response => {
			if (response.ok) {
				history.pushState(null, '', '/login');
				loadPage('/login');
			} else {
				console.log("Erreur lors de la déconnexion.");
			}
		})
		.catch(error => console.log("Erreur réseau : ", error));
	}

	langModule();
	
	async function langModule() {
		await loadLanguage(await getLangPlayer());
		async function loadLanguage(lang) {
			try {
			const response = await fetch(`/static/lang/${lang}.json`);
			if (!response.ok) throw new Error("Erreur lors du chargement du fichier JSON");
			const translations = await response.json();
			applyTranslations(translations);
			} catch (error) {
			console.log("Erreur :", error);
			}
		};

		function applyTranslations(translations) {
			document.querySelectorAll("[data-translate]").forEach((element) => {
			const key = element.getAttribute("data-translate");
			if (translations[key]) {
				element.textContent = translations[key];
			}
			});
		};
	}

	async function getLangPlayer() {
		try {
			const response = await fetch('/api/getUserLang/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				if (data.lang) {
					return data.lang;
				}
			}
		} catch (error) {
			console.log('Error getLangPlayer:', error);
		}
	}
});

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                      UPDATE DATA                        ////////////
	//////////////////////////////////////////////////////////////////////////////////

	async function updateData(scoreFromAll, totalTime){
		await saveParty(scoreFromAll, totalTime);
		await updateRankBrick();
	}

	async function updateRankBrick(){
		try{
			const response = await fetch('/api/update_rank_brick/', {
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
			console.log('Erreur lors de l’appel API :', error);
		}
	}

	async function saveParty(scoreFromAll, totalTime){
		try{
			const response = await fetch('/api/create_party/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				},
				body: JSON.stringify({
					score: scoreFromAll,
					timer: totalTime,
				}),
			});
			if (!response.ok) {
				throw new Error(`Erreur API : ${response.statusText}`);
			}
		} catch (error) {
			console.log("Erreur réseau :", error);
		}
	}