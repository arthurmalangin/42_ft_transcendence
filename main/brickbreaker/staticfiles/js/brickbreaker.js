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

		let lives = 3;

		let player = {
			width: paddleWidth,
			height: paddleHeight,
			speed: paddleSpeed,
			lives: lives,
			x: boardWidth / 2 - paddleWidth / 2,
			y: 10
		};

		let ballWidth = 10;
		let ballHeight = 10;
		let ballSpeed = 2;

		let ball = {
			width: ballWidth,
			height: ballHeight,
			speed: ballSpeed,
			velocityX: 0,
			velocityY: 0,
			x: boardWidth / 2 - ballWidth / 2,
			y: 10 + ballHeight / 2
		};

		let totalTime = 0;

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
		}

		function addAllEventListeners() {
			const navbarElements = [
				'btn_logout',
				'btn_leaderboard',
				'btn_settings',
				'btn_home',
				'btn_friends',
				'btn_brickbreaker'
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
		}

	//////////////////////////////////////////////////////////////////////////////////
	/////////////                      BRICKBREAKER                       ////////////
	//////////////////////////////////////////////////////////////////////////////////

		function startGame() {
			board = document.getElementById('board');
			context = board.getContext('2d');
			board.width = boardWidth;
			board.height = boardHeight;
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
			removeAllEventListeners();

			if (!isPaused)
				pauseGame();

			if (fullCleanup) 
				return;
		}

		function gameLoop() {
			context.clearRect(0, 0, boardWidth, boardHeight);

			// draw();
			// updatePlayerPosition();
		}

		startGame();
		// pauseGame();
	}

	initBrickbreaker();
});