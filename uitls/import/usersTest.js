const { v4: uuidv4 } = require('uuid');
const bycrpt = require('bcrypt');
const saltRounds = 10; 

const usersArr = [
    {
        username: 'YST-TEST-001',
        password: await bycrpt.hash(`YST-TEST-001`, saltRounds),
        is_good_receipt: true,
        is_fixed_asset: true,
        is_physical_fixed_asset: true,
        is_users_management: false,
        uuid: uuidv4(),
        created_by: 'system',
        updated_by: 'system'
    }
];

module.exports = usersArr;