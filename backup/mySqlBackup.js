const cron = require('node-cron');
const fs = require('fs');

const appConfig = require('../config/appConfig');

const mysqlBackupCronJob = () => {
    console.log("[MESSAGE]: MySQL Backup CRON reporting.")
    cron.schedule('0 0 * * * *', async () => {
        try {
            const { exec } = require('child_process');
            exec(`mysqldump -u ${appConfig.db.vcDb.user} -p${appConfig.db.vcDb.password} ${appConfig.db.vcDb.database} > backups/${appConfig.db.vcDb.database}.sql`, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    fs.appendFileSync('./logs/backup/errorLogs.log', `[${new Date().toISOString()}]: ${err}\n`);
                    return;
                }
                console.log(`[${new Date().toLocaleString()}]: MySQL ${appConfig.db.vcDb.database} Backup Completed`)
                fs.appendFileSync('./logs/backup/backupLogs.log', `[${new Date().toLocaleString()}]: MySQL ${appConfig.db.vcDb.database} Backup Completed\n`);
            });
        } catch (err) {
            console.log(err);
            fs.appendFileSync('./logs/backup/errorLogs.log', `[${new Date().toISOString()}]: ${err}\n`);
            return;
        }
    });
}

// mysqlBackupCronJob();

//module.exports = mysqlBackupCronJob;