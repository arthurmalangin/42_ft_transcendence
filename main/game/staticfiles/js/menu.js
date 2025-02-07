document.addEventListener('menuplay_event', async()=>{
	function menuEvent() {
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

		// Game mode cards

		const btn_pong_classic = document.getElementById('btn_pong_classic');
		btn_pong_classic.addEventListener('click', () => {
			history.pushState(null, '', '/game');
			loadPage('/game');
		});

		const btn_pong_tournament = document.getElementById('btn_pong_tournament');
		btn_pong_tournament.addEventListener('click', () => {
			history.pushState(null, '', '/tourpong');
			loadPage('/tourpong');
		});

		const btn_pong_4players = document.getElementById('btn_pong_4players');
		btn_pong_4players.addEventListener('click', () => {
			history.pushState(null, '', '/multipong');
			loadPage('/multipong');
		});

		const btn_brickbreaker_classic = document.getElementById('btn_brickbreaker_classic');
		btn_brickbreaker_classic.addEventListener('click', () => {
			history.pushState(null, '', '/brickbreaker');
			loadPage('/brickbreaker');
		});

		const btn_brickbreaker_tournament = document.getElementById('btn_brickbreaker_tournament');
		btn_brickbreaker_tournament.addEventListener('click', () => {
			history.pushState(null, '', '/tourbrickbreaker');
			loadPage('/tourbrickbreaker');
		});
	}

	menuEvent();

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

});