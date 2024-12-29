function homeEvent() {
	const registerLabel = document.getElementById('btn_logout');
	registerLabel.addEventListener('click', () => {
		logout();
	});

	const leaderboardLabel = document.getElementById('btn_leaderboard');
	leaderboardLabel.addEventListener('click', () => {
		history.pushState(null, '', '/leaderboard');
		loadPage('/leaderboard');
	});
}

homeEvent();

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
