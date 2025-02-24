const { DataTypes } = require("sequelize");
const sequelize = require("../../uitls/database");

const wh100PhysicalFixedAssetHead = sequelize.define('wh_100_physical_fixed_asset_head', {
    "physical_fa_no": {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    "department": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "fa_location_code": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "total_check": {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    "total_fa": {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    "created_by": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "updated_by": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "company_id": {
        type: DataTypes.UUID(),
        primaryKey: true,
        allowNull: false
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
            fields: ['physical_fa_no', 'company_id', 'uuid']
        }
    ]
});

wh100PhysicalFixedAssetHead.sync({ alter: true });

module.exports = wh100PhysicalFixedAssetHead;