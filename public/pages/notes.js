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
                    <input type="text" v-model="newnotetitle" class="form-control w-100" placeholder="titolo" required>
                </div>
                <div class="mb-3">
                    <textarea v-model="newnotecontent" class="form-control w-100" placeholder="contenuto" required @paste="handlePaste"></textarea>
                </div>
                <button type="submit" class="btn btn-info">salva nota</button>
            </form>
        </div>

        <div class="shadow mb-4">
            <ul class="list-group">
                <li v-for="note in notes" :key="note.id" class="list-group-item p-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="m-1 flex-grow-1" v-if="editnoteid !== note.id">
                            <h5>{{ note.title }}</h5>
                            <div v-html="convertMarkdown(note.content)"></div>
                        </div>
                        <div class="m-1 flex-grow-1" v-else>
                            <input type="text" v-model="editnotetitle" class="form-control mb-2 w-100" placeholder="titolo" required>
                            <textarea v-model="editnotecontent" class="form-control w-100" placeholder="contenuto" required @paste="handlePaste"></textarea>
                        </div>
                        <div class="d-flex flex-column m-2">
                            <button v-if="editnoteid !== note.id" @click="editnote(note)" class="btn btn-warning mb-2">edit</button>
                            <button v-if="editnoteid === note.id" @click="savenote(note.id)" class="btn btn-success mb-2">save</button>
                            <button @click="deletenote(note.id)" class="btn btn-danger mb-2">delete</button>
                        </div>
                    </div>
                </li>
            </ul>
        </div>

        <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 11">
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
                console.error('errore:', error);
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
                console.error('errore:', error);
                this.showToast(`aggiunta della nota fallita: ${error.response.data.message}`);
            }
        },

        // salva nota modificata
        savenote(noteId) {
            const note = this.notes.find(n => n.id === noteId);
            if (note) {
                note.title = this.editnotetitle;
                note.content = this.editnotecontent;
                this.editnoteid = null;
                this.editnotetitle = '';
                this.editnotecontent = '';
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
                console.error('errore:', error);
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
                this.$router.push('/login');
            } catch (error) {
                console.error('errore:', error);
                this.showToast('logout fallito.');
            }
        },

        // converti markdown in html
        convertMarkdown(content) {
            return marked.parse(content);
        },

        // incolla e comprimi immagini
        handlePaste(event) {
            const items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (const item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    new Compressor(file, {
                        quality: 0.1,
                        maxWidth: 100,
                        success: (compressedResult) => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const base64Image = event.target.result;
                                const imageMarkdown = `![Image](${base64Image})`;
                                this.newnotecontent += `\n${imageMarkdown}`;
                            };
                            reader.readAsDataURL(compressedResult);
                        },
                        error(err) {
                            console.error('compressione fallita:', err);
                            this.showToast('compressione immagine fallita.');
                        },
                    });
                }
            }
        }
    },

    // recupera note quando la pagina viene caricata
    async created() {
        await this.fetchnotes();
    },
};

export default Notes;