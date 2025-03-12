require('dotenv').config();

const config = {
    APP_TYPE: process.env.APP_TYPE || 'DEVELOP',
    APP_PORT: process.env.APP_PORT || 5500,

    TOKEN_KEY: process.env.TOKEN_KEY || '1aB3cD5eF7',
    TOKEN_EXPIRE: process.env.TOKEN_EXPIRE || '30d',

    DB_NAME: process.env.DB_NAME || '',
    DB_HOST: process.env.DB_HOST || '127.0.0.1',
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS || '',
    DB_PORT: process.env.DB_PORT,
    DB_TYPE: process.env.DB_TYPE,
    DB_CHARSET: process.env.DB_CHARSET,
    DB_TIMEZONE: process.env.DB_TIMEZONE,
    DB_INSTANCENAME: process.env.DB_INSTANCENAME,

    NAV_USERNAME: process.env.NAV_USERNAME,
    NAV_PASSWORD: process.env.NAV_PASSWORD,
    NAV_DOMIAN: process.env.NAV_DOMIAN,
    NAV_API: process.env.NAV_API
}

module.exports = config;