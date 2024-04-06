const vcDb = require('../connection/poolConnection');

const authController = {
    testConnection: async (req, res) => {
        return res.status(200).send({
            "MESSAGE": "Auth is up. 👍🏻",
            "WHO": "Auth"
        });
    },
}

module.exports = authController;