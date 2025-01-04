const Notes = {
    template: `
    <div class="container mt-3">
    <div class="d-flex justify-content-between align-items-center">
        <h1>blocco note</h1>
        <button @click="logout" class="btn btn-danger">logout</button>
    </div>
    <hr>
    <form @submit.prevent="addnote" class="mb-4">
        <div class="mb-3">
            <input type="text" v-model="newnotetitle" class="form-control" placeholder="titolo" required>
        </div>
        <div class="mb-3">
            <textarea v-model="newnotecontent" class="form-control" placeholder="contenuto" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">nuova nota</button>
    </form>
    <ul class="list-group">
        <li v-for="note in notes" :key="note.id" class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5>{{ note.title }}</h5>
                    <p>{{ note.content }}</p>
                </div>
                <div>
                    <button @click="editnote(note)" class="btn btn-warning btn-sm m-2">edit</button>
                    <button @click="deletenote(note.id)" class="btn btn-danger btn-sm">delete</button>
                </div>
            </div>
        </li>
    </ul>
    </div>
    `,
    data() {
        return {
            notes: [],
            newnotetitle: '',
            newnotecontent: '',
            editnoteid: null,
        };
    },
    methods: {
        async fetchnotes() {
            try {
                const token = localStorage.getItem('token');
                const response = await this.$axios.get('/api/notes', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Updated
                    },
                });
                this.notes = response.data;
            } catch (error) {
                console.error('error:', error);
                alert(`recupero delle note fallito: ${error.response.data.message}`);
            }
        },
        async addnote() {
            const token = localStorage.getItem('token');
            if (this.editnoteid) {
                try {
                    const response = await this.$axios.put(`/api/notes/${this.editnoteid}`, {
                        title: this.newnotetitle,
                        content: this.newnotecontent,
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`, // Updated
                        },
                    });
                    const index = this.notes.findIndex(note => note.id === this.editnoteid);
                    this.notes.splice(index, 1, response.data);
                    this.editnoteid = null;
                } catch (error) {
                    console.error('error:', error);
                    alert(`aggiornamento della nota fallito: ${error.response.data.message}`);
                }
            } else {
                try {
                    const response = await this.$axios.post('/api/notes', {
                        title: this.newnotetitle,
                        content: this.newnotecontent,
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`, // Updated
                        },
                    });
                    this.notes.push(response.data);
                } catch (error) {
                    console.error('error:', error);
                    alert(`aggiunta della nota fallita: ${error.response.data.message}`);
                }
            }
            this.newnotetitle = '';
            this.newnotecontent = '';
        },
        async deletenote(id) {
            try {
                const token = localStorage.getItem('token');
                await this.$axios.delete(`/api/notes/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Updated
                    },
                });
                this.notes = this.notes.filter(note => note.id !== id);
            } catch (error) {
                console.error('error:', error);
                alert(`eliminazione della nota fallita: ${error.response.data.message}`);
            }
        },
        editnote(note) {
            this.newnotetitle = note.title;
            this.newnotecontent = note.content;
            this.editnoteid = note.id;
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
                console.error('error:', error);
                alert('logout fallito.');
            }
        },
    },
    async created() {
        await this.fetchnotes();
    },
};

export default Notes;