const routes = {
	'/': {
		html: '/home',
		css: '/static/css/stylehome.css',
		js: '/static/js/home.js',
		needLogin: true
	},

	'/login': {
		html: '/srclogin',
		css: '/static/css/login.css',
		js: '/static/js/login_btn.js',
		needLogin: false
	},

	'/register': {
		html: '/srclogin/register',
		css: '/static/css/login.css',
		js: '/static/js/register_btn.js',
		needLogin: false
	},

	'/leaderboard': {
		html: '/srcleaderboard',
		css: '/static/css/stylehome.css',
		js: '/static/js/leaderboard.js',
		needLogin: true
	},

	'/settings': {
		html: '/srcsettings',
		css: '/static/css/settings.css',
		js: '/static/js/settings.js',
		needLogin: true
	},
}

async function is_auth() {
    try {
        const response = await fetch('/api/is_auth/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });

        const data = await response.json();

        if (data.is_authenticated) {
            console.log(`User is authenticated as ${data.username}`);
            return (true)
        } else {
            console.log('User is not authenticated');
            return (false)
        }
    } catch (error) {
        console.error('Error checking authentication status:', error);
    }
}

async function loadPage(url) {
    return new Promise(async (resolve, reject) => {
		let normalizedUrl = url === '/' ? '/' : url.replace(/\/$/, '');
		if (routes[normalizedUrl].needLogin && !(await is_auth())) {
			normalizedUrl = '/login';
			console.log('redirect to login => not auth');
		} else {
			console.log("need login: " + routes[normalizedUrl].needLogin);
		}
        const box_main = document.getElementById('app');
        const box_css = document.getElementById('css');
        const box_js = document.getElementById('js');

        // console.log(routes[url].html);
        const html = await fetch(routes[normalizedUrl].html);
        const htmlcontent = await html.text();

        const css = await fetch(routes[normalizedUrl].css);
        const css_content = await css.text();

        const js = await fetch(routes[normalizedUrl].js);
        const js_content = await js.text();
        // console.log(js_content);

        box_main.innerHTML = htmlcontent;
        box_css.innerHTML = css_content;

		while (box_js.firstChild) {
			box_js.removeChild(box_js.firstChild);
		}
		
        const script = document.createElement('script');
        script.textContent = js_content;
		script.defer = true;
        box_js.appendChild(script); 
        
		console.log("Load Page: " + normalizedUrl + " !");
        resolve(true);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("router.js Log ! with path : |" + window.location.pathname + "|");
    const path = window.location.pathname;
    await loadPage(path);
    // console.log("" + path);
});

function getCSRFToken() {
    const csrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='));
    return csrfCookie ? csrfCookie.split('=')[1] : '';
}