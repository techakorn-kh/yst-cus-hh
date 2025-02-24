const { DataTypes } = require("sequelize");
const sequelize = require("../../uitls/database");

const md103Locations = sequelize.define('md_103_locations', {
    "location_code": {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    "location_name": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "company_id": {
        type: DataTypes.STRING,
        allowNull: true
    }
}, { 
    indexes: [
        {
            unique: false,
            fields: ['location_code', 'company_id']
        }
    ]
});

md103Locations.sync({ alter: true });

module.exports = md103Locations;