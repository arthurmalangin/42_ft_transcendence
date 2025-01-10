function settingsRenderEvent() {
	updatePlayerInfo()
	updateImage();
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

	const btn_username = document.getElementById('btn_username');
	btn_username.addEventListener('click', async () => {
		const usernameValue = document.getElementById('input_username').value;
		const isUser42 = await user_is_42();
		if (!isUser42) {
			if (usernameValue.trim() !== "") {
				changeUsername(usernameValue);
			} else {
				alert("Le nom d'utilisateur ne peut pas être vide.");
			}
		} else {
			alert("Auth with 42, you cannot change username !");
		}
	});

	const btn_password = document.getElementById('btn_password');
	btn_password.addEventListener('click', async () => {
		const passwordValue = document.getElementById('input_password').value;
		console.log("btn_password event: " + passwordValue);
		if (await !user_is_42()) {
			if (passwordValue.trim() !== "") {
				changePassword(passwordValue);
			} else {
				alert("Le mot de passe ne peut pas être vide.");
			}
		} else {
			alert("Auth with 42, you cannot change password !");
		}
	});

	document.getElementById('btn_upload_avatar').addEventListener('click', function () {
		const fileInput = document.getElementById('avatar_upload');
		const file = fileInput.files[0];
	
		if (file) {
			const reader = new FileReader();
			
			reader.onloadend = function () {
				const base64Image = reader.result.split(',')[1];
				console.log(base64Image);
				uploadAvatar(base64Image);
			};
			
			reader.readAsDataURL(file);
		} else {
			alert("Select file first !");
		}
	});
	
}

settingsRenderEvent();

async function uploadAvatar(base64Image) {
	try {
		const response = await fetch('/api/upload_avatar/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCSRFToken(),
			},
			body: JSON.stringify({
				avatar: base64Image
			})
		});

		const data = await response.json();

		if (response.ok) {
			console.log('Avatar upload success:', data.success);
			alert('Avatar Update success !');
		} else {
			console.error('Error Download Avatar:', data.error);
			alert('Error update avatar.');
		}
	} catch (error) {
		console.error('Error:', error);
		alert('Error update avatar');
	}
}

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

async function updateImage() {
    const avatarDisplay = document.getElementById('avatar_display');

    try {
        const response = await fetch('/api/get_avatar/');
        const data = await response.json();

        if (response.ok && data.avatar_base64) {
            avatarDisplay.src = `data:image/png;base64,${data.avatar_base64}`;
        }
    } catch (error) {
        console.error('Error get avatar img:', error);
        // avatarDisplay.src = '{% static "default_avatar.png" %}';
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

async function user_is_42() {
	const response = await fetch('/api/user_is_42/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': getCSRFToken()
		}
	});
	const data = await response.json();
	if (response.ok) {
		console.log("user_is_42 Seem Ok !");
		if (data.user_42) {
			console.log("data.user_42 is true");
			return true;
		}
		else {
			console.log("data.user_42 is false");
			return false;
		}
	}
	else {
		console.log("Error user_is_42 : " + data.error);
	}
}


function getCSRFToken() {
    const csrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='));
    return csrfCookie ? csrfCookie.split('=')[1] : '';
}
