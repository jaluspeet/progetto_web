const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// registrazione
router.post('/signup', authController.signup);

// login
router.post('/login', authController.login);

// logout
router.post('/logout', authController.logout);

module.exports = router;

