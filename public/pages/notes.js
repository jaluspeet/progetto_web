const Notes = {
    template: `
        <div class="container mt-4">
        <div class="jumbotron d-flex justify-content-between align-items-center mb-2">
            <h1>blocco note</h1>
            <div class="d-flex">
                <input type="text" v-model="searchQuery" class="form-control me-2" placeholder="Cerca note">
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
                    <div class="bg-primary rounded p-3 w-50" v-html="compiledNewNoteMarkdown"></div>
                </div>
            </form>
        </div>

        <div class="bg-secondary rounded-3 p-4 shadow">
            <div class="d-flex flex-column">
                <div v-for="note in filteredNotes" :key="note.id" class="my-1">
                    <div class="card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <div v-if="editNoteId !== note.id">
                                <h5 class="card-title">{{ note.title }}</h5>
                            </div>
                            <div v-else>
                                <input type="text" v-model="editNoteTitle" class="form-control" placeholder="titolo" required>
                            </div>
                            <div class="d-flex">
                                <button v-if="editNoteId !== note.id" @click="editNote(note)" class="btn btn-warning mx-1">✎</button>
                                <button v-if="editNoteId === note.id" @click="saveNote(note.id)" class="btn btn-success mx-1">✓</button>
                                <button @click="deleteNote(note.id)" class="btn btn-danger mx-1">✘</button>
                                <button @click="exportNote(note)" class="btn btn-info mx-1">↓</button>
                                <button @click="shareNote(note)" class="btn btn-success mx-1">↖</button>
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
                                        <div class="w-50 p-4" v-html="compiledEditNoteMarkdown"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
            newNoteTitle: '',
            newNoteContent: '',
            editNoteId: null,
            editNoteTitle: '',
            editNoteContent: '',
            toastMessage: '',
            searchQuery: '',
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
            if (!this.searchQuery) {
                return this.notes;
            }
            const query = this.searchQuery.toLowerCase();
            return this.notes.filter(note =>
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query)
            );
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
            } catch (error) {
                console.error('errore:', error);
                this.showToast(`aggiunta della nota fallita: ${error.response.data.message}`);
            }
        },

        // salva nota
        saveNote(noteId) {
            const note = this.notes.find(n => n.id === noteId);
            if (note) {
                note.title = this.editNoteTitle;
                note.content = this.editNoteContent;
                this.resetEditNoteFields();
            }
        },

        // elimina nota
        async deleteNote(id) {
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
                    text: `${note.content.trim()}\n\nnota condivisa tramite notevole!`
                };
                await navigator.share(shareData);
                this.showToast('nota condivisa con successo.');
            } catch (error) {
                console.error('errore condivisione:', error);
                this.showToast('condivisione fallita.');
            }
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