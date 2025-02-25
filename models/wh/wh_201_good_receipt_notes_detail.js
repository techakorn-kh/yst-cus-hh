const { DataTypes } = require("sequelize");
const sequelize = require("../../uitls/database");

const wh201GoodReceiptNotesDetail = sequelize.define('wh_201_good_receipt_notes_detail', {
    "document_id": {
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
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    "description": {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    "description2": {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    "quantity": {
        type: DataTypes.DECIMAL(16,2),
        allowNull: true
    },
    "qty_to_receive": {
        type: DataTypes.DECIMAL(16,2),
        allowNull: true
    },
    "out_standing_qty": {
        type: DataTypes.DECIMAL(16,2),
        allowNull: true
    },
    "uom": {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    "tracking_type": {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    "location_code": {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    "bin_code": {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    "require_exp_date": {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    "bin_mandatory": {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    "max_qty_receive": {
        type: DataTypes.DECIMAL(16,2),
        allowNull: true
    },
    "expected_receipt_date": {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    "qty_to_received": {
        type: DataTypes.DECIMAL(16,2),
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
            fields: ['document_id', 'no', 'line_no', 'company_id']
        }
    ]
});

wh201GoodReceiptNotesDetail.sync({ alter: true });

module.exports = wh201GoodReceiptNotesDetail;