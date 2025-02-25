const express = require('express');

const goodReceiptNotesController = require('../controllers/goodReceiptNotesController');

const router = express.Router();

router.get('/', goodReceiptNotesController.index);

module.exports = router;