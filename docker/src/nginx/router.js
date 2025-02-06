const routes = {
	'/': {
		html: '/home',
		css: '/static/css/stylehome.css',
		js: '/static/js/home.js',
		event: 'home_event',
		needLogin: true
	},

	'/login': {
		html: '/srclogin',
		css: '/static/css/login.css',
		js: '/static/js/login_btn.js',
		event: 'login_event',
		needLogin: false
	},

	'/register': {
		html: '/srclogin/register',
		css: '/static/css/login.css',
		js: '/static/js/register_btn.js',
		event: 'register_event',
		needLogin: false
	},

	'/leaderboard': {
		html: '/srcleaderboard',
		css: '/static/css/stylehome.css',
		js: '/static/js/leaderboard.js',
		event: 'leaderboard_event',
		needLogin: true
	},

	'/friends': {
		html: '/srcfriends',
		css: '/static/css/friends.css',
		js: '/static/js/friends.js',
		event: 'friends_event',
		needLogin: true
	},

	'/settings': {
		html: '/srcsettings',
		css: '/static/css/settings.css',
		js: '/static/js/settings.js',
		event: 'settings_event',
		needLogin: true
	},

	'/game': {
		html: '/srcgame',
		css: '/static/css/game.css',
		js: '/static/js/game.js',
		event: 'game_event',
		needLogin: true
	},

	'/menu': {
        html: '/srcgame/menu',
        css: '/static/css/menu.css',
        js: '/static/js/menu.js',
        event: 'menuplay_event',
        needLogin: true
    },

	'/brickbreaker': {
		html: '/srcbrickbreaker',
		css: '/static/css/brickbreaker.css',
		js: '/static/js/brickbreaker.js',
		event: 'brickbreaker_event',
		needLogin: true
	},

	'/mystats': {
		html: '/srcmystats',
		css: '/static/css/mystats.css',
		js: '/static/js/mystats.js',
		event: 'mystats_event',
		needLogin: true
	},

	'/multipong': {
		html: '/srcmultipong',
		css: '/static/css/multipong.css',
		js: '/static/js/multipong.js',
		event: 'multipong_event',
		needLogin: true
	},

	'/tourpong': {
		html: '/srctourpong',
		css: '/static/css/tourpong.css',
		js: '/static/js/tourpong.js',
		event: 'tourpong_event',
		needLogin: true
	},

	'/404': {
		html: '/home/404',
		css: '/static/css/404.css',
		js: '',
		event: '',
		needLogin: false
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
		if (!routes[normalizedUrl]) {
            console.log("Url not found ==> redirecting to 404");
            normalizedUrl = '/404';  
        } else if (routes[normalizedUrl].needLogin && !(await is_auth())) {
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
        // console.log(js_content);

        box_main.innerHTML = htmlcontent;
        box_css.innerHTML = css_content;

		while (box_js.firstChild) {
			box_js.removeChild(box_js.firstChild);
		}
		
        loadJsEvent(box_js, routes[normalizedUrl].event, routes[normalizedUrl].js) 
        
		console.log("Load Page: " + normalizedUrl + " !");
        resolve(true);
    });
}

function unloadJs() {
	const js = document.getElementById('js_app_script');
	if (js)
		js.remove();
	document.getElementById('js').innerHTML = '';
}

function loadJsEvent(box_js, eventName, js_path) {
	unloadJs();
	const chartscript = document.createElement('script');
	chartscript.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js";
	chartscript.id = 'char_app_script';
	box_js.appendChild(chartscript);
	const script = document.createElement('script');
	script.src = js_path;
	script.type = 'module';
	script.id = 'js_app_script';
	box_js.appendChild(script);
	script.onload = () => {
		console.log(`script ${eventName} loaded.`);
		document.dispatchEvent(new CustomEvent(eventName));
	};
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("router.js Log ! with path : |" + window.location.pathname + "|");
    const path = window.location.pathname;
    await loadPage(path);

	window.addEventListener('popstate', async (event) => {
        const newPath = window.location.pathname;
        console.log("popstate event load page: ", newPath);
        await loadPage(newPath);
    });
    // console.log("" + path);
});

function getCSRFToken() {
    const csrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='));
    return csrfCookie ? csrfCookie.split('=')[1] : '';
}