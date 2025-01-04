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
}

friendsEvent();
addFriendsPopup();

function addFriendsPopup() {
	const addFriendBtn = document.querySelector('#addFriendBtn');
	const popup = document.querySelector('#addFriendPopup');
	const closeBtn = document.querySelector('#closePopup');
	const searchInput = document.querySelector('#friendSearch');
	const searchResults = document.querySelector('#searchResults');

	const sampleUsers = [
		{ id: 1, name: 'PLAYER_123', status: 'ONLINE' },
		{ id: 2, name: 'PLAYER_456', status: 'OFFLINE' },
		{ id: 3, name: 'PLAYER_789', status: 'ONLINE' },
	];

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

	searchInput.addEventListener('input', (e) => {
		const searchTerm = e.target.value.toUpperCase();
		const filteredUsers = sampleUsers.filter(user => 
		user.name.includes(searchTerm)
		);
		
		displayResults(filteredUsers);
	});

	function displayResults(users) {
		searchResults.innerHTML = users.map(user => `
		<div class="search-result">
			<span class="status-indicator status-${user.status.toLowerCase()}"></span>
			${user.name}
		</div>
		`).join('');

		document.querySelectorAll('.search-result').forEach((result, index) => {
		result.addEventListener('click', () => {
			addFriend(users[index]);
		});
		});
	}

	function addFriend(user) {
		alert(`TODO: do request addfriend to ${user.name}`);
		popup.classList.remove('active');
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
