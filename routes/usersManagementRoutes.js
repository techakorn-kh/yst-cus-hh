const express = require('express');

const usersManagementController = require('../controllers/usersManagementController');

const router = express.Router();

router.get('/', usersManagementController.index);
router.get('/getByUnique/:user_id', usersManagementController.getByUnique);
// router.get('/list/:document_id/:company_id', usersManagementController.getByUnique);
// router.post('/search/:document_id/:company_id', usersManagementController.searchItem);
// router.put('/update-header/:document_id/:company_id', usersManagementController.updateHeader);
// router.get('/card/:document_id/:company_id/:line_no', usersManagementController.getTrackingLines);
// router.post('/store/:document_id/:company_id/:line_no', usersManagementController.store);
// router.delete('/delete/:document_id/:company_id/:line_no/:rows', usersManagementController.destroy);
// router.post('/posted/:document_id/:company_id', usersManagementController.posted);

module.exports = router;