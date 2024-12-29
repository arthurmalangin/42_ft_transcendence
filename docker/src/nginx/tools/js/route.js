/**
 * @property {string} html
 * @property {string} css
 * @property {string} js
 */
const routes = {

	'/': {
		html: '/',
		css: '/staticfiles/css/stylehome.css',
		js: '/staticfiles/js/home.js'
	},

	'/login': {
		html: '/login',
		css: '/login/staticfiles/style.css',
		js: '/login/staticfiles/login_btn.js'
	},

	'/register': {
		html: '/login/register',
		css: '/login/staticfiles/style.css',
		js: '/login/staticfiles/register_btn.js'
	},
}

export default routes;