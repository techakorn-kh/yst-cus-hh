const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASS, {
    dialect: config.DB_TYPE,
    host: config.DB_HOST,
    port: config.DB_PORT,
    charset: config.DB_CHARSET,
    timezone: config.DB_TIMEZONE,
    requestTimeout: 300000,
    dialectOptions: {
        instanceName: config.DB_INSTANCENAME,
        options: { 
            requestTimeout: 300000 
        },
        requestTimeout: 0
    },
    pool: {
        max: 500,
        min: 0,
        acquire: 300000,
        idle: 10000
    },
});

sequelize.authenticate().then(function (err) {
    console.log(`\r\n ///// Database connection has been established successfully. /////\r\n`);
}).catch(function (err) {
    console.log('Unable to connect to the database:', err);
    throw err;
});

module.exports = sequelize;