const CONCURRENCY_LIMIT = 8;
const appConfig = {
    CONCURRENCY_LIMIT: CONCURRENCY_LIMIT,
    PORT: 5000,
    AUTH_URL_PREFIX: '/api/auth',
    USER_URL_PREFIX: '/api/user',
    ADMIN_URL_PREFIX: '/api/admin',
    db: {
        vcDb: {
            host: 'localhost',
            user: 'root',
            password: 'sree@2003',
            database: 'vcDb',
            multipleStatements: true
        },
    },
    pool_db: {
        vcDb: {
            host: 'localhost',
            user: 'root',
            password: 'sree@2003',
            database: 'vcDb',
            waitForConnections: true,
            connectionLimit: CONCURRENCY_LIMIT,
            queueLimit: 0,
        },
    },
}

module.exports  = appConfig;