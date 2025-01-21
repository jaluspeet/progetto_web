const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const sanitize = require('../middleware/sanitize');

// recupera note
router.get('/', notesController.getnotes);

// crea nuova nota
router.post('/', sanitize.sanitizeNote, notesController.addnote);

// modifica nota
router.put('/:id', sanitize.sanitizeNote, notesController.updatenote);

// elimina nota
router.delete('/:id', notesController.deletenote);

module.exports = router;