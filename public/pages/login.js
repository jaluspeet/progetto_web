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

	<div class="toast-container position-fixed top-0 end-0 p-3">
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

	<!-- Modal -->
	<div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
	<div class="modal-dialog">
	<div class="modal-content">
	<div class="modal-header">
	<h5 class="modal-title" id="loginModalLabel">Notification</h5>
	<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	</div>
	<div class="modal-body">
	{{ modalMessage }}
	</div>
	<div class="modal-footer">
	<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
	</div>
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
			modalMessage: '',
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

		// mostra modal
		showModal(message) {
			this.modalMessage = message;
			const modal = new bootstrap.Modal(document.getElementById('loginModal'));
			modal.show();
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
				this.showModal(`login fallito: ${error.response.data.message}`);
			}
		},
	},
};

export default Login;
