document.addEventListener('tourpong_event', async()=>{
	function tourpongEvent() {
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

		const mystatsLabel = document.getElementById('btn_mystats');
		mystatsLabel.addEventListener('click', () => {
			history.pushState(null, '', '/mystats');
			loadPage('/mystats');
		});

		// const brickbreakerLabel = document.getElementById('btn_brickbreaker');
		// brickbreakerLabel.addEventListener('click', () => {
		// 	history.pushState(null, '', '/brickbreaker');
		// 	loadPage('/brickbreaker');
		// });
	}

	tourpongEvent();

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

		let playerCount = 4;

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

		let matchups = [];
		let participants = [];

		let playerSide;
		let guestSide;

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                         EVENTS                          ////////////
	//////////////////////////////////////////////////////////////////////////////////

		let eventListeners = [];

		function addEventListenerWithTracking(target, type, listener, options = {}) {
			if (target) {
				target.addEventListener(type, listener, options);
				eventListeners.push({ target, type, listener });
			}
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
				if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
					e.preventDefault();
				}
				keys[e.key] = true;
			});
			
			addEventListenerWithTracking(window, 'keyup', function (e) {
				if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
					e.preventDefault();
				}
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
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                       PONG GAME                         ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function gameLoop() {
			context.clearRect(0, 0, boardWidth, boardHeight);

			moveBall();
			movePowerUp();
			draw();
			updatePaddlePositions();
			checkPowerUpCollisions();

			if (playerScore >= 5 || opponentScore >= 5)
				cleanupGame(false);
		}

		function startGame() {			
			board = document.getElementById('board');
			context = board.getContext('2d');
			board.width = boardWidth;
			board.height = boardHeight;
		}

		function resetGame(playerLost, spawnPowerUpFlag = true) {
			if (playerScore >= 5 || opponentScore >= 5)
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
			if (fullCleanup) {
				resetToDefaultSettings();
				removeAllEventListeners();
				participants = [];
				matchups = [];
			}

			if (!isPaused)
				pauseGame();

			if (!fullCleanup)
				gameOver();
		}
			
		function gameOver() {
			const playerIndex = participants.indexOf(playerSide);
			if (playerIndex > -1)
				participants.splice(playerIndex, 1);
			
			const opponentIndex = participants.indexOf(guestSide);
			if (opponentIndex > -1)
				participants.splice(opponentIndex, 1);
			
			if (playerScore === 5)
				participants.push(playerSide);
			else
				participants.push(guestSide);

			const gameResultOverlay = document.getElementById('gameResultOverlay');
			const gameResultMessage = document.getElementById('gameResultMessage');
			if (gameResultOverlay && gameResultMessage) {
				if (participants.length > 1)
					gameResultMessage.textContent = playerScore === 5 ? playerSide + ' WON!' : guestSide + ' WON!';
				else
					gameResultMessage.textContent = playerScore === 5 ? playerSide + ' WON THE TOURNAMENT!' : guestSide + ' WON THE TOURNAMENT!';
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
						opponentScore = -1;
						resetGame(true, false);
						document.getElementById('player2Score').textContent = opponentScore;
						document.getElementById('player1Score').textContent = playerScore;		
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

		function updatePlayerCount(newCount) {
			playerCount = parseInt(newCount);
			if (playerCount === 4) {
				document.getElementById('PlayersNicknames5-8').style.display = 'none';
				document.getElementById('PlayersNicknames9-12').style.display = 'none';
				document.getElementById('PlayersNicknames13-16').style.display = 'none';
			}
			else if (playerCount === 8) {
				document.getElementById('PlayersNicknames5-8').style.display = 'flex';
				document.getElementById('PlayersNicknames9-12').style.display = 'none';
				document.getElementById('PlayersNicknames13-16').style.display = 'none';
			}
			else {
				document.getElementById('PlayersNicknames5-8').style.display = 'flex';
				document.getElementById('PlayersNicknames9-12').style.display = 'flex';
				document.getElementById('PlayersNicknames13-16').style.display = 'flex';
			}
		}

		function resetToDefaultSettings() {
			powerUpsEnabled = false;
			const powerUpButton = document.getElementById('btnEnablePowerups');
			powerUpButton.textContent = 'ENABLE POWERUPS';

			updateBallSpeed(2);
			updatePaddleSpeed(2);
			updatePlayerCount(4);
			document.getElementById('ballSpeedSlider').value = 2;
			document.getElementById('paddleSpeedSlider').value = 2;
			document.getElementById('numPlayers').value = 4;
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

		startGame();
		pauseGame();
	}

	initPong();

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
				console.error("Erreur lors de la déconnexion.");
			}
		})
		.catch(error => console.error("Erreur réseau : ", error));
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
			console.error("Erreur :", error);
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
			console.error('Error getLangPlayer:', error);
		}
	}
});