const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

const authenticate = require('../middleware/authenticate');

// middleware autenticazione
router.use(authenticate);

// recupera informazioni account
router.get('/', accountController.getAccountInfo);

// aggiorna informazioni account
router.put('/', accountController.updateAccount);

// elimina tutte le note
router.delete('/notes', accountController.deleteAllNotes);

// elimina account
router.delete('/', accountController.deleteAccount);

module.exports = router;