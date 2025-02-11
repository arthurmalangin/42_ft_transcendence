document.addEventListener('friends_event', async()=>{
	function friendsEvent() {
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

		// const brickbreakerLabel = document.getElementById('btn_brickbreaker');
		// brickbreakerLabel.addEventListener('click', () => {
		// 	history.pushState(null, '', '/brickbreaker');
		// 	loadPage('/brickbreaker');
		// });
	}

	friendsEvent();
	friendRequestsBox();
	addFriendsPopup();
	currentFriendBox();

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
	
	async function addFriendsPopup() {
		const addFriendBtn = document.querySelector('#addFriendBtn');
		const popup = document.querySelector('#addFriendPopup');
		const closeBtn = document.querySelector('#closePopup');
		const searchInput = document.querySelector('#friendSearch');
		const searchResults = document.querySelector('#searchResults');

		addFriendBtn.addEventListener('click', () => {
			popup.classList.add('active');
		});

		closeBtn.addEventListener('click', () => {
			popup.classList.remove('active');
		});

		popup.addEventListener('click', (e) => {
			if (e.target === popup) {
			popup.classList.remove('active');
			}
		});

		searchInput.addEventListener('input', async (e) => {
			searchResults.innerHTML = ``
			const searchTerm = e.target.value;
			try {
				const response = await fetch('/api/user_not_friend_exist/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': getCSRFToken()
					},
					body: JSON.stringify({
						username: searchTerm
					})
				});
				const data = await response.json();
				if (response.ok && data.user_exist)
					displayResults(searchTerm);
			} catch (error) {
				console.error('Erreur request:', error);
				alert('Error: ');
			}
		});

		function displayResults(user) {
			searchResults.innerHTML = `
			<div class="search-result">
				<span class="status-indicator status-offline"></span>
				${user}
			</div>
			`;

			document.querySelectorAll('.search-result').forEach((result, index) => {
			result.addEventListener('click', () => {
				addFriend(user);
			});
			});
		}

		async function addFriend(user) {
			// alert(`TODO: send request friend to ${user}`);
			try {
				const response = await fetch('/api/sendRequestFriends/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': getCSRFToken()
					},
					body: JSON.stringify({
						new_friend: user
					})
				});
				const data = await response.json();
				if (response.ok)
					console.log("sendRequestFriends Seem Ok !");
				else {
					console.log("Error sendRequestFriends : " + data.error);
				}
			} catch (error) {
				console.error('Erreur request:', error);
				alert('Error: ');
			}
			popup.classList.remove('active');
		}
	}

	async function currentFriendBox() {
		const currentFriendContainer = document.querySelector('#currentFriends');

		try {
			const response = await fetch('/api/getFriendsList/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				},
			});
			const data = await response.json();

			if (response.ok) {
				const inputString = data.friendsList;

				const userList = inputString.split(',');
				const tabRequest = await Promise.all(userList
					.filter(user => user.trim() !== '')
					.map(async (user, index) => {
						const status = await user_is_online(user);
						return {
							id: index + 1,
							name: user,
							status: status
						};
					})
				);
				// console.log(tabRequest);
			
				function displayCurrentFriends() {
					if (tabRequest.length === 0) {
					currentFriendContainer.innerHTML = `
						<div class="empty-state">
						NO CURRENT FRIEND
						</div>
					`;
					return;
					} else {
						console.log("tabRequest.length > 0")
					}
			
					currentFriendContainer.innerHTML = tabRequest.map(request => `
						<div class="card" data-id="current-friend${request.id}" style="margin-top: 1rem;">
							<div class="friend-item">
								<div>
									<span class="status-indicator status-${request.status}"></span>
									${request.name}
								</div>
								<div class="friend-actions">
									<button class="btn profile-btn" data-username="${request.name}">PROFILE</button>
								</div>
							</div>
						</div>
					`).join('');

					document.querySelectorAll('.profile-btn').forEach(button => {
						button.addEventListener('click', function() {
							const username = this.getAttribute('data-username');
							triggerOverlay(username);
						});
					});

					document.getElementById('closeProfilePopup').addEventListener('click', function() {
						const overlay = document.getElementById('friendProfilePopup');
						overlay.style.display = 'none';
					});

					function triggerOverlay(username) {
						const overlay = document.getElementById('friendProfilePopup');
						overlay.querySelector('.popup-header h2').innerText = `${username} STATS`;
						updateAll(username);
						overlay.style.display = 'flex';
					}
				}
			
				displayCurrentFriends();
			} else {
				console.log("response.ok && data.requestFriendsList not passed !");
			}
		} catch (error) {
			console.error('Erreur request:', error);
			alert('Error: ');
		}

	}

	async function friendRequestsBox() {
		const requestsContainer = document.querySelector('#friendRequests');

		try {
			const response = await fetch('/api/getRequestFriendsList/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				},
			});
			const data = await response.json();

			if (response.ok) {
				const inputString = data.requestFriendsList;

				const userList = inputString.split(',');
				const tabRequest = await Promise.all(userList
					.filter(user => user.trim() !== '')
					.map(async (user, index) => {
						const status = await user_is_online(user);
						return {
							id: index + 1,
							name: user,
							status: status
						};
					})
				);
				// console.log(tabRequest);
			
				function displayRequests() {
					if (tabRequest.length === 0) {
					requestsContainer.innerHTML = `
						<div class="empty-state">
						NO PENDING FRIEND REQUESTS
						</div>
					`;
					return;
					} else {
						console.log("tabRequest.length > 0")
					}
			
					requestsContainer.innerHTML = tabRequest.map(request => `
					<div class="friend-request" data-id="${request.id}">
						<div class="friend-info">
						<span class="status-indicator status-${request.status}"></span>
						${request.name}
						</div>
						<div class="friend-actions">
						<button class="btn accept-btn" onclick="handleRequest(${request.id}, true)">
							ACCEPT
						</button>
						<button class="btn decline-btn" onclick="handleRequest(${request.id}, false)">
							DECLINE
						</button>
						</div>
					</div>
					`).join('');
				}
			
				window.handleRequest = async (id, accept) => {
					const request = tabRequest.find(r => r.id === id);
					// const action = accept ? 'ACCEPTED' : 'DECLINED';
					// alert(`> ${action} FRIEND REQUEST FROM ${request.name}`);
					if (accept) {
						try {
							const response = await fetch('/api/acceptFriendsRequest/', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									'X-CSRFToken': getCSRFToken()
								},
								body: JSON.stringify({
									new_friend: request.name
								})
							});

							const data = await response.json();

							if (response.ok) {
								const index = tabRequest.findIndex(r => r.id === id);
								tabRequest.splice(index, 1);
								currentFriendBox();
								console.log("acceptFriendsRequest Seem Ok !");
							}
							else {
								console.log("Error acceptFriendsRequest : " + data.error);
							}
						} catch (error) {
							console.error('Erreur request:', error);
							alert('Error: ');
						}
					} else {
						try {
							const response = await fetch('/api/denyFriendsRequest/', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									'X-CSRFToken': getCSRFToken()
								},
								body: JSON.stringify({
									deny_friend: request.name
								})
							});
							const data = await response.json();
							if (response.ok) {
								const index = tabRequest.findIndex(r => r.id === id);
								tabRequest.splice(index, 1);
								console.log("denyFriendsRequest Seem Ok !");
							}
							else {
								console.log("Error acceptFriendsRequest : " + data.error);
							}
						} catch (error) {
							console.error('Erreur request:', error);
							alert('Error: ');
						}
					}
					displayRequests();
				};
			
				displayRequests();
			} else {
				console.log("response.ok && data.requestFriendsList not passed !");
			}
		} catch (error) {
			console.error('Erreur request:', error);
			alert('Error: ');
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

	function formatGameTime(seconds) {
		if (isNaN(seconds) || seconds < 0) return "00:00";
		let m = Math.floor(seconds / 60);
		let s = Math.floor(seconds % 60);
		return [m, s].map(unit => String(unit).padStart(2, '0')).join(':');
	}

	async function updateAll(username){
		await updateUserRank(username);
		await updateUserStat(username);
		await updateUserBrickStat(username);
	}

	async function updateUserRank(username){
		try{
			const response = await fetch('/api/updateUserRank/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				},
				body: JSON.stringify({
					name: username
				})
			});

			if (!response.ok) {
				throw new Error(`Erreur API : ${response.statusText}`);
			}
		} catch (error) {
			console.error('Erreur lors de l’appel API :', error);
		}
	}

	async function updateUserStat(username){
		try{
			const response = await fetch(`/api/get_UserStat/?name=${encodeURIComponent(username)}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				},
			});
			
			if(response.ok) {
				const data = await response.json();
				console.log('Player received:', data);
				const UserRankElement = document.getElementById('userrank');
				const UserWinElement = document.getElementById('userwin');
				const UserLoseElement = document.getElementById('userlose');
				const ActualElement = document.getElementById('userActualRate');
				const UserMatchElement = document.getElementById('usermatches');
				const Rank = data.UserRank !== undefined ? data.UserRank : '0';
				const Win = data.UserWin !== undefined ? data.UserWin : '0';
				const Lose = data.Userlose !== undefined ? data.Userlose : '0';
				const Actual = data.UserActual !== undefined ? data.UserActual : '0';
				const Match = data.UserMatch !== undefined ? data.UserMatch : '0';
				
				const formattedActual = parseFloat(Actual).toFixed(2);
				
				UserRankElement.textContent = `${Rank}`
				UserWinElement.textContent = `${Win}`
				UserLoseElement.textContent = `${Lose}`
				ActualElement.textContent = `${formattedActual}`
				UserMatchElement.textContent = `${Match}`
			}
		} catch  (error) {
			console.error('Error updateUserstat:', error);
		}
	}

	async function updateUserBrickStat(username){
		try{
			const response = await fetch(`/api/get_UserBrickStat/?name=${encodeURIComponent(username)}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken()
				},
			});
			
			if(response.ok) {
				const data = await response.json();
				console.log('Player received:', data);
				const UserRankBrickElement = document.getElementById('userrankb');
				const UserScoreBrickElement = document.getElementById('userScore');
				const UserTimeBrickElement = document.getElementById('userTime');	
				const brank = data.Userrank !== undefined ? data.Userrank : '0';
				const bscore = data.Userscore !== undefined ? data.Userscore : '0';
				const btime = data.Usertime !== undefined ? formatGameTime(parseFloat(data.Usertime)) : '00:00';
				
				UserRankBrickElement.textContent = `${brank}`
				UserScoreBrickElement.textContent = `${bscore}`
				UserTimeBrickElement.textContent = `${btime}`
			}
		} catch  (error) {
			console.error('Error updatethree:', error);
		}
	}

	async function user_is_online(user) {
		const response = await fetch('/api/user_is_online/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCSRFToken()
			},
			body: JSON.stringify({
				username: user
			})
		});
		const data = await response.json();
		if (response.ok) {
			console.log("user_is_online Seem Ok !");
			if (data.is_online)
				return "online";
			else
				return "offline";
		}
		else {
			console.log("Error user_is_online : " + data.error);
		}
	}


	function getCSRFToken() {
		const csrfCookie = document.cookie
			.split('; ')
			.find(row => row.startsWith('csrftoken='));
		return csrfCookie ? csrfCookie.split('=')[1] : '';
	}
})