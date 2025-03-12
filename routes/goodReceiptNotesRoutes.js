const express = require('express');

const goodReceiptNotesController = require('../controllers/goodReceiptNotesController');

const router = express.Router();

router.get('/', goodReceiptNotesController.index);
router.get('/download/:document_no/:company_id', goodReceiptNotesController.download);
router.get('/list/:document_id/:company_id', goodReceiptNotesController.getByUnique);
router.post('/search/:document_id/:company_id', goodReceiptNotesController.searchItem);
router.put('/update-header/:document_id/:company_id', goodReceiptNotesController.updateHeader);
router.get('/card/:document_id/:company_id/:line_no', goodReceiptNotesController.getTrackingLines);
router.post('/store/:document_id/:company_id/:line_no', goodReceiptNotesController.store);
router.delete('/delete/:document_id/:company_id/:line_no/:rows', goodReceiptNotesController.destroy);
router.post('/posted/:document_id/:company_id', goodReceiptNotesController.posted);

module.exports = router;