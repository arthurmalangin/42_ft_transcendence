function leaderboardEvent() {
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

leaderboardEvent();

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
