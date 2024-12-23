document.addEventListener('DOMContentLoaded', () => {
	const registerLabel = document.getElementById('btn_logout');
	registerLabel.addEventListener('click', () => {
		logout();
	});
});

function logout() {
    fetch('/login/logout/', { // URL de votre endpoint logout
        method: 'POST', // Méthode POST
        headers: {
            'X-CSRFToken': getCSRFToken() // Ajoutez le CSRF token
        },
    })
    .then(response => {
        if (response.ok) {
            // Redirection après le logout
            window.location.href = '/login/'; // Redirige vers la page de connexion
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
