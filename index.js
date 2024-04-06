const express = require('express');
const helmet = require('helmet');
const cluster = require('cluster');
const fs = require('fs');
const { pid } = require('process');
const cors = require('cors');

const establishConnection = require('./connection/initializeDbConnection');
const reinitDb = require('./schema/reinitDb');

const appConfig = require('./config/appConfig');
const generateRSAKey = require('./middleware/key/generateRSAKey');

const authRouter = require('./router/authRouter');
const userRouter = require('./router/userRouter');
const adminRouter = require('./router/adminRouter');

const server = express();
server.use(helmet());
server.use(cors());
server.use(express.json());
server.disable('x-powered-by');

server.use(appConfig.AUTH_URL_PREFIX, authRouter);
server.use(appConfig.USER_URL_PREFIX, userRouter);
server.use(appConfig.ADMIN_URL_PREFIX, adminRouter);

if (cluster.isPrimary) {
    console.log(`[MESSAGE]: Master ${pid} running.`);
    const [vcDb] = establishConnection();

    reinitDb(vcDb, "vcDb");

    if (fs.existsSync('./middleware/key/private_key.pem') && fs.existsSync('./middleware/key/public_key.pem')) {
        // Delete Key
        fs.unlinkSync('./middleware/key/private_key.pem');
        fs.unlinkSync('./middleware/key/public_key.pem');

        // Generate Key
        generateRSAKey();
    } else {
        // Generate Key
        generateRSAKey();
    }

    for (let i = 0; i < appConfig.CONCURRENCY_LIMIT; i++) {
        cluster.fork();
    }

} else {
    server.listen(appConfig.PORT, (err) => {
        if (err) {
            console.log(`[ERROR]: ${err}`);
            fs.appendFileSync('./logs/index.log', `${new Date().toLocaleString} | [ERROR]: ${err}\n`)
        } else {
            console.log(`[MESSAGE]: ${pid} running.`);
        }
    });
}

