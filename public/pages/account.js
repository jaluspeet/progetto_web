const Account = {
	template: `
	<div class="container mt-4">
	<div class="card shadow bg-primary">
	<div class="card-body">

	<div class="jumbotron d-flex justify-content-between align-items-center mb-2 text-light">
	<h1>account</h1>
	<div class="d-flex">
	<router-link to="/notes" class="btn btn-primary me-2">note</router-link>
	<button @click="logout" class="btn btn-danger">logout</button>
	</div>
	</div>

	<div class="bg-secondary text-dark rounded-3 p-4 shadow mb-4">
	<h2>informazioni account</h2>
	<ul class="list-group">
	<li class="list-group-item"><strong>username:</strong> {{ username }}</li>
	<li class="list-group-item"><strong>email:</strong> {{ email }}</li>
	<li class="list-group-item"><strong>note totali:</strong> {{ noteCount }}</li>
	<li class="list-group-item"><strong>data di creazione:</strong> {{ createdAt }}</li>
	</ul>
	</div>

	<div class="bg-secondary text-dark rounded-3 p-4 shadow mb-4">
	<h2>modifica account</h2>
	<form @submit.prevent="updateAccount">
	<div class="mb-3">
	<input type="text" v-model="newUsername" class="form-control" placeholder="nuovo username">
	</div>
	<div class="mb-3">
	<input type="email" v-model="newEmail" class="form-control" placeholder="nuova email">
	</div>
	<div class="mb-3">
	<input type="password" v-model="newPassword" class="form-control" placeholder="nuova password">
	</div>
	<button type="submit" class="btn btn-success me-2">aggiorna</button>
	<button type="button" @click="showDeleteAllNotesModal" class="btn btn-warning me-2">elimina tutte le note</button>
	<button type="button" @click="showDeleteAccountModal" class="btn btn-danger">elimina account</button>
	</form>
	</div>

	<div class="toast-container position-fixed top-0 end-0 p-3">
	<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" ref="accountToast">
	<div class="toast-header">
	<strong class="me-auto">notifica</strong>
	<button type="button" class="btn btn-close shadow" data-bs-dismiss="toast" aria-label="close"></button>
	</div>
	<div class="toast-body">
	{{ toastMessage }}
	</div>
	</div>
	</div>

	<!-- Delete All Notes Modal -->
	<div class="modal fade" id="deleteAllNotesModal" tabindex="-1" aria-labelledby="deleteAllNotesModalLabel" aria-hidden="true">
	<div class="modal-dialog">
	<div class="modal-content">
	<div class="modal-header">
	<h5 class="modal-title" id="deleteAllNotesModalLabel">Conferma Eliminazione</h5>
	<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	</div>
	<div class="modal-body">
	Sei sicuro di voler eliminare tutte le note?
	</div>
	<div class="modal-footer">
	<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
	<button type="button" class="btn btn-warning" @click="deleteAllNotes">Elimina</button>
	</div>
	</div>
	</div>
	</div>

	<!-- Delete Account Modal -->
	<div class="modal fade" id="deleteAccountModal" tabindex="-1" aria-labelledby="deleteAccountModalLabel" aria-hidden="true">
	<div class="modal-dialog">
	<div class="modal-content">
	<div class="modal-header">
	<h5 class="modal-title" id="deleteAccountModalLabel">Conferma Eliminazione</h5>
	<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	</div>
	<div class="modal-body">
	Sei sicuro di voler eliminare il tuo account?
	</div>
	<div class="modal-footer">
	<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
	<button type="button" class="btn btn-danger" @click="deleteAccount">Elimina</button>
	</div>
	</div>
	</div>
	</div>
	</div>
	</div>
	</div>
	`,

	data() {
		return {
			username: '',
			email: '',
			noteCount: 0,
			createdAt: '',
			newUsername: '',
			newEmail: '',
			newPassword: '',
			toastMessage: '',
			modalMessage: '',
		};
	},

	methods: {
		// recupera informazioni account
		async fetchAccountInfo() {
			try {
				const token = localStorage.getItem('token');
				const response = await this.$axios.get('/api/account', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				this.username = response.data.username;
				this.email = response.data.email;
				this.noteCount = response.data.noteCount;
				this.createdAt = new Date(response.data.created_at).toLocaleString();
			} catch (error) {
				console.error('Errore nel recupero delle informazioni account:', error);
				this.showModal(`Errore nel recupero delle informazioni account: ${error.response.data.message}`);
			}
		},

		// aggiorna dati account
		async updateAccount() {
			try {
				const token = localStorage.getItem('token');
				await this.$axios.put('/api/account', {
					username: this.newUsername,
					email: this.newEmail,
					password: this.newPassword,
				}, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				this.showToast('Account aggiornato con successo');
				this.fetchAccountInfo();
			} catch (error) {
				console.error('Errore nell\'aggiornamento dell\'account:', error);
				this.showModal(`Errore nell'aggiornamento dell'account: ${error.response.data.message}`);
			}
		},

		// elimina tutte le note
		async deleteAllNotes() {
			try {
				const token = localStorage.getItem('token');
				await this.$axios.delete('/api/account/notes', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				this.showToast('Tutte le note sono state eliminate con successo');
				this.fetchAccountInfo();
				const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAllNotesModal'));
				modal.hide();
			} catch (error) {
				console.error('Errore nell\'eliminazione delle note:', error);
				this.showModal(`Errore nell'eliminazione delle note: ${error.response.data.message}`);
			}
		},

		// elimina account
		async deleteAccount() {
			try {
				const token = localStorage.getItem('token');
				await this.$axios.delete('/api/account', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				localStorage.removeItem('token');
				localStorage.removeItem('is_admin');
				this.$router.push('/signup');
				const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAccountModal'));
				modal.hide();
			} catch (error) {
				console.error('Errore nell\'eliminazione dell\'account:', error);
				this.showModal(`Errore nell'eliminazione dell'account: ${error.response.data.message}`);
			}
		},

		// notifica
		showToast(message) {
			this.toastMessage = message;
			const toastEl = this.$refs.accountToast;
			const toast = new bootstrap.Toast(toastEl);
			toast.show();
		},

		// prompt
		showModal(message) {
			this.modalMessage = message;
			const modal = new bootstrap.Modal(document.getElementById('accountModal'));
			modal.show();
		},

		// prompt conferma eliminazione note
		showDeleteAllNotesModal() {
			const modal = new bootstrap.Modal(document.getElementById('deleteAllNotesModal'));
			modal.show();
		},

		// prompt conferma eliminazione account
		showDeleteAccountModal() {
			const modal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
			modal.show();
		},

		// logout
		async logout() {
			try {
				const token = localStorage.getItem('token');
				await this.$axios.post('/api/logout', null, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				localStorage.removeItem('token');
				localStorage.removeItem('is_admin');
				this.$router.push('/login');
			} catch (error) {
				console.error('Errore durante il logout:', error);
				this.showModal('Errore durante il logout');
			}
		},
	},

	async created() {
		await this.fetchAccountInfo();
	},
};

export default Account;
