document.addEventListener('mystats_event', async()=>{
	function mystatsEvent() {
		console.log("mystatsEvent called");
		console.log("updateRecentGames reference:", updateRecentGames);
		updateMyStat();
		updateMyBrickStat();
		updateRecentGames();
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
	
	mystatsEvent();
	
	async function updateMyStat(){
		try{
			const response = await fetch('/api/get_myStat/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});
			
			if(response.ok) {
				const data = await response.json();
				console.log('Player received:', data);
				const myRankElement = document.getElementById('myrank');
				const myWinElement = document.getElementById('mywin');
				const myLoseElement = document.getElementById('mylose');
				const myBestRateElement = document.getElementById('myBestRate');
				const ActualElement = document.getElementById('myActualRate');
				const myMatchElement = document.getElementById('mymatches');
				const Rank = data.myRank !== undefined ? data.myRank : '0';
				const Win = data.myWin !== undefined ? data.myWin : '0';
				const Lose = data.mylose !== undefined ? data.mylose : '0';
				const myBest = data.myBest !== undefined ? data.myBest : '0';
				const Actual = data.myActual !== undefined ? data.myActual : '0';
				const Match = data.myMatch !== undefined ? data.myMatch : '0';
				
				const formattedBest = parseFloat(myBest).toFixed(2);
				const formattedActual = parseFloat(Actual).toFixed(2);
				
				myRankElement.textContent = `${Rank}`
				myWinElement.textContent = `${Win}`
				myLoseElement.textContent = `${Lose}`
				myBestRateElement.textContent = `${formattedBest}`
				ActualElement.textContent = `${formattedActual}`
				myMatchElement.textContent = `${Match}`
				drawCanva(Win, Lose, "pongChart");
			}
		} catch  (error) {
			console.log('Error updatethree:', error);
		}
	}
	
	function formatGameTime(seconds) {
		if (isNaN(seconds) || seconds < 0) return "00:00";
		let m = Math.floor(seconds / 60);
		let s = Math.floor(seconds % 60);
		return [m, s].map(unit => String(unit).padStart(2, '0')).join(':');
	}
	
	async function updateMyBrickStat(){
		try{
			const response = await fetch('/api/get_myBrickStat/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});
			
			if(response.ok) {
				const data = await response.json();
				console.log('Player received:', data);
				const myRankBrickElement = document.getElementById('myrankb');
				const myScoreBrickElement = document.getElementById('myScore');
				const myTimeBrickElement = document.getElementById('myTime');
				const brank = data.myrank !== undefined ? data.myrank : '0';
				const bscore = data.myscore !== undefined ? data.myscore : '0';
				const btime = data.mytime !== undefined ? formatGameTime(parseFloat(data.mytime)) : '00:00';
				
				myRankBrickElement.textContent = `${brank}`
				myScoreBrickElement.textContent = `${bscore}`
				myTimeBrickElement.textContent = `${btime}`
			}
		} catch  (error) {
			console.log('Error updatethree:', error);
		}
	}
	
	async function updateRecentGames(){
		try{
			const response = await fetch('/api/get_LastGames/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				console.log('Games received:', data);
				data.forEach((game, index) => {
					const lastGameElement = document.getElementById(`gamebrick${index + 1}`);
					const lastTimeElement = document.getElementById(`timebrick${index + 1}`);
					const scorebck = game.scorebrk !== undefined ? game.scorebrk : '0';
					const timebck = game.timebrk !== undefined ? formatGameTime(parseFloat(game.timebrk)) : '00:00';
					lastGameElement.textContent = `${scorebck}`;
					lastTimeElement.textContent = `${timebck}`;
				});
			}  
		} catch (error) {
			console.log('Error updating games:', error);
		}
	}

	function	drawCanva(Win, Lose, element){
		const ctx = document.getElementById(`${element}`);
		
		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: ['Win', 'Lose'],
				datasets: [{
					label: 'Ratio Win/Lose',
					data: [Win, Lose],
					borderColor: '#00ff00',
					backgroundColor: '#00ff00',
					borderWidth: 1,
					barPercentage: 0.5
				}]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
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
})