import Login from './pages/login.js';
import Notes from './pages/notes.js';
import Signup from './pages/signup.js';
import Admin from './pages/admin.js';

const routes = [
	{ path: '/', redirect: '/login' },
	{ path: '/login', component: Login },
	{ path: '/notes', component: Notes },
	{ path: '/signup', component: Signup },
	{ path: '/admin', component: Admin },
];

const router = VueRouter.createRouter({
	history: VueRouter.createWebHashHistory(),
	routes,
});

const app = Vue.createApp({
	data() {
		return {
			isAdmin: localStorage.getItem('is_admin') === 'true',
			token: localStorage.getItem('token') || '',
		};
	},
	watch: {
		token(newVal) {
			localStorage.setItem('token', newVal);
			if (newVal) {
				this.$axios.defaults.headers.common['Authorization'] = `Bearer ${newVal}`;
			} else {
				delete this.$axios.defaults.headers.common['Authorization'];
			}
		},
		isAdmin(newVal) {
			localStorage.setItem('is_admin', newVal);
		}
	},
	created() {
		if (this.token) {
			this.$axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
		}
	}
});
app.use(router);
app.config.globalProperties.$axios = axios.create();
app.mount('#app');
