const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authenticate = require('./middleware/authenticate');

// inizializzazione express
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// route protette tramite middleware
app.use('/api', authRoutes);
app.use('/api/notes', authenticate, noteRoutes);
app.use('/api/admin', authenticate, adminRoutes);

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// avvio server in ascolto
app.listen(PORT, () => {
	console.log(`server in esecuzione su http://localhost:${PORT}`);
});

