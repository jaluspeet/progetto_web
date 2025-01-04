const Login = {
    template: `
    <div class="container mt-5">
        <h1 class="text-center">login</h1>
        <form @submit.prevent="handlelogin" class="mx-auto" style="max-width: 400px;">
            <div class="mb-3">
                <label for="username" class="form-label">username</label>
                <input type="text" v-model="username" class="form-control" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">password</label>
                <input type="password" v-model="password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">Login</button>
        </form>
        <p class="text-center mt-3">non hai un account? <router-link to="/signup">registrati</router-link></p>
    </div>
    `,
    data() {
        return {
            username: '',
            password: '',
        };
    },
    methods: {
        async handlelogin() {
            try {
                const response = await this.$axios.post('/api/login', {
                    username: this.username,
                    password: this.password,
                });
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('is_admin', response.data.is_admin); // Store is_admin
                alert('login riuscito!');
                if (response.data.is_admin) {
                    this.$router.push('/admin');
                } else {
                    this.$router.push('/notes');
                }
            } catch (error) {
                console.error('errore:', error);
                alert(`login fallito: ${error.response.data.message}`);
            }
        },
    },
};

export default Login;