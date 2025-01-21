const db = require('../database/db');

// recupera note di un utente
const getnotes = async (req, res) => {
	try {
		const userid = req.user.id;
		const [notes] = await db.query('SELECT id, title, content, created_at FROM notes WHERE user_id = ?', [userid]);
		for (const note of notes) {
			const [tags] = await db.query('SELECT t.name FROM tags t JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?', [note.id]);
			note.tags = tags.map(tag => tag.name);
		}
		res.json(notes);
	} catch (error) {
		res.status(500).json({ message: 'errore nel recupero delle note', error });
	}
};

// crea nuova nota
const addnote = async (req, res) => {
	try {
		const userid = req.user.id;
		const { title, content } = req.body;
		const [result] = await db.query('INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)', [title, content, userid]);
		const [newNote] = await db.query('SELECT id, title, content, created_at FROM notes WHERE id = ?', [result.insertId]);
		newNote[0].tags = [];
		res.status(201).json(newNote[0]);
	} catch (error) {
		res.status(500).json({ message: 'errore nell\'aggiunta della nota', error });
	}
};

// modifica nota
const updatenote = async (req, res) => {
	try {
		const userid = req.user.id;
		const { id } = req.params;
		const { title, content } = req.body;
		const [note] = await db.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userid]);
		if (note.length > 0) {
			await db.query('UPDATE notes SET title = ?, content = ? WHERE id = ?', [title, content, id]);
			res.json({ id, title, content });
		} else {
			res.status(404).json({ message: 'nota non trovata' });
		}
	} catch (error) {
		res.status(500).json({ message: 'errore nell\'aggiornamento della nota', error });
	}
};

// elimina nota
const deletenote = async (req, res) => {
	try {
		const userid = req.user.id;
		const { id } = req.params;
		const [note] = await db.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userid]);
		if (note.length > 0) {
			await db.query('DELETE FROM notes WHERE id = ?', [id]);
			res.status(204).end();
		} else {
			res.status(404).json({ message: 'nota non trovata' });
		}
	} catch (error) {
		res.status(500).json({ message: 'errore nell\'eliminazione della nota', error });
	}
};

// aggiungi tag a una nota
const addTag = async (req, res) => {
	try {
		const userid = req.user.id;
		const { id } = req.params;
		const { tag } = req.body;

		const [note] = await db.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userid]);
		if (note.length > 0) {
			let [tagResult] = await db.query('SELECT * FROM tags WHERE name = ?', [tag]);
			if (tagResult.length === 0) {
				const [result] = await db.query('INSERT INTO tags (name) VALUES (?)', [tag]);
				tagResult = [{ id: result.insertId }];
			}
			const tagId = tagResult[0].id;
			await db.query('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE note_id = note_id', [id, tagId]);
			const [tags] = await db.query('SELECT t.name FROM tags t JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?', [id]);
			res.json({ id, tags: tags.map(t => t.name) });
		} else {
			res.status(404).json({ message: 'nota non trovata' });
		}
	} catch (error) {
		res.status(500).json({ message: 'errore nell\'aggiunta del tag', error });
	}
};

// rimuovi tag da una nota
const removeTag = async (req, res) => {
	try {
		const userid = req.user.id;
		const { id } = req.params;
		const { tag } = req.body;

		const [note] = await db.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userid]);
		if (note.length > 0) {
			const [tagResult] = await db.query('SELECT * FROM tags WHERE name = ?', [tag]);
			if (tagResult.length > 0) {
				const tagId = tagResult[0].id;
				await db.query('DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?', [id, tagId]);
			}
			const [tags] = await db.query('SELECT t.name FROM tags t JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?', [id]);
			res.json({ id, tags: tags.map(t => t.name) });
		} else {
			res.status(404).json({ message: 'nota non trovata' });
		}
	} catch (error) {
		res.status(500).json({ message: 'errore nella rimozione del tag', error });
	}
};

module.exports = {
	getnotes,
	addnote,
	updatenote,
	deletenote,
	addTag,
	removeTag,
};
