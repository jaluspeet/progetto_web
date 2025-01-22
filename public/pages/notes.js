const Notes = {
	template: `
	<div class="container mt-4">
	<div class="card shadow bg-primary">
	<div class="card-body">

	<div class="jumbotron d-flex justify-content-between align-items-center mb-2 text-light">
	<h1>blocco note</h1>
	<div class="d-flex">
	<input type="text" v-model="searchQuery" class="form-control me-2" placeholder="⌕ cerca">
	<select v-model="selectedTag" class="form-select me-2">
	<option value="">☰ nessun filtro</option>
	<option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
	</select>
	<router-link to="/account" class="btn btn-primary me-2">account</router-link>
	<button @click="logout" class="btn btn-danger">logout</button>
	</div>
	</div>

	<div class="bg-secondary rounded-3 p-4 mb-4 shadow">
	<form @submit.prevent="addNote">
	<div class="d-flex mb-2 align-items-center">
	<input type="text" v-model="newNoteTitle" class="form-control me-2" placeholder="titolo" required>
	<button type="submit" class="btn btn-info">✓</button>
	</div>
	<div class="d-flex">
	<textarea v-model="newNoteContent" class="form-control w-50 me-2" placeholder="contenuto" required></textarea>
	<div class="bg-light text-dark rounded p-3 w-50" v-html="compiledNewNoteMarkdown"></div>
	</div>
	</form>
	</div>

	<div class="bg-secondary rounded-3 p-4 shadow">
	<div class="d-flex flex-column">
	<div v-for="note in filteredNotes" :key="note.id" class="my-1">
	<div class="card h-100">
	<div class="card-header d-flex justify-content-between align-items-center p-3">
	<div v-if="editNoteId !== note.id">
	<h5 class="card-title">{{ note.title }}</h5>
	<small class="text-muted">{{ new Date(note.created_at).toLocaleString() }}</small>
	</div>
	<div v-else>
	<input type="text" v-model="editNoteTitle" class="form-control" placeholder="titolo" required>
	</div>
	<div class="d-flex">
	<button v-if="editNoteId !== note.id" @click="editNote(note)" class="btn btn-warning mx-1">✎</button>
	<button v-if="editNoteId === note.id" @click="saveNote(note.id)" class="btn btn-success mx-1">✓</button>
	<button type="button" @click="showDeleteNoteModal(note.id)" class="btn btn-danger mx-1">✘</button>
	<button @click="exportNote(note)" class="btn btn-info mx-1">↓</button>
	<button @click="shareNote(note)" class="btn btn-success mx-1">↖</button>
	<button @click="toggleTags(note.id)" class="btn btn-secondary mx-1">#</button>
	</div>
	</div>
	<div class="card-body d-flex">
	<div class="flex-grow-1">
	<div v-if="editNoteId !== note.id">
	<div v-html="convertMarkdown(note.content)"></div>
	</div>
	<div v-else>
	<div class="d-flex">
	<textarea v-model="editNoteContent" class="form-control w-50" placeholder="contenuto" required></textarea>
	<div class="w-50 p-4 bg-light text-dark rounded mx-2" v-html="compiledEditNoteMarkdown"></div>
	</div>
	</div>
	</div>
	</div>
	<div v-if="visibleTagsNoteId === note.id" class="card-footer">
	<div class="d-flex flex-wrap">
	<span v-for="tag in note.tags" :key="tag" class="badge bg-info text-dark me-2" @click="removeTag(note.id, tag)">
	{{ tag }}
	</span>
	</div>
	<form @submit.prevent="addTag(note.id)" class="d-flex mt-2">
	<input type="text" v-model="newTag" class="form-control me-2" placeholder="aggiungi tag" required>
	<button type="submit" class="btn btn-info">+</button>
	</form>
	</div>
	</div>
	</div>
	</div>
	</div>

	<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 11">
	<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" ref="notesToast">
	<div class="toast-header">
	<strong class="me-auto">Notification</strong>
	<button type="button" class="btn btn-close shadow" data-bs-dismiss="toast" aria-label="Close"></button>
	</div>
	<div class="toast-body">
	{{ toastMessage }}
	</div>
	</div>
	</div>

	<div class="modal fade" id="deleteNoteModal" tabindex="-1" aria-labelledby="deleteNoteModalLabel" aria-hidden="true">
	<div class="modal-dialog">
	<div class="modal-content">
	<div class="modal-header">
	<h5 class="modal-title" id="deleteNoteModalLabel">Conferma Eliminazione</h5>
	<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	</div>
	<div class="modal-body">
	Sei sicuro di voler eliminare questa nota?
	</div>
	<div class="modal-footer">
	<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
	<button type="button" class="btn btn-danger" @click="deleteNoteConfirmed">Elimina</button>
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
			notes: [],
			newNoteTitle: '',
			newNoteContent: '',
			editNoteId: null,
			editNoteTitle: '',
			editNoteContent: '',
			toastMessage: '',
			searchQuery: '',
			noteToDelete: null,
			visibleTagsNoteId: null, // Track the note ID for which tags are visible
			newTag: '',
			selectedTag: '', // Track the selected tag for filtering
			allTags: [], // Store all unique tags
		};
	},

	computed: {
		compiledNewNoteMarkdown() {
			return this.convertMarkdown(this.newNoteContent);
		},
		compiledEditNoteMarkdown() {
			return this.convertMarkdown(this.editNoteContent);
		},
		filteredNotes() {
			let notes = this.notes;
			if (this.searchQuery) {
				const query = this.searchQuery.toLowerCase();
				notes = notes.filter(note =>
					note.title.toLowerCase().includes(query) ||
					note.content.toLowerCase().includes(query)
				);
			}
			if (this.selectedTag) {
				notes = notes.filter(note => note.tags.includes(this.selectedTag));
			}
			return notes;
		}
	},

	methods: {
		// notifica
		showToast(message) {
			this.toastMessage = message;
			const toastEl = this.$refs.notesToast;
			const toast = new bootstrap.Toast(toastEl);
			toast.show();
		},

		// carica note dal database
		async fetchNotes() {
			try {
				const token = localStorage.getItem('token');
				const response = await this.$axios.get('/api/notes', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				this.notes = response.data;
				this.extractTags();
			} catch (error) {
				console.error('errore:', error);
				this.showToast(`recupero delle note fallito: ${error.response.data.message}`);
			}
		},

		// aggiungi nota
		async addNote() {
			const token = localStorage.getItem('token');
			try {
				const response = await this.$axios.post('/api/notes', {
					title: this.newNoteTitle,
					content: this.newNoteContent,
				}, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				this.notes.push(response.data);
				this.resetNewNoteFields();
				this.extractTags();
			} catch (error) {
				console.error('errore:', error);
				this.showToast(`aggiunta della nota fallita: ${error.response.data.message}`);
			}
		},

		// salva nota
		async saveNote(noteId) {
			const token = localStorage.getItem('token');
			const note = this.notes.find(n => n.id === noteId);
			if (note) {
				try {
					const response = await this.$axios.put(`/api/notes/${noteId}`, {
						title: this.editNoteTitle.trim(),
						content: this.editNoteContent.trim(),
					}, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});
					note.title = response.data.title;
					note.content = response.data.content;
					this.resetEditNoteFields();
					this.showToast('nota salvata con successo.');
				} catch (error) {
					console.error('errore:', error);
					this.showToast(`salvataggio della nota fallito: ${error.response.data.message}`);
				}
			}
		},

		// mostra modal per eliminazione nota
		showDeleteNoteModal(noteId) {
			this.noteToDelete = noteId;
			const modal = new bootstrap.Modal(document.getElementById('deleteNoteModal'));
			modal.show();
		},

		// elimina nota
		async deleteNoteConfirmed() {
			try {
				const token = localStorage.getItem('token');
				await this.$axios.delete(`/api/notes/${this.noteToDelete}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				this.notes = this.notes.filter(note => note.id !== this.noteToDelete);
				this.showToast('nota eliminata con successo.');
				const modal = bootstrap.Modal.getInstance(document.getElementById('deleteNoteModal'));
				modal.hide();
				this.extractTags();
			} catch (error) {
				console.error('errore:', error);
				this.showToast(`eliminazione della nota fallita: ${error.response.data.message}`);
			}
		},

		// modifica nota
		editNote(note) {
			this.editNoteId = note.id;
			this.editNoteTitle = note.title;
			this.editNoteContent = note.content;
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
				console.error('errore:', error);
				this.showToast('logout fallito.');
			}
		},

		// converti markdown in html
		convertMarkdown(content) {
			const html = marked.parse(content);
			const container = document.createElement('div');
			container.innerHTML = html;

			container.querySelectorAll('pre code').forEach((block) => {
				hljs.highlightBlock(block);
			});

			renderMathInElement(container, {
				delimiters: [
					{ left: "$$", right: "$$", display: true },
					{ left: "$", right: "$", display: false }
				]
			});

			return container.innerHTML;
		},

		// esporta nota in pdf
		async exportNote(note) {
			const doc = new jspdf.jsPDF({ format: 'a4' });
			const container = document.createElement('div');
			container.innerHTML = this.convertMarkdown(note.content);

			const style = document.createElement('style');
			style.innerHTML = `
			body {
				color: black !important;
				background: white !important;
			}
			`;
			container.appendChild(style);

			await doc.html(container, {
				x: 10,
				y: 10,
				width: 190,
				windowWidth: 800,
				callback: (doc) => {
					doc.save(`${note.title}.pdf`);
				}
			});
		},

		// condividi nota
		async shareNote(note) {
			try {
				const shareData = {
					text: `${note.content}\n\nnota condivisa tramite notevole!`
				};
				await navigator.share(shareData);
				this.showToast('nota condivisa con successo.');
			} catch (error) {
				console.error('errore condivisione:', error);
				this.showToast('condivisione fallita.');
			}
		},

		// aggiungi tag
		async addTag(noteId) {
			const token = localStorage.getItem('token');
			try {
				const response = await this.$axios.post(`/api/notes/${noteId}/tags`, {
					tag: this.newTag.trim(),
				}, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const note = this.notes.find(n => n.id === noteId);
				if (note) {
					note.tags = response.data.tags;
				}
				this.newTag = '';
				this.showToast('tag aggiunto con successo.');
				this.extractTags();
			} catch (error) {
				console.error('errore:', error);
				this.showToast(`aggiunta del tag fallita: ${error.response.data.message}`);
			}
		},

		// rimuovi tag
		async removeTag(noteId, tag) {
			const token = localStorage.getItem('token');
			try {
				const response = await this.$axios.delete(`/api/notes/${noteId}/tags`, {
					data: { tag },
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const note = this.notes.find(n => n.id === noteId);
				if (note) {
					note.tags = response.data.tags;
				}
				this.showToast('tag rimosso con successo.');
				this.extractTags();
			} catch (error) {
				console.error('errore:', error);
				this.showToast(`rimozione del tag fallita: ${error.response.data.message}`);
			}
		},

		// toggle tags visibility
		toggleTags(noteId) {
			this.visibleTagsNoteId = this.visibleTagsNoteId === noteId ? null : noteId;
		},

		// extract unique tags from notes
		extractTags() {
			const tagsSet = new Set();
			this.notes.forEach(note => {
				note.tags.forEach(tag => tagsSet.add(tag));
			});
			this.allTags = Array.from(tagsSet);
		},

		// utils
		resetNewNoteFields() {
			this.newNoteTitle = '';
			this.newNoteContent = '';
		},

		resetEditNoteFields() {
			this.editNoteId = null;
			this.editNoteTitle = '';
			this.editNoteContent = '';
		}
	},

	async created() {
		await this.fetchNotes();
	},
};

export default Notes;
