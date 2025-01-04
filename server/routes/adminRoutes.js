const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate'); // Ensure correct path

// Apply authentication middleware
router.use(authenticate); // Now using a valid middleware function

// Route to get all users (admin only)
router.get('/users', adminController.isAdmin, adminController.getAllUsers);

// Route to promote a user to admin (admin only)
router.put('/promote/:userId', adminController.isAdmin, adminController.promoteToAdmin);

// Route to get a specific user's notes (admin only)
router.get('/users/:userId/notes', adminController.isAdmin, adminController.getUserNotes);

// Route to delete a user (admin only)
router.delete('/users/:userId', adminController.isAdmin, adminController.deleteUser);

module.exports = router;