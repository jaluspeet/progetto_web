import Login from './pages/login.js';
import Notes from './pages/notes.js';
import Signup from './pages/signup.js';
import Admin from './pages/admin.js';
import Account from './pages/account.js';

// NOTE: per le pagine frontend si preferisce caricare le dipendenze via CDN, sarà dunque necessario
// usare import invece che require e importare l'oggetto Vue / VueRouter

// route
const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/notes', component: Notes },
    { path: '/signup', component: Signup },
    { path: '/admin', component: Admin },
    { path: '/account', component: Account },
];

// inizializzazione cronologia router
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

// inizializzazione app vue
const app = Vue.createApp({
    data() {
        return {
            isAdmin: localStorage.getItem('is_admin') === 'true',
            token: localStorage.getItem('token') || '',
        };
    },

    watch: {

        // gestione token
        token(newVal) {
            localStorage.setItem('token', newVal);
            if (newVal) {
                this.$axios.defaults.headers.common['Authorization'] = `Bearer ${newVal}`;
            } else {
                delete this.$axios.defaults.headers.common['Authorization'];
            }
        },

        // gestione admin
        isAdmin(newVal) {
            localStorage.setItem('is_admin', newVal);
        }
    },

    // imposta token
    created() {
        if (this.token) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        }
    }
});

app.use(router);
app.config.globalProperties.$axios = axios.create();
app.mount('#app');