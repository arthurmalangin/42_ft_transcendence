// document.addEventListener('DOMContentLoaded', () => {
const registerLabel = document.getElementById('register');
// console.log(registerLabel);
registerLabel.addEventListener('click', () => {
	history.pushState(null, '', '/register'); 
	loadPage('/register');
});

const loginButton = document.getElementById('loginBtn');
// console.log(loginButton);
loginButton.addEventListener('click', async () => {
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	// const errorMessage = document.getElementById('errorMessage');
	// errorMessage.textContent = '';

	if (!username || !password) {
		alert('Veuillez remplir tous les champs.');
		// errorMessage.textContent = 'Veuillez remplir tous les champs.';
		return;
	}

	try {
		const response = await fetch('/srclogin/reqlogin/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCSRFToken() // token CSRF ??
			},
			body: JSON.stringify({ username, password })
		});

		// const data = await response.json();
		const data = await response.text();

		if (response.ok) {
			if (data === "success") {
				history.pushState(null, '', '/'); 
			}
			else {
				alert(data);
			}
		} else {
			alert(data);
			// errorMessage.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
		}
	} catch (error) {
		alert('Une erreur s\'est produite. Veuillez réessayer.');
		// errorMessage.textContent = 'Une erreur s\'est produite. Veuillez réessayer.';
		console.error('Erreur:', error);
	}
});
// });

function getCSRFToken() {
    const csrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='));
    return csrfCookie ? csrfCookie.split('=')[1] : '';
}
