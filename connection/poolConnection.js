const mysql = require('mysql2');
const appConfig = require('../config/appConfig');

const vcDb = mysql.createPool(appConfig.pool_db.vcDb);

module.exports = vcDb;