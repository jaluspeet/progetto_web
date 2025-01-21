const { body, validationResult } = require('express-validator');

const sanitizeNote = [
	body('title').trim(),
	body('content').trim(),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];

const sanitizeUser = [
	body('username').trim().escape(),
	body('password').trim(),
	body('email').normalizeEmail(),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];

module.exports = { sanitizeNote, sanitizeUser };
