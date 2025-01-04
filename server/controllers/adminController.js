const db = require('../database/db')

const isAdmin = (req, res, next) => {
    if (req.user && req.user.is_admin) {
        next()
    } else {
        res.status(403).json({ message: 'accesso negato' })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, is_admin, created_at FROM users')
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: 'errore nel recupero degli utenti', error })
    }
}

const promoteToAdmin = async (req, res) => {
    try {
        const { userId } = req.params
        await db.query('UPDATE users SET is_admin = TRUE WHERE id = ?', [userId])
        res.json({ message: 'utente promosso a admin' })
    } catch (error) {
        res.status(500).json({ message: 'errore nella promozione dell\'utente', error })
    }
}

const getUserNotes = async (req, res) => {
    try {
        const { userId } = req.params
        const [notes] = await db.query('SELECT * FROM notes WHERE user_id = ?', [userId])
        res.json(notes)
    } catch (error) {
        res.status(500).json({ message: 'errore nel recupero delle note dell\'utente', error })
    }
}

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params
        await db.query('DELETE FROM users WHERE id = ?', [userId])
        res.json({ message: 'utente eliminato con successo' })
    } catch (error) {
        res.status(500).json({ message: 'errore nell\'eliminazione dell\'utente', error })
    }
}

module.exports = {
    isAdmin,
    getAllUsers,
    promoteToAdmin,
    getUserNotes,
    deleteUser,
}