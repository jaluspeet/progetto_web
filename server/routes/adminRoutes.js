const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');

// middleware autenticazione
router.use(authenticate);

// recupera utenti (admin)
router.get('/users', adminController.isAdmin, adminController.getAllUsers);

// promuovi utente ad admin (admin)
router.put('/promote/:userId', adminController.isAdmin, adminController.promoteToAdmin);

// recupero note di utente (admin)
router.get('/users/:userId/notes', adminController.isAdmin, adminController.getUserNotes);

// elimina utente (admin)
router.delete('/users/:userId', adminController.isAdmin, adminController.deleteUser);

module.exports = router;
