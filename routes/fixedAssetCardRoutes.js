const express = require('express');

const fixedAssetCardController = require('../controllers/fixedAssetCardController');

const router = express.Router();

router.get('/', fixedAssetCardController.index);
router.get('/view/:No/:company', fixedAssetCardController.getByUnique);
router.get('/search/:No/:company', fixedAssetCardController.search);

module.exports = router;