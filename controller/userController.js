const vcDb = require('../connection/poolConnection');

const userController = {
    testConnection: async (req, res) => {
        return res.status(200).send({
            "MESSAGE": "User is up. 👍🏻",
            "WHO": "User"
        });
    },
}

module.exports = userController;