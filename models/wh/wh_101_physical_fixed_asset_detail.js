const { DataTypes } = require("sequelize");
const sequelize = require("../../uitls/database");

const wh101PhysicalFixedAssetDetail = sequelize.define('wh_101_physical_fixed_asset_detail', {
    "physical_fa_no_id": {
        type: DataTypes.UUID(),
        primaryKey: true,
        allowNull: false
    },
    "no": {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    "line_no": {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    "description": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "department": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "fa_location_code": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "fa_check": {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    "book_value": {
        type: DataTypes.DECIMAL,
        allowNull: true
    },
    "status_ok": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "status_ng": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "status_loss": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "request_sale": {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    "request_donation": {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    "request_write_off": {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    "remark": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "asset_location": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "main_component": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "component_of": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "acquisition_date": {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    "acquisition_cost": {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    "is_checked": {
        type: DataTypes.BOOLEAN,
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
    }
}, { 
    indexes: [
        {
            unique: false,
            fields: ['physical_fa_no_id', 'no', 'line_no', 'company_id']
        }
    ]
});

wh101PhysicalFixedAssetDetail.sync({ alter: true });

module.exports = wh101PhysicalFixedAssetDetail;