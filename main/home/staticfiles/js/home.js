document.addEventListener('home_event', async()=>{
	function homeEvent() {
		updateWelcomeMessage();
		updateRank();
		updateWinRate();
		updateMatches();
		updateLastMatches();
		
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
		
		// const brickbreakerLabel = document.getElementById('btn_brickbreaker');
		// brickbreakerLabel.addEventListener('click', () => {
			// 	history.pushState(null, '', '/brickbreaker');
			// 	loadPage('/brickbreaker');
			// });
		}
		
		homeEvent();
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

	async function updateWinRate(){
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
				const rateElement = document.getElementById('winRate');
				if (data.winRate) {
					rateElement.textContent = Math.ceil(`${data.winRate}`);
				} else {
					rateElement.textContent = 'N/A';
				}
			}
		} catch (error) {
			console.error('Error updating rank:', error);
		}
	}

	async function updateMatches(){
		try{
			const response = await fetch('/api/get_Nmatches/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});
		
			if (response.ok) {
				const data = await response.json();
				const matchElement = document.getElementById('match');
				if (data.match) {
					matchElement.textContent = `${data.match}`;
				} else {
					matchElement.textContent = 'N/A';
				}
			}
		} catch (error) {
			console.error('Error updating rank:', error);
		}
	}

	async function updateLastMatches() {
		try{
			const response = await fetch('/api/get_Lastmatches/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});

			if (response.ok) {
				const data = await response.json();
				data.forEach((match, index) => {
					const lastMatchElement = document.getElementById(`player${index+1}`)
					const lastResultElement = document.getElementById(`result${index+1}`)
					if(match.opponent) {
						lastMatchElement.textContent = `vs ${data.opponent}`;
					} else {
						lastMatchElement.textContent = `vs ...`;
					}
					if(data.myScore && data.oppScore) {
						lastResultElement.textContent = `${data.myScore} - ${data.oppScore}`;
					} else {
						lastResultElement.textContent = ` - `
					}
				})
			}
		} catch (error) {
			console.error('Error updating last matches:', error);
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