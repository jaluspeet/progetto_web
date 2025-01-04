const express = require('express');
const authController = require('../controllers/authController'); // Import the controller

const router = express.Router();

// Register user
router.post('/signup', authController.signup);

// Login user
router.post('/login', authController.login);

// Logout user
router.post('/logout', authController.logout);

module.exports = router;

