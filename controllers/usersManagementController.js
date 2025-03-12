const { md100Users } = require('../models/index');

module.exports = {  
    // region index  
    index: async(req, res) => {
        try {
            const arr = await md100Users.findAll({
                raw: true
            }).catch((err)=>{
                throw err;
            });

            return res.render('pages/users-management/index', { 
                title: 'Users Management',
                arr, 
            });
        } catch (err) {
            console.error(err);
        }
    },
    // region getByUnique
    getByUnique: async() => {
        try {
            
        } catch (err) {
            console.error(err);
        }
    },
    // region store
    store: async(req, res) => {
        try {
            
        } catch (err) {
            console.error(err);
        }
    },
    // region update
    update: async(req, res) => {
        try {
            
        } catch (err) {
            console.error(err);
        }
    },
    // region destroy
    destroy: async(req, res) => {
        try {
            
        } catch (err) {
            console.error(err);
        }
    }
}