const Admin = {
	template: `
	<div class="container mt-5">
	<h1 class="text-center">admin dashboard</h1>
	<button @click="logout" class="btn btn-danger mb-3">logout</button>
	<table class="table table-striped">
	<thead>
	<tr>
	<th>id</th>
	<th>username</th>
	<th>is admin</th>
	<th>actions</th>
	</tr>
	</thead>
	<tbody>
	<tr v-for="user in users" :key="user.id">
	<td>{{ user.id }}</td>
	<td>{{ user.username }}</td>
	<td>{{ user.is_admin ? 'yes' : 'no' }}</td>
	<td>
	<button
	v-if="!user.is_admin"
	@click="promoteuser(user.id)"
	class="btn btn-warning btn-sm m-2">promote</button>
	<button
	@click="deleteuser(user.id)"
	class="btn btn-danger btn-sm m-2">delete</button>
	<button
	@click="viewUserNotes(user.id)"
	class="btn btn-info btn-sm m-2">notes</button>
	</td>
	</tr>
	</tbody>
	</table>
	</div>
	`,
	data() {
		return {
			users: [],
			userNotes: [], // add a place to store fetched notes
		};
	},
	methods: {
		async fetchusers() {
			try {
				const token = localStorage.getItem('token');
				const response = await this.$axios.get('/api/admin/users', {
					headers: {
						Authorization: `Bearer ${token}`, // Updated
					},
				});
				this.users = response.data;
			} catch (error) {
				console.error('errore nel recupero degli utenti:', error);
				alert(`errore nel recupero degli utenti: ${error.response.data.message}`);
			}
		},
		async promoteuser(userid) {
			try {
				const token = localStorage.getItem('token');
				await this.$axios.put(`/api/admin/promote/${userid}`, {}, {
					headers: {
						Authorization: `Bearer ${token}`, // Updated
					},
				});
				alert('utente promosso a admin con successo');
				this.fetchusers();
			} catch (error) {
				console.error('error promoting user:', error);
				alert(`errore nella promozione dell'utente: ${error.response.data.message}`);
			}
		},
		async deleteuser(userid) {
			if (!confirm('sei sicuro di voler eliminare questo utente?')) return;
			try {
				const token = localStorage.getItem('token');
				await this.$axios.delete(`/api/admin/users/${userid}`, {
					headers: {
						Authorization: `Bearer ${token}`, // Updated
					},
				});
				alert('utente eliminato con successo!');
				this.fetchusers();
			} catch (error) {
				console.error('error deleting user:', error);
				alert(`errore nell'eliminazione dell'utente: ${error.response.data.message}`);
			}
		},
		async viewUserNotes(userid) {
			try {
				const token = localStorage.getItem('token');
				const response = await this.$axios.get(`/api/admin/users/${userid}/notes`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				this.userNotes = response.data; // store the fetched notes
				console.log('User notes:', this.userNotes);
				alert(`trovate ${this.userNotes.length} note per user ${userid}`);
				// Display the notes as needed (e.g., modal or additional table)
			} catch (error) {
				console.error('error fetching user notes:', error);
				alert(`errore note utente: ${error.response.data.message}`);
			}
		},
		async logout() {
			try {
				const token = localStorage.getItem('token');
				await this.$axios.post('/api/logout', null, {
					headers: {
						Authorization: `Bearer ${token}`, // Updated
					},
				});
				localStorage.removeItem('token');
				localStorage.removeItem('is_admin');
				alert('logout riuscito!');
				this.$router.push('/login');
			} catch (error) {
				console.error('error during logout:', error);
				alert('logout fallito.');
			}
		},
	},
	async created() {
		await this.fetchusers();
	},
};

export default Admin;
