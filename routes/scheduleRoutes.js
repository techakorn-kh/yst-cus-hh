const express = require('express');
const companySchedules = require('../schedules/companySchedules');
const locationSchedules = require('../schedules/locationSchedules');

const router = express.Router();

router.get('/api/company-schedules', companySchedules.getData);
router.get('/api/location-schedules', locationSchedules.getData);

module.exports = router;