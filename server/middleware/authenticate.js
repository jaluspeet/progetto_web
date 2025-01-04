const jwt = require('jsonwebtoken');
const db = require('../database/db');
require('dotenv').config();

const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'autenticazione richiesta' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        if (user.length === 0) {
            return res.status(401).json({ message: 'utente non trovato' });
        }
        req.user = user[0];
        next();
    } catch (error) {
        console.error('authentication error:', error);
        res.status(401).json({ message: 'token non valido', error: error.message });
    }
}

module.exports = authenticate;
