const db = require('../database/db')

const getnotes = async (req, res) => {
	try {
		const userid = req.user.id
		const [notes] = await db.query('select * from notes where user_id = ?', [userid])
		res.json(notes)
	} catch (error) {
		res.status(500).json({ message: 'errore nel recupero delle note', error })
	}
}

const addnote = async (req, res) => {
	try {
		const userid = req.user.id
		const { title, content } = req.body
		const [result] = await db.query('insert into notes (title, content, user_id) values (?, ?, ?)', [title, content, userid])
		const newnote = { id: result.insertid, title, content }
		res.status(201).json(newnote)
	} catch (error) {
		res.status(500).json({ message: 'errore nell\'aggiunta della nota', error })
	}
}

const updatenote = async (req, res) => {
	try {
		const userid = req.user.id
		const { id } = req.params
		const { title, content } = req.body
		const [note] = await db.query('select * from notes where id = ? and user_id = ?', [id, userid])
		if (note.length > 0) {
			await db.query('update notes set title = ?, content = ? where id = ?', [title, content, id])
			res.json({ id, title, content })
		} else {
			res.status(404).json({ message: 'nota non trovata' })
		}
	} catch (error) {
		res.status(500).json({ message: 'errore nell\'aggiornamento della nota', error })
	}
}

const deletenote = async (req, res) => {
	try {
		const userid = req.user.id
		const { id } = req.params
		const note = await db.query('select * from notes where id = ? and user_id = ?', [id, userid])
		if (note.length > 0) {
			await db.query('delete from notes where id = ?', [id])
			res.status(204).end()
		} else {
			res.status(404).json({ message: 'nota non trovata' })
		}
	} catch (error) {
		res.status(500).json({ message: 'errore nell\'eliminazione della nota', error })
	}
}

module.exports = {
	getnotes,
	addnote,
	updatenote,
	deletenote,
}
