document.addEventListener('home_event', async()=>{
	function homeEvent() {
		updateWelcomeMessage();
		updateRank();
		getWinRate();
		updateMatches();

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
			history.pushState(null, '', '/game');
			loadPage('/game');
		});

		const brickbreakerLabel = document.getElementById('btn_brickbreaker');
		brickbreakerLabel.addEventListener('click', () => {
			history.pushState(null, '', '/brickbreaker');
			loadPage('/brickbreaker');
		});
	}

	homeEvent();

	async function updateWelcomeMessage() {
		try {
			const response = await fetch('/api/get_username/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				const welcomeMessageElement = document.querySelector('.panel-header');
				if (data.username) {
					welcomeMessageElement.textContent = `> WELCOME BACK, ${data.username}`;
				} else {
					welcomeMessageElement.textContent = '> WELCOME BACK, GUEST';
				}
			}
		} catch (error) {
			console.error('Error updating welcome message:', error);
		}
	}

	async function updateRank(){
		try{
			const response = await fetch('/api/get_rank/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});
		
			if (response.ok) {
				const data = await response.json();
				const rankElement = document.getElementById('rank');
				if (data.rank) {
					rankElement.textContent = `#${data.rank}`;
				} else {
					rankElement.textContent = 'N/A';
				}
			}
		} catch (error) {
			console.error('Error updating rank:', error);
		}
	}

	async function getWinRate(){
		try{
			const response = await fetch('/api/get_win_rate/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				const rankElement = document.getElementById('winRate');
				if (data.winRate) {
					rankElement.textContent = `${data.winRate}`;
				} else {
					rankElement.textContent = 'N/A';
				}
			}
		} catch (error) {
			console.error('Error updating rank:', error);
		}
	}

	async function updateMatches(){
		try{
			const response = await fetch('/api/get_matches/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});
		
			if (response.ok) {
				const data = await response.json();
				const matchElement = document.getElementById('match');
				if (data.matches) {
					matchElement.textContent = `${data.matches}`;
				} else {
					matchElement.textContent = 'N/A';
				}
			}
		} catch (error) {
			console.error('Error updating rank:', error);
		}
	}

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


	function getCSRFToken() {
		const csrfCookie = document.cookie
			.split('; ')
			.find(row => row.startsWith('csrftoken='));
		return csrfCookie ? csrfCookie.split('=')[1] : '';
	}
})