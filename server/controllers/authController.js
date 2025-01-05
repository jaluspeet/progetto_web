const db = require('../database/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// controllo validità email
const validateEmail = (email) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
};

// registrazione
const signup = async (req, res) => {
	try {
		const { username, password, email } = req.body // Updated to include email
		if (!validateEmail(email)) { // Added email validation
			return res.status(400).json({ message: 'Email non valida' })
		}
		const [existinguser] = await db.query('select * from users where username = ? OR email = ?', [username, email]) // Updated query to check username or email
		if (existinguser.length > 0) {
			return res.status(409).json({ message: 'nome utente o email già esistente' }) // Updated message
		}
		const hashedpassword = await bcrypt.hash(password, 10)
		await db.query('insert into users (username, email, password) values (?, ?, ?)', [username, email, hashedpassword]) // Updated insert to include email
		res.status(201).json({ message: 'utente creato con successo' })
	} catch (error) {
		res.status(500).json({ message: 'errore nella creazione dell\'utente', error })
	}
}

// login
const login = async (req, res) => {
	try {
		const { username, password } = req.body
		const [user] = await db.query('select * from users where username = ?', [username])
		if (user.length > 0) {
			const validpassword = await bcrypt.compare(password, user[0].password)
			if (validpassword) {
				const token = jwt.sign(
					{ id: user[0].id, is_admin: user[0].is_admin },
					process.env.JWT_SECRET,
					{ expiresIn: '1h' }
				)
				res.cookie('token', token, { httponly: true })
				return res.status(200).json({
					message: 'login riuscito',
					is_admin: user[0].is_admin,
					token
				})
			}
		}
		res.status(401).json({ message: 'credenziali non valide' })
	} catch (error) {
		res.status(500).json({ message: 'errore nel login', error })
	}
}

// logout
const logout = (req, res) => {
	res.clearCookie('token')
	res.status(200).json({ message: 'logout riuscito' })
}

module.exports = {
	signup,
	login,
	logout,
}
