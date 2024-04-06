const mysql = require('mysql2');
const appConfig = require('../config/appConfig');

const establishConnection = () => {
    const vcDb = mysql.createConnection(appConfig.db.vcDb);

    vcDb.connect((err) => {
        if (err) {
            console.log("[ERROR]: Failed to connect to vcDb.");
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Connected to vcDb.");
        }
    });

    return [vcDb];
}

module.exports =  establishConnection;