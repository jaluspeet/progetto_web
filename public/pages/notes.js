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

        <div class="row mb-4">
            <div class="border p-3 mb-2 col-7">
                <form @submit.prevent="addnote">

                    <div class="d-flex mb-2">
                        <input type="text" v-model="newnotetitle" class="form-control" placeholder="titolo" required>
                        <button type="submit" class="btn btn-info mx-2">✓</button>
                    </div>

                    <div class="d-flex mb-2">
                        <textarea :value="newnotecontent" @input="updateNewNoteContent" class="form-control" placeholder="contenuto" required></textarea>
                    </div>

                </form>
            </div>

            <div class="border p-3 mb-2 col-5" v-html="compiledNewNoteMarkdown"></div>
        </div>

        <div class="row mb-4">
            <div class="shadow border p-3 mb-4">
                <ul class="list-group">
                    <li v-for="note in filteredNotes" :key="note.id" class="list-group-item p-4">
                        <div class="d-flex justify-content-between align-items-center">

                            <div class="m-2 flex-grow-1" v-if="editnoteid !== note.id">
                                <h5>{{ note.title }}</h5>
                                <div v-html="convertMarkdown(note.content)"></div>
                            </div>

                            <div class="m-1 flex-grow-1" v-else>
                                <div class="d-flex">
                                    <input type="text" v-model="editnotetitle" class="form-control mb-2 w-50" placeholder="titolo" required>
                                </div>
                                <div class="d-flex">
                                    <textarea :value="editnotecontent" @input="updateEditNoteContent" class="form-control w-50" placeholder="contenuto" required></textarea>
                                    <div class="w-50 p-2 border m-1" v-html="compiledEditNoteMarkdown"></div>
                                </div>
                            </div>

                            <div class="d-flex flex-column">
                                <button v-if="editnoteid !== note.id" @click="editnote(note)" class="btn btn-warning mb-2">✎</button>
                                <button v-if="editnoteid === note.id" @click="savenote(note.id)" class="btn btn-success mb-2">✓</button>
                                <button @click="deletenote(note.id)" class="btn btn-danger mb-2">X</button>
                                <button @click="exportNote(note)" class="btn btn-primary mb-2">↓</button>
                                <button @click="shareNote(note)" class="btn btn-secondary mb-2">⇪</button>
                            </div>
                        </div>
                    </li>
                </ul>
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
            newnotetitle: '',
            newnotecontent: '',
            editnoteid: null,
            editnotetitle: '',
            editnotecontent: '',
            toastMessage: '',
            searchQuery: '',
        };
    },

    computed: {
        compiledNewNoteMarkdown() {
            return this.convertMarkdown(this.newnotecontent);
        },
        compiledEditNoteMarkdown() {
            return this.convertMarkdown(this.editnotecontent);
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

        // aggiorna contenuto nuova nota
        updateNewNoteContent(event) {
            this.newnotecontent = event.target.value;
        },

        // aggiorna contenuto nota modificata
        updateEditNoteContent(event) {
            this.editnotecontent = event.target.value;
        },

        // esporta nota in PDF
        async exportNote(note) {
            const doc = new jspdf.jsPDF({
                format: 'a4'
            });

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
                    title: note.title,
                    text: note.content,
                    url: window.location.href
                };
                await navigator.share(shareData);
                this.showToast('nota condivisa con successo.');
            } catch (error) {
                console.error('errore condivisione:', error);
                this.showToast('condivisione fallita.');
            }
        },
    },

    // recupera note quando la pagina viene caricata
    async created() {
        await this.fetchnotes();
    },
};

export default Notes;