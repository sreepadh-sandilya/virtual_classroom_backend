const fs = require('fs');
const path = require('path');

const reinitDb = (db, dbName) => {
    // console.log(dbName);
    try {
        
        if (dbName === "vcDb") {
            fs.readFile(path.join(__dirname,'initScript.sql'), 'utf8', (err, data) => {
                if (err) {
                    console.log(`[ERROR]: ${err}`);
                    fs.appendFileSync('./logs/db.log', `${new Date().toLocaleString} | [ERROR]: ${err}\n`)
                } else {
                    db.query(data, (err, result) => {
                        if (err) {
                            console.log(`[ERROR]: ${dbName} failed to reinitialize.`);
                            console.log(`[ERROR]: ${err}`);
                            fs.appendFileSync('./logs/db.log', `${new Date().toLocaleString} | [ERROR]: ${err}\n`)
                        } else {
                            console.log(`[MESSAGE]: ${dbName} reinitialized.`);
                        }
                    });
                }
            });
        }
    } catch (err) {
        console.log(`[ERROR]: ${dbName} failed to reinitialize.`);
        console.log(`[ERROR]: ${err}`);
        fs.appendFileSync('./logs/db.log', `${new Date().toLocaleString} | [ERROR]: ${err}\n`)
    }
}
// console.log("executed");
module.exports = reinitDb;
