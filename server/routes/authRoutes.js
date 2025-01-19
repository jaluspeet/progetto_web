const express = require('express');
const authController = require('../controllers/authController');
const sanitize = require('../middleware/sanitize');

const router = express.Router();

// registrazione
router.post('/signup', sanitize.sanitizeUser, authController.signup);

// login
router.post('/login', authController.login);

// logout
router.post('/logout', authController.logout);

module.exports = router;

