const { DataTypes } = require("sequelize");
const sequelize = require("../../uitls/database");

const wh202GoodReceiptNotesTemp = sequelize.define('wh_202_good_receipt_notes_temp', {
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
    "rows": {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    "quantity": {
        type: DataTypes.DECIMAL(16,2),
        allowNull: true
    },
    "bin_code": {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    "lot_no": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "exp_date": {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    "is_posted": {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    "line_id": {
        type: DataTypes.UUID(),
        primaryKey: true,
        allowNull: false
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
            fields: ['document_id', 'no', 'line_no', 'rows', 'line_id', 'company_id']
        }
    ]
});

wh202GoodReceiptNotesTemp.sync({ alter: true });

module.exports = wh202GoodReceiptNotesTemp;