const Admin = {
	template: `
	<div class="container mt-4">
	<div class="jumbotron d-flex justify-content-between align-items-center mb-2">
	<h1 class="mb-0">pannello di controllo</h1>
	<button @click="logout" class="btn btn-danger">logout</button>
	</div>

	<div class="rounded bg-secondary p-4 shadow">
	<table class="table table-striped table-hover table-info">
	<thead>
	<tr>
	<th>id</th>
	<th>username</th>
	<th>email</th>
	<th>tipologia</th>
	<th>opzioni</th>
	</tr>
	</thead>
	<tbody>
	<tr v-for="user in users" :key="user.id" :class="{'table-danger': user.is_admin}">
	<td>{{ user.id }}</td>
	<td>{{ user.username }}</td>
	<td>{{ user.email }}</td>
	<td>{{ user.is_admin ? 'AMMINISTRATORE' : 'UTENTE' }}</td>
	<td>
	<button v-if="!user.is_admin" @click="promoteuser(user.id)" class="btn btn-warning m-2">promuovi</button>
	<button @click="showDeleteUserModal(user.id)" class="btn btn-danger m-2">elimina</button>
	<button @click="viewUserInfo(user.id)" class="btn btn-info m-2">info</button>
	</td>
	</tr>
	</tbody>
	</table>
	</div>

	<div class="toast-container position-fixed top-0 end-0 p-3">
	<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" ref="adminToast">
	<div class="toast-header">
	<strong class="me-auto">notifica</strong>
	<button type="button" class="btn btn-close shadow" data-bs-dismiss="toast" aria-label="Close"></button>
	</div>
	<div class="toast-body">
	{{ toastMessage }}
	</div>
	</div>
	</div>

	<div class="modal fade" id="deleteUserModal" tabindex="-1" aria-labelledby="deleteUserModalLabel" aria-hidden="true">
	<div class="modal-dialog">
	<div class="modal-content">
	<div class="modal-header">
	<h5 class="modal-title" id="deleteUserModalLabel">Conferma Eliminazione</h5>
	<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	</div>
	<div class="modal-body">
	Sei sicuro di voler eliminare questo utente?
	</div>
	<div class="modal-footer">
	<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
	<button type="button" class="btn btn-danger" @click="deleteUserConfirmed">Elimina</button>
	</div>
	</div>
	</div>
	</div>
	</div>
	`,

	data() {
		return {
			users: [],
			userNotes: [],
			toastMessage: '',
			userToDelete: null,
		};
	},

	methods: {

		// notifica toast
		showToast(message) {
			this.toastMessage = message;
			const toastEl = this.$refs.adminToast;
			const toast = new bootstrap.Toast(toastEl);
			toast.show();
		},

		// recupera lista utenti (admin)
		async fetchusers() {
			try {
				const token = localStorage.getItem('token');
				const response = await this.$axios.get('/api/admin/users', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				this.users = response.data;
			} catch (error) {
				console.error('errore nel recupero degli utenti:', error);
				this.showToast(`errore nel recupero degli utenti: ${error.response.data.message}`);
			}
		},

		// promuovi utente ad admin (admin)
		async promoteuser(userid) {
			try {
				const token = localStorage.getItem('token');
				await this.$axios.put(`/api/admin/promote/${userid}`, {}, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				this.showToast('utente promosso a admin con successo');
				this.fetchusers();
			} catch (error) {
				console.error('errore nella promozione dell\'utente', error);
				this.showToast(`errore nella promozione dell'utente: ${error.response.data.message}`);
			}
		},

		// mostra modal per eliminazione utente
		showDeleteUserModal(userId) {
			this.userToDelete = userId;
			const modal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
			modal.show();
		},

		// elimina utente (admin)
		async deleteUserConfirmed() {
			try {
				const token = localStorage.getItem('token');
				await this.$axios.delete(`/api/admin/users/${this.userToDelete}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				this.showToast('utente eliminato con successo!');
				this.fetchusers();
				const modal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
				modal.hide();
			} catch (error) {
				console.error('errore nell\'eliminazione dell\'utente:', error);
				this.showToast(`errore nell'eliminazione dell'utente: ${error.response.data.message}`);
			}
		},

		// visualizza info utente
		async viewUserInfo(userid) {
			try {
				const token = localStorage.getItem('token');
				const response = await this.$axios.get(`/api/admin/users/${userid}/notes`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				this.userNotes = response.data;
				const user = this.users.find(user => user.id === userid);
				this.showToast(`utente: ${user.username}, note totali: ${this.userNotes.length}`);
			} catch (error) {
				this.showToast(`errore recupero info utente: ${error.response.data.message}`);
			}
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
				console.error('errore durante il logout:', error);
				this.showToast('errore durante il logout');
			}
		},
	},

	async created() {
		await this.fetchusers();
	},
};

export default Admin;
