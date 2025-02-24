const express = require('express');

const authenController = require('../controllers/authen/authenController');

const router = express.Router();

router.get('/', authenController.index);
router.post('/auth/login', authenController.login);
router.post('/refresh-token', authenController.refreshToken);

module.exports = router;