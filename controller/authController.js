const vcDb = require('../connection/poolConnection');

const { generateToken } = require('../middleware/login/tokenGenerator');

const fs = require('fs');


const authController = {
    testConnection: async (req, res) => {
        return res.status(200).send({
            "MESSAGE": "Auth is up. 👍🏻",
            "WHO": "Auth"
        });
    },
    userLogin: async (req, res) => {
        /*
        JSON
        {
            "userEmail": "<email_id>",
            "userPassword": "<password>"
        }
        */
        //    console.log(res);
        if (!(typeof(req.body.userEmail) === 'string' && typeof(req.body.userPassword) === 'string' && req.body.userEmail.length > 0 && req.body.userPassword.length > 0)) {
            return res.status(400).send({ "message": "Missing details." });
        }

        let db_connection = await vcDb.promise().getConnection();

        try {
            await db_connection.query(`LOCK TABLES studentData AS s READ, managementData AS m READ,departmentData AS d READ`);

            let [student] = await db_connection.query(`SELECT * from studentData AS s JOIN departmentData AS d ON d.deptId = s.studentDeptId WHERE s.studentEmail = ? AND s.studentPassword = ?`, [req.body.userEmail, req.body.userPassword]);

            if (student.length > 0) {

                if (student[0].studentStatus === "2") {
                    return res.status(401).send({ "message": "Your Account has been deactivated. Check you mail for further instructions." });
                } else if (student[0].studentStatus !== "1") {
                    return res.status(401).send({ "message": "account restricted!" });
                }

                const secret_token = await generateToken({
                    "userId": student[0].studentId,
                    "userRole": "S",
                });

                // console.log(secret_token);

                return res.status(200).send({
                    "message": "Student logged in!",
                    "SECRET_TOKEN": secret_token,
                    "studentEmail": student[0].studentEmail,
                    "studentName": student[0].studentName,
                    "studentRollNumber": student[0].studentRollNumber,
                    "studentId": student[0].studentId,
                    "studentSection": student[0].studentSection,
                    "studentGender": student[0].studentGender,
                    "studentBatch": student[0].studentBatch,
                    "studentDeptId": student[0].studentDeptId,
                    "deptName": student[0].deptName,
                    "studentStatus": student[0].studentStatus
                });
            }
            let [manager] = await db_connection.query(`SELECT * from managementData AS m JOIN departmentData AS d ON d.deptId = m.deptId WHERE m.managerEmail = ? AND m.managerPassword = ?`, [req.body.userEmail, req.body.userPassword]);
            // console.log("data");
            // console.log(manager);

            if (manager[0].managerstatus === "2") {
                return res.status(401).send({ "message": "Your Account has been deactivated. Check you mail for further instructions." });
            } else if (manager[0].managerstatus !== "1") {
                return res.status(401).send({ "message": "account restricted!" }); 
            }

            const secret_token = await generateToken({
                "userId": manager[0].managerId,
                "userRole": "M",
            });

            // console.log(secret_token);

            return res.status(200).send({
                "message": "manager logged in!",
                "SECRET_TOKEN": secret_token,
                "managerEmail": manager[0].managerEmail,
                "managerRollId": manager[0].managerRollId,
                "managerId": manager[0].managerId,
                "deptId": manager[0].deptId,
                "deptName": manager[0].deptName,
                "managerStatus": manager[0].managerstatus
            });



        } catch (err) {
            console.log(err);
            const time = new Date();
            fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - userLogin - ${err}\n`);
            return res.status(500).send({ "message": "Internal Server Error." });
        } finally {
            await db_connection.query(`UNLOCK TABLES`);
            db_connection.release();
        }
    },
}


module.exports = authController;