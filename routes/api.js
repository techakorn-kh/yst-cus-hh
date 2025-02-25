const express = require('express');

const { authenAPI } = require('../middleware/authentication');
const physicalFixedAssetController = require('../controllers/physicalFixedAssetController');
const goodReceiptNotesController = require('../controllers/goodReceiptNotesController');

const router = express.Router();

router.get('/check-reopen/physical-fixed-asset/:physical_fa_no/:company', authenAPI, physicalFixedAssetController.checkReopen);
router.delete('/delete-reopen/physical-fixed-asset/:physical_fa_no_id/:company', authenAPI, physicalFixedAssetController.deleteReopen);

router.get('/generate/physical-fixed-asset', authenAPI, physicalFixedAssetController.generate);
router.get('/generate/good-receipt-notes', authenAPI, goodReceiptNotesController.generate);

module.exports = router;