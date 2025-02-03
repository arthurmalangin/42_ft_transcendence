document.addEventListener('leaderboard_event', async()=>{

	function leaderboardEvent() {
		updateKing();
		updatethree();
		updateKingbrick();
		updatethreebrick();
		updateMyStat();
		updateMyBrickStat();
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

	leaderboardEvent();
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
	
	async function updateKing(){
		try {
			const response = await fetch('/api/get_NumberOne/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});

			if(response.ok) {
				const data = await response.json();
				console.log('players data:', data);
				const BestPlayerElement = document.getElementById(`player`);
				const BestRateElement = document.getElementById(`win`);
				const BestNumberElement = document.getElementById(`matches`);
				BestPlayerElement.textContent = `${data.username}`;
				const win = data.win !== undefined ? data.win : '0';
				const matches = data.matches !== undefined ? data.matches : '0';
				BestRateElement.textContent = `${win}`;
				BestNumberElement.textContent = `${matches}`;
			}
		} catch  (error) {
			console.error('Error updateKing:', error);
		}
	}

	async function updatethree(){
		try {
			const response = await fetch('/api/get_thethree/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});

			if (response.ok) {
				const data = await response.json();
				console.log('Players received:', data);
				data.forEach((player, index) => {
					const nameElement = document.getElementById(`player${index + 1}`);
					const winElement = document.getElementById(`win${index + 1}`);
					const loseElement = document.getElementById(`lose${index + 1}`);
					const rateElement = document.getElementById(`rate${index + 1}`);
					const win = player.win !== undefined ? player.win : '0';
					const lose = player.lose !== undefined ? player.lose : '0';
					const rate = player.rate !== undefined ? player.rate : '0';
					const formattedRate = parseFloat(rate).toFixed(2);
					
					nameElement.textContent = `${player.username}`
					winElement.textContent = `${win}`
					loseElement.textContent = `${lose}`
					rateElement.textContent = `${formattedRate}`
				});
			}
		} catch  (error) {
			console.error('Error updatethree:', error);
		}
	}

	async function updateKingbrick(){
		try {
			const response = await fetch('/api/get_NumberOneBrick/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});

			if(response.ok) {
				const data = await response.json();
				console.log('players data:', data);
				const BestPlayerElement = document.getElementById(`bplayer`);
				const BestScoreElement = document.getElementById(`bscore`);
				const BestNumberElement = document.getElementById(`bmatches`);
				BestPlayerElement.textContent = `${data.username}`;
				const score = data.score !== undefined ? data.score : '0';
				const matches = data.matches !== undefined ? data.matches : '0';

				BestScoreElement.textContent = `${score}`;
				BestNumberElement.textContent = `${matches}`;
			}
		} catch  (error) {
			console.error('Error updateKing:', error);
		}
	}

	async function updatethreebrick(){
		try {
			const response = await fetch('/api/get_thethreeBrick/', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				}
			});

			if (response.ok) {
				const data = await response.json();
				console.log('Players received:', data);
				data.forEach((player, index) => {
					const nameElement = document.getElementById(`bplayer${index + 1}`);
					const scoreElement = document.getElementById(`bscore${index + 1}`);
					const score = player.score !== undefined ? player.score : '0';

					nameElement.textContent = `${player.username}`
					scoreElement.textContent = `${score}`
				});
			}
		} catch  (error) {
			console.error('Error updatethree:', error);
		}
	}

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
			}
		} catch  (error) {
			console.error('Error updatethree:', error);
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
			console.error('Error updatethree:', error);
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
				window.location.href = '/login/';
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