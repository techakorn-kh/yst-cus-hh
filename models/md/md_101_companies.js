const { DataTypes } = require("sequelize");
const sequelize = require("../../uitls/database");

const md101Companies = sequelize.define('md_101_companies', {
    "name": {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    "display_name": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "uuid": {
        type: DataTypes.UUID(),
        primaryKey: true,
        allowNull: false
    }
}, { 
    indexes: [
        {
            unique: false,
            fields: ['name', 'uuid']
        }
    ]
});

md101Companies.sync({ alter: true });

module.exports = md101Companies;