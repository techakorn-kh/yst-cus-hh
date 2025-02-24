const express = require('express');
const scheduleRoutes = require('./scheduleRoutes');
const authenRoutes = require('./authenRoutes');
const fixedAssetCardRoutes = require('./fixedAssetCardRoutes');
const physicalFixedAssetRoutes = require('./physicalFixedAssetRoutes');

const searchRoutes = require('./searchRoutes');
const apiRoutes = require('./api');

const { loggedIn } = require('../middleware/authentication');

const router = express.Router();

// API Interface
router.use('/schedules', scheduleRoutes);

//Page Interface
router.get('/', (req, res) => {
    const { loggedIn } = req.session;

    if(!loggedIn) {
        return res.redirect('/login')
    } else {
        return res.redirect('/menu')
    }
});

router.use('/login', authenRoutes);

router.get('/menu', loggedIn, (req, res) => {
    return res.render('menu', { 
        title: 'Menu'
    });
});

router.use('/fixed-asset-card', loggedIn, fixedAssetCardRoutes);
router.use('/physical-fixed-asset', loggedIn, physicalFixedAssetRoutes);
router.use('/search', loggedIn, searchRoutes);
router.use('/api', apiRoutes);

module.exports = router;