const express = require('express');

const physicalFixedAssetController = require('../controllers/physicalFixedAssetController');

const router = express.Router();

router.get('/', physicalFixedAssetController.index);
router.get('/download/:physical_fa_no/:company_id', physicalFixedAssetController.download);
router.get('/list/:physical_fa_no_id/:company_id', physicalFixedAssetController.getByUnique);
router.get('/check-action/:physical_fa_no_id/:company_id/:no/:line_no', physicalFixedAssetController.getCheckAction);
router.get('/pending/:physical_fa_no_id/:company_id', physicalFixedAssetController.getPending);
router.get('/card/:physical_fa_no_id/:company_id/:no', physicalFixedAssetController.viewCard);
router.put('/update/:physical_fa_no_id/:company_id/:no/:line_no', physicalFixedAssetController.update);
router.post('/update-transaction', physicalFixedAssetController.updateTransaction);

module.exports = router;