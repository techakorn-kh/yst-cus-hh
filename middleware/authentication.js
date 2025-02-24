const jwt = require("jsonwebtoken");
const config = require('../config');

module.exports = {
    authen: async(req, res, next) => {
        try {
            const token = req.headers["x-access-token"];

            if (!token) throw `Invalid token!`;

            const decoded = jwt.verify(token, config.TOKEN_KEY);

            req.user = { ...decoded };

            return next();

        } catch (err) {
            console.error(err);
        }
    },
    createToken: async(req, res) => {
        try {
            console.log(req.body);
        } catch (err) {
            console.error(err);
        }
    },
    loggedIn: async(req, res, next) => {
        try {
            const { loggedIn } = req.session;

            if(!loggedIn) {
                return res.redirect('/login');
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
        }
    },
    authenAPI: async(req, res, next) => {
        try {
            const { authorization } = req.headers;

            if(!authorization) return res.status(401).json({ code: 401, status: 'error', message: 'Unauthorized'});

            const [type, token] = authorization.split(' ');

            if(type !== 'Bearer' || token !== config.TOKEN_KEY) return res.status(401).json({ code: 401, status: 'error', message: 'Unauthorized'});

            return next();
        } catch (err) {
            console.error(err);
        }
    },
};
