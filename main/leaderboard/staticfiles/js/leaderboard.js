function leaderboardEvent() {
	const registerLabel = document.getElementById('btn_logout');
	registerLabel.addEventListener('click', () => {
		logout();
	});

	const homeLabel = document.getElementById('btn_home');
	homeLabel.addEventListener('click', () => {
		history.pushState(null, '', '/');
		loadPage('/');
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
