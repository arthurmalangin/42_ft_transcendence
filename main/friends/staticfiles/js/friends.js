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
	
	friendsEvent();
	friendRequestsBox();
	addFriendsPopup();
	currentFriendBox();
	
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
								<button class="btn">MESSAGE</button>
								<button class="btn">INVITE</button>
							</div>
						</div>
					</div>
					`).join('');
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
