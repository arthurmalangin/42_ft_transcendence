const routes = {

	'/': {
		html: '/',
		css: '/staticfiles/css/stylehome.css',
		js: '/staticfiles/js/home.js'
	},

	'/login': {
		html: '/srclogin',
		css: '/static/css/login.css',
		js: '/static/js/login_btn.js'
	},

	'/register': {
		html: '/srclogin/register',
		css: '/static/css/login.css',
		js: '/static/js/register_btn.js'
	},
}

async function loadPage(url) {
    return new Promise(async (resolve, reject) => {
        const box_main = document.getElementById('app');
        const box_css = document.getElementById('css');
        const box_js = document.getElementById('js');

		const normalizedUrl = url.replace(/\/$/, '');
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
    console.log("router.js Log ! with path :" + window.location.pathname);
    const path = window.location.pathname;
    await loadPage(path);
    // console.log("" + path);
});
