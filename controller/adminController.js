const vcDb  = require('../connection/poolConnection');

const adminController = {
    testConnection: async (req, res) => {
        return res.status(200).send({
            "MESSAGE": "Admin is up. 👍🏻",
            "WHO": "Admin"
        });
    },
}

module.exports = adminController;