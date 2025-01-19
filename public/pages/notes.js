const Notes = {
    template: `
    <div class="container mt-4">
        <div class="jumbotron d-flex justify-content-between align-items-center mb-4 p-3">
            <h1>blocco note</h1>
            <button @click="logout" class="btn btn-danger">logout</button>
        </div>

        <div class="shadow p-3 mb-4">
            <form @submit.prevent="addnote" class="mb-1">
                <div class="mb-3">
                    <input type="text" v-model="newnotetitle" class="form-control" placeholder="titolo" required>
                </div>
                <div class="mb-3">
                    <textarea v-model="newnotecontent" class="form-control" placeholder="contenuto" required></textarea>
                </div>
                <button type="submit" class="btn btn-info">salva nota</button>
            </form>
        </div>

        <div class="shadow p-3 mb-4">
            <ul class="list-group">
                <li v-for="note in notes" :key="note.id" class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="m-1" v-if="editnoteid !== note.id">
                            <h5>{{ note.title }}</h5>
                            <p>{{ note.content }}</p>
                        </div>
                        <div class="m-1" v-else>
                            <input type="text" v-model="editnotetitle" class="form-control mb-2" placeholder="titolo" required>
                            <textarea v-model="editnotecontent" class="form-control" placeholder="contenuto" required></textarea>
                        </div>
                        <div>
                            <button v-if="editnoteid !== note.id" @click="editnote(note)" class="btn btn-warning m-2">edit</button>
                            <button v-if="editnoteid === note.id" @click="savenote(note.id)" class="btn btn-success m-2">save</button>
                            <button @click="deletenote(note.id)" class="btn btn-danger m-2">delete</button>
                        </div>
                    </div>
                </li>
            </ul>
        </div>

        <div class="toast-container position-fixed bottom-0 end-0 p-3">
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
    </div>
    `,

    data() {
        return {
            notes: [],
            newnotetitle: '',
            newnotecontent: '',
            editnoteid: null,
            editnotetitle: '',
            editnotecontent: '',
            toastMessage: '',
        };
    },

    methods: {

        // notifica toast
        showToast(message) {
            this.toastMessage = message;
            const toastEl = this.$refs.notesToast;
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        },

        // recupera lista utenti
        async fetchnotes() {
            try {
                const token = localStorage.getItem('token');
                const response = await this.$axios.get('/api/notes', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                this.notes = response.data;
            } catch (error) {
                console.error('error:', error);
                this.showToast(`recupero delle note fallito: ${error.response.data.message}`);
            }
        },

        // crea nuova nota
        async addnote() {
            const token = localStorage.getItem('token');
            try {
                const response = await this.$axios.post('/api/notes', {
                    title: this.newnotetitle,
                    content: this.newnotecontent,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                this.notes.push(response.data);
                this.newnotetitle = '';
                this.newnotecontent = '';
            } catch (error) {
                console.error('error:', error);
                this.showToast(`aggiunta della nota fallita: ${error.response.data.message}`);
            }
        },

        // salva nota modificata
        async savenote(id) {
            const token = localStorage.getItem('token');
            try {
                const response = await this.$axios.put(`/api/notes/${id}`, {
                    title: this.editnotetitle,
                    content: this.editnotecontent,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const index = this.notes.findIndex(note => note.id === id);
                this.notes.splice(index, 1, response.data);
                this.editnoteid = null;
                this.editnotetitle = '';
                this.editnotecontent = '';
            } catch (error) {
                console.error('error:', error);
                this.showToast(`aggiornamento della nota fallito: ${error.response.data.message}`);
            }
        },

        // elimina nota preesistente
        async deletenote(id) {
            try {
                const token = localStorage.getItem('token');
                await this.$axios.delete(`/api/notes/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                this.notes = this.notes.filter(note => note.id !== id);
                this.showToast('nota eliminata con successo.');
            } catch (error) {
                console.error('error:', error);
                this.showToast(`eliminazione della nota fallita: ${error.response.data.message}`);
            }
        },

        editnote(note) {
            this.editnoteid = note.id;
            this.editnotetitle = note.title;
            this.editnotecontent = note.content;
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
                this.showToast('logout riuscito!');
                this.$router.push('/login');
            } catch (error) {
                console.error('error:', error);
                this.showToast('logout fallito.');
            }
        },
    },

    // recupera note quando la pagina viene caricata
    async created() {
        await this.fetchnotes();
    },
};

export default Notes;