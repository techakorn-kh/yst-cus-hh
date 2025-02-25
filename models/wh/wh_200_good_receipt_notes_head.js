const { DataTypes } = require("sequelize");
const sequelize = require("../../uitls/database");

const wh200GoodReceiptNotesHead = sequelize.define('wh_200_good-receipt-notes_head', {
    "document_no": {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
    },
    "document_type": {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    "receipt_date": {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    "buy_from_vendor_no": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "buy_from_vendor_name": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "last_receiving_no": {
        type: DataTypes.STRING(20),
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
            fields: ['document_no', 'document_type', 'company_id', 'uuid']
        }
    ]
});

wh200GoodReceiptNotesHead.sync({ alter: true });

module.exports = wh200GoodReceiptNotesHead;