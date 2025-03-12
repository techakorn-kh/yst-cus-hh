const { DataTypes } = require("sequelize");
const sequelize = require("../../uitls/database");
const { v4: uuidv4 } = require('uuid');
const bycrpt = require('bcrypt');
const saltRounds = 10; 

const md100Users = sequelize.define('md_100_users', {
    "username": {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'ชื่อผู้ใช้งาน',
            },
            notNull: {
                msg: 'ชื่อผู้ใช้งาน',
            },
            isEvent(value) {
                if(value.length > 50) {
                    throw 'จำนวนข้อความมีมากกว่า 50 ตัวอักษร';
                }
            }
        }
    },
    "password": {
        type: DataTypes.STRING,
        allowNull: true
    },
    "is_good_receipt": {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    "is_fixed_asset": {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    "is_physical_fixed_asset": {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    "is_users_management": {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    "uuid": {
        type: DataTypes.UUID(),
        primaryKey: true,
        allowNull: false
    },
    "created_by": {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    "updated_by": {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, { 
    indexes: [
        {
            unique: false,
            fields: ['username','uuid']
        }
    ]
});

md100Users.sync({ alter: true }).then(async () => {
    await md100Users.findOrCreate({
        where: {
            username: 'Administrator'
        },
        defaults: {
            username: 'Administrator',
            password: await bycrpt.hash(`Bigwork**123`, saltRounds),
            is_good_receipt: true,
            is_fixed_asset: true,
            is_physical_fixed_asset: true,
            is_users_management: true,
            uuid: uuidv4(),
            created_by: 'system',
            updated_by: 'system'
        },
    }).catch((err) => {
        throw err;
    });

    const arr = [
       'BIGWORK',
       'BIGWORKSUPPORT',
       '184225',
       'MONGKOL',
       '173985',
       '174005',
    ]

    for (let i = 0; i < arr.length; i++) {
        const dataset = {
            username: arr[i],
            password: await bycrpt.hash(`Bigwork**123`, saltRounds),
            is_good_receipt: true,
            is_fixed_asset: true,
            is_physical_fixed_asset: true,
            uuid: uuidv4(),
            created_by: 'system',
            updated_by: 'system'
        };

        await md100Users.findOrCreate({
            where: {
                username: dataset?.username
            },
            defaults: dataset
        }).catch((err) => {
            throw err;
        });
    }
});

module.exports = md100Users;