const express = require('express');
const router = express.Router();
const db = require('../database/db');

// recupera note
router.get('/', async (req, res) => {
	try {
		const userid = req.user.id;
		const [notes] = await db.query('SELECT * FROM notes WHERE user_id = ?', [userid]);
		res.json(notes);
	} catch (err) {
		res.status(500).json({ message: 'errore fetch note dal database', error: err.message });
	}
});

// crea nuova nota
router.post('/', async (req, res) => {
	try {
		const userid = req.user.id;
		const { title, content } = req.body;
		const [result] = await db.query('INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)', [title, content, userid]);
		const newNoteId = result.insertId;
		const [newNote] = await db.query('SELECT * FROM notes WHERE id = ?', [newNoteId]);
		res.status(201).json(newNote[0]);
	} catch (err) {
		res.status(500).json({ message: 'errore creazione nota', error: err.message });
	}
});

// modifica nota
router.put('/:id', async (req, res) => {
	try {
		const userid = req.user.id;
		const { title, content } = req.body;
		const { id } = req.params;
		const [note] = await db.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userid]);
		if (note.length > 0) {
			await db.query('UPDATE notes SET title = ?, content = ? WHERE id = ?', [title, content, id]);
			const [updatedNote] = await db.query('SELECT * FROM notes WHERE id = ?', [id]);
			res.json(updatedNote[0]);
		} else {
			res.status(404).json({ message: 'nota non trovata' });
		}
	} catch (err) {
		res.status(500).json({ message: 'errore modifica nota', error: err.message });
	}
});

// elimina nota
router.delete('/:id', async (req, res) => {
	try {
		const userid = req.user.id;
		const { id } = req.params;
		const [note] = await db.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userid]);
		if (note.length > 0) {
			await db.query('DELETE FROM notes WHERE id = ?', [id]);
			res.json({ message: 'nota eliminata correttamente' });
		} else {
			res.status(404).json({ message: 'nota non trovata' });
		}
	} catch (err) {
		res.status(500).json({ message: 'errore eliminazione nota', error: err.message });
	}
});

module.exports = router;

