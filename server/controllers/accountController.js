const db = require('../database/db');
const bcrypt = require('bcrypt');

// recupera informazioni account
const getAccountInfo = async (req, res) => {
	try {
		const userId = req.user.id;
		const [user] = await db.query('SELECT username, email, created_at FROM users WHERE id = ?', [userId]);
		const [notes] = await db.query('SELECT COUNT(*) AS noteCount FROM notes WHERE user_id = ?', [userId]);
		if (user.length > 0) {
			res.json({ username: user[0].username, email: user[0].email, created_at: user[0].created_at, noteCount: notes[0].noteCount });
		} else {
			res.status(404).json({ message: 'utente non trovato' });
		}
	} catch (error) {
		res.status(500).json({ message: 'errore nel recupero delle informazioni account', error });
	}
};

// aggiorna informazioni account
const updateAccount = async (req, res) => {
	try {
		const userId = req.user.id;
		const { username, email, password } = req.body;
		const updates = [];
		const values = [];

		if (username) {
			updates.push('username = ?');
			values.push(username);
		}
		if (email) {
			updates.push('email = ?');
			values.push(email);
		}
		if (password) {
			const hashedPassword = await bcrypt.hash(password, 10);
			updates.push('password = ?');
			values.push(hashedPassword);
		}

		if (updates.length > 0) {
			values.push(userId);
			await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
			res.json({ message: 'account aggiornato con successo' });
		} else {
			res.status(400).json({ message: 'nessun campo aggiornato' });
		}
	} catch (error) {
		res.status(500).json({ message: 'errore nell\'aggiornamento dell\'account', error });
	}
};

// elimina tutte le note
const deleteAllNotes = async (req, res) => {
	try {
		const userId = req.user.id;
		await db.query('DELETE FROM notes WHERE user_id = ?', [userId]);
		res.json({ message: 'tutte le note sono state eliminate con successo' });
	} catch (error) {
		res.status(500).json({ message: 'errore nell\'eliminazione delle note', error });
	}
};

// elimina account
const deleteAccount = async (req, res) => {
	try {
		const userId = req.user.id;
		await db.query('DELETE FROM users WHERE id = ?', [userId]);
		res.json({ message: 'account eliminato con successo' });
	} catch (error) {
		res.status(500).json({ message: 'errore nell\'eliminazione dell\'account', error });
	}
};

module.exports = {
	getAccountInfo,
	updateAccount,
	deleteAllNotes,
	deleteAccount,
};
