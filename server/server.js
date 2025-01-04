require('dotenv').config(); // Add this line at the very top
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authenticate = require('./middleware/authenticate'); // Import authentication middleware

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', authRoutes);
app.use('/api/notes', authenticate, noteRoutes); // Protect notes routes
app.use('/api/admin', authenticate, adminRoutes); // Protect admin routes

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`server in esecuzione su http://localhost:${PORT}`);
});

