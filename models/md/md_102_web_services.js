const { DataTypes } = require("sequelize");
const sequelize = require("../../uitls/database");
const navArr = require('../../uitls/import/api');

const md102WebServices = sequelize.define('md_102_web_services', {
    "api_name": {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    "api_link": {
        type: DataTypes.STRING,
        allowNull: true
    }
}, { 
    indexes: [
        {
            unique: false,
            fields: ['api_name','api_link']
        }
    ]
});

md102WebServices.sync({ force: true }).then(async () => {
    if(navArr.length > 0) {
        await md102WebServices.bulkCreate(navArr).catch((err) => {
            throw err;
        });
    }
});

module.exports = md102WebServices;