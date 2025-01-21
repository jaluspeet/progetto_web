const Signup = {
	template: `
	<div class="container mt-4 col-4">
		<div class="p-4 rounded bg-secondary text-dark shadow">
			<h1 class="text-center mb-4">registrati</h1>
			<form @submit.prevent="handlesignup" class="p-4">
				<div class="mb-3">
					<label for="username" class="form-label">username</label>
					<input type="text" v-model="username" class="form-control" required>
				</div>
				<div class="mb-3">
					<label for="email" class="form-label">email</label>
					<input type="email" v-model="email" class="form-control" required>
				</div>
				<div class="mb-3">
					<label for="password" class="form-label">password</label>
					<input type="password" v-model="password" class="form-control" required>
				</div>
				<button type="submit" class="btn btn-primary w-100">registrati</button>
			</form>
			<p class="text-center mt-3">hai già un account? <router-link to="/login" style="color: blue">login</router-link></p>
		</div>

		<div class="toast-container position-fixed bottom-0 end-0 p-3">
			<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" ref="signupToast">
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
			email: '',
			password: '',
			toastMessage: '',
		}
	},

	methods: {

		// notifica toast
		showToast(message) {
			this.toastMessage = message;
			const toastEl = this.$refs.signupToast;
			const toast = new bootstrap.Toast(toastEl);
			toast.show();
		},

		// controllo validità dati di registrazione - regex per controllo mail
		validatesignup() {
			const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (!emailPattern.test(this.email.toLowerCase())) {
				this.showToast('Email non valida');
				return false;
			}
			return true;
		},

		// registrazione
		async handlesignup() {
			if (!this.validatesignup()) return;
			try {
				const response = await this.$axios.post('/api/signup', {
					username: this.username,
					email: this.email,
					password: this.password,
				})
				this.$router.push('/login')
			} catch (error) {
				if (error.response && error.response.status === 409) {
					this.showToast('nome utente o email già esistente. reindirizzamento al login.')
					this.$router.push('/login')
				} else {
					console.error('error:', error)
					this.showToast(`registrazione fallita: ${error.response.data.message}`)
				}
			}
		},
	},
}

export default Signup;
