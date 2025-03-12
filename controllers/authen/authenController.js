const bcrypt = require('bcrypt');
const { md100Users, md101Companies } = require('../../models/index');
const jwt = require("jsonwebtoken");
const config = require('../../config');

module.exports = {
    index: async(req, res) => {
        try {
            const [usersArr, companyArr] = await Promise.all([
                await md100Users.findAll({
                    raw: true
                }),
                await md101Companies.findAll({
                    raw: true
                })
            ]);

            return res.render('pages/authen/login', { 
                title: 'Login',
                usersArr, 
                companyArr
            });
        } catch (err) {
            console.error(err);
        }
    },
    login: async(req, res) => {
        try {
            const { is_username, is_password, is_company } = req.body;

            if(!is_username) return res.status(401).json({ code: 401, status: 'error', message: 'Please provide your username.'});
            if(!is_password) return res.status(401).json({ code: 401, status: 'error', message: 'Please enter your password.'});
            if(!is_company) return res.status(401).json({ code: 401, status: 'error', message: 'Please specify your company.'});

            const [result, company] = await Promise.all([
                await md100Users.findOne({
                    where: {
                        username: is_username
                    },
                    raw: true
                }),
                await md101Companies.findOne({
                    where: {
                        uuid: is_company
                    },
                    raw: true
                })
            ]);

            if(!result) return res.status(401).json({ code: 401, status: 'error', message: 'Your username was not found in the system.'});
            if(!company) return res.status(401).json({ code: 401, status: 'error', message: 'Your company was not found in the system.'});

            if(!bcrypt.compareSync(is_password, result.password)) return res.status(401).json({ code: 401, status: 'error', message: 'Your password is incorrect. Please try again.'});

            const token = jwt.sign(
                {
                    user_id: result?.uuid,
                    username: result?.username,
                    is_good_receipt: result?.is_good_receipt ?? false,
                    is_fixed_asset: result?.is_fixed_asset ?? false,
                    is_physical_fixed_asset: result?.is_physical_fixed_asset ?? false,
                    is_users_management: result?.is_users_management ?? false,
                    company: company?.name,
                    company_id: company?.uuid
                    
                }, 
                config.TOKEN_KEY, 
                {
                    expiresIn: config.TOKEN_EXPIRE || '2h',
                }
            );

            req.session.loggedIn = true;
            req.session.user = result?.username;
            req.session.company = company?.name;
            req.session.company_id = company?.uuid;

            return res.status(200).json({ 
                code: 200, 
                status: 'success', 
                message: 'Logged in Redirect', 
                backward: '/menu',
                data: {
                    user_id: result?.uuid,
                    username: result?.username,
                    is_good_receipt: result?.is_good_receipt ?? false,
                    is_fixed_asset: result?.is_fixed_asset ?? false,
                    is_physical_fixed_asset: result?.is_physical_fixed_asset ?? false,
                    is_users_management: result?.is_users_management ?? false,
                    company: company?.name,
                    company_id: company?.uuid,
                    token: token
                }
            });
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    refreshToken: async(req, res) => {
        try {
            const { token } = req.body;

            const { user_id, company_id } = jwt.verify(token, config.TOKEN_KEY);

            if(!user_id) throw 'Your username was not found in the system.';
            if(!company_id) throw 'Your company was not found in the system.';

            const [result, company] = await Promise.all([
                await md100Users.findOne({
                    where: {
                        uuid: user_id
                    },
                    raw: true
                }),
                await md101Companies.findOne({
                    where: {
                        uuid: company_id
                    },
                    raw: true
                })
            ]);

            const refresh = jwt.sign(
                {
                    user_id: result?.uuid,
                    username: result?.username,
                    is_good_receipt: result?.is_good_receipt ?? false,
                    is_fixed_asset: result?.is_fixed_asset ?? false,
                    is_physical_fixed_asset: result?.is_physical_fixed_asset ?? false,
                    is_users_management: result?.is_users_management ?? false,
                    company: company?.name,
                    company_id: company?.uuid
                    
                }, 
                config.TOKEN_KEY, 
                {
                    expiresIn: config.TOKEN_EXPIRE || '2h',
                }
            );

            return res.json({
                user_id: result?.uuid,
                username: result?.username,
                is_good_receipt: result?.is_good_receipt ?? false,
                is_fixed_asset: result?.is_fixed_asset ?? false,
                is_physical_fixed_asset: result?.is_physical_fixed_asset ?? false,
                is_users_management: result?.is_users_management ?? false,
                company: company?.name,
                company_id: company?.uuid,
                token: refresh
            });
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
                backward: '/login',
            });
        }
    },
};
