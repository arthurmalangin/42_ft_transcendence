function settingsRenderEvent() {
	updatePlayerInfo()
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

	const btn_username = document.getElementById('btn_username');
	btn_username.addEventListener('click', () => {
		const usernameValue = document.getElementById('input_username').value;

		if (usernameValue.trim() !== "") {
			changeUsername(usernameValue);
		} else {
			alert("Le nom d'utilisateur ne peut pas être vide.");
		}
	});

	const btn_password = document.getElementById('btn_password');
	btn_password.addEventListener('click', () => {
		const passwordValue = document.getElementById('input_password').value;
		console.log("btn_password event: " + passwordValue);
		if (passwordValue.trim() !== "") {
			changePassword(passwordValue);
		} else {
			alert("Le mot de passe ne peut pas être vide.");
		}
	});
}

settingsRenderEvent();

async function changeUsername(newUsername) {
    try {
        const response = await fetch('/api/update_username/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                username: newUsername
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Username update success:', data.success);
            alert('Username update success !');
        } else {
            console.error('Error updateUsername:', data.error);
            alert('Erreur updateUsername.');
        }
    } catch (error) {
        console.error('Erreur request:', error);
        alert('Update Username Error.');
    }
}

async function changePassword(newPassword) {
    try {
		console.log("Attemp to changePassword with value:" + newPassword);
        const response = await fetch('/api/update_password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                password: newPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Password update success:', data.success);
            alert('Password Update Success !');
        } else {
            console.error('Error updatePassword:', data.error);
            alert('Error updatePassword.');
        }
    } catch (error) {
        console.error('Erreur request:', error);
        alert('Update Password Error.');
    }
}

async function updatePlayerInfo() {
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
			if (data.username) {
				document.getElementById('input_username').placeholder = `${data.username}`;
			}
		}
    } catch (error) {
        console.error('Error updating welcome message:', error);
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
