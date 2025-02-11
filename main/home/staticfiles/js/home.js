document.addEventListener('home_event', async()=>{
	function homeEvent() {
		updateWelcomeMessage();
		update_Rank();
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

		const mystatsLabel = document.getElementById('btn_mystats');
		mystatsLabel.addEventListener('click', () => {
			history.pushState(null, '', '/mystats');
			loadPage('/mystats');
		});
		
		const quickPongLabel = document.getElementById('quickPlayPong');
		quickPongLabel.addEventListener('click', () => {
			history.pushState(null, '', '/game');
			loadPage('/game');
		});

		const quickTourpongLabel = document.getElementById('quickPlayTourpong');
		quickTourpongLabel.addEventListener('click', () => {
			history.pushState(null, '', '/tourpong');
			loadPage('/tourpong');
		});
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
			console.log('Error updating welcome message:', error);
		}
	}

	async function update_Rank(){
		await updateRankBrick();
		await updateRank();
		await getRank();
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

	async function updateRank(){
		try{
			const response = await fetch('/api/update_rank/', {
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

	async function getRank(){
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
			console.log('Error updating rank:', error);
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
					const formattedRate = parseFloat(data.winRate).toFixed(2);
					rateElement.textContent = `${formattedRate}`;
				} else {
					rateElement.textContent = '0';
				}
			}
		} catch (error) {
			console.log('Error updating winrate:', error);
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
			console.log('Error updating matches:', error);
		}
	}

	async function updateLastMatches(){
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
				console.log('Matches received:', data);
				data.forEach((match, index) => {
					const lastMatchElement = document.getElementById(`player${index + 1}`);
					const lastResultElement = document.getElementById(`result${index + 1}`);
					lastMatchElement.textContent = match.opponent;
					const myScore = match.myScore !== undefined ? match.myScore : '0';
					const oppScore = match.oppScore !== undefined ? match.oppScore : '0';
					lastResultElement.textContent = `${myScore} - ${oppScore}`;
				});
			}  
		} catch (error) {
			console.log('Error updating last matches:', error);
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
				console.log("Erreur lors de la déconnexion.");
			}
		})
		.catch(error => console.log("Erreur réseau : ", error));
	}


	function getCSRFToken() {
		const csrfCookie = document.cookie
			.split('; ')
			.find(row => row.startsWith('csrftoken='));
		return csrfCookie ? csrfCookie.split('=')[1] : '';
	}
})