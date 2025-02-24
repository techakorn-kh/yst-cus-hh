const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.get('/page/:module', searchController.index);

module.exports = router;