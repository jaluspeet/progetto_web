const Login = {
	template: `
	<div class="container mt-4 col-4">
		<div class="p-4 rounded bg-secondary text-dark shadow">
			<h1 class="text-center mb-4">login</h1>
			<form @submit.prevent="handlelogin" class="p-4">
				<div class="mb-4">
					<label for="username" class="form-label">username</label>
					<input type="text" v-model="username" class="form-control" required>
				</div>
				<div class="mb-4">
					<label for="password" class="form-label">password</label>
					<input type="password" v-model="password" class="form-control" required>
				</div>
				<button type="submit" class="btn btn-primary w-100">Login</button>
			</form>
			<p class="text-center mt-3">non hai un account? <router-link to="/signup" style="color: blue" >registrati</router-link></p>
		</div>

		<div class="toast-container position-fixed bottom-0 end-0 p-3">
			<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" ref="loginToast">
				<div class="toast-header">
					<strong class="me-auto">Notification</strong>
					<button type="button" class="btn btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div class="toast-body">
					{{ toastMessage }}
				</div>
			</div>
		</div>

	</div>
	`,

	data() {
		return {
			username: '',
			password: '',
			toastMessage: '',
		};
	},

	methods: {

		// notifica toast
		showToast(message) {
			this.toastMessage = message;
			const toastEl = this.$refs.loginToast;
			const toast = new bootstrap.Toast(toastEl);
			toast.show();
		},

		// login
		async handlelogin() {
			try {
				const response = await this.$axios.post('/api/login', {
					username: this.username,
					password: this.password,
				});
				localStorage.setItem('token', response.data.token);
				localStorage.setItem('is_admin', response.data.is_admin); // Store is_admin
				this.showToast('login riuscito!');
				if (response.data.is_admin) {
					this.$router.push('/admin');
				} else {
					this.$router.push('/notes');
				}
			} catch (error) {
				console.error('errore login:', error);
				this.showToast(`login fallito: ${error.response.data.message}`);
			}
		},
	},
};

export default Login;
