const Signup = {
	template: `
	<div class="container mt-5">
	<h1 class="text-center">registrati</h1>
	<form @submit.prevent="handlesignup" class="shadow p-4 bg-white rounded mx-auto" style="max-width: 400px;">
	<div class="mb-3">
		<label for="username" class="form-label">username</label>
		<input type="text" v-model="username" class="form-control" required>
	</div>
	<div class="mb-3">
		<label for="password" class="form-label">password</label>
		<input type="password" v-model="password" class="form-control" required>
	</div>
	<button type="submit" class="btn btn-primary w-100">registrati</button>
	</form>
	<p class="text-center mt-3">hai già un account? <router-link to="/login">login</router-link></p>
	</div>
	`,
	data() {
		return {
			username: '',
			password: '',
		}
	},
	methods: {
		async handlesignup() {
			try {
				const response = await this.$axios.post('/api/signup', {
					username: this.username,
					password: this.password,
				})
				alert('registrazione riuscita!')
				this.$router.push('/login')
			} catch (error) {
				if (error.response && error.response.status === 409) {
					alert('nome utente già esistente. reindirizzamento al login.')
					this.$router.push('/login')
				} else {
					console.error('error:', error)
					alert(`registrazione fallita: ${error.response.data.message}`)
				}
			}
		},
	},
}
export default Signup;
