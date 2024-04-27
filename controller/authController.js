const vcDb = require('../connection/poolConnection');

const generateOTP = require("../middleware/forgotPassword/otpGenerator");
const createOtpToken = require("../middleware/forgotPassword/otpTokenGenerator");
const otpTokenValidator = require("../middleware/forgotPassword/otpTokenValidator");

const generateToken = require("../middleware/login/tokenGenerator");

const fs = require('fs');
const { reset_PW_OTP } = require('../mail/mailer');
const validator = require('validator');

const authController = {
    testConnection: async (req, res) => {
        return res.status(200).send({
            "message": "Auth is up. 👍🏻",
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

        if (!(typeof (req.body.userEmail) === 'string' && req.body.userEmail.length > 0 && validator.isEmail(req.body.userEmail))) {
            return res.status(400).send({ "message": "Invalid Data" });
        }

        if (!(typeof (req.body.userPassword) === 'string' && req.body.userPassword.length > 0)) {
            return res.status(400).send({ "message": "Invalid Data" });
        }

        const db_connection = await vcDb.promise().getConnection();

        try {
            await db_connection.query(`LOCK TABLES studentData AS s READ, managementData AS m READ, departmentData AS d READ`);

            // check if user is student, query by studentEmail and studentPassword
            const [student] = await db_connection.query(`SELECT s.studentId, s.studentName, s.studentRollNumber, s.studentGender, s.studentPhone, s.studentEmail, s.studentDob, s.studentDeptId, d.deptName, s.studentSection, s.studentBatchStart, s.studentBatchEnd, s.createdAt, s.studentStatus from studentData AS s JOIN departmentData AS d ON d.deptId = s.studentDeptId WHERE s.studentEmail = ? AND s.studentPassword = ?`, [req.body.userEmail, req.body.userPassword]);

            if (student.length > 0) {
                if (student[0].studentStatus != '1') {
                    return res.status(400).send({
                        "message": "Access Restricted. Your account is blocked."
                    });
                }

                const token = await generateToken({
                    "userId": student[0].studentId,
                    "userRole": "S"
                });

                return res.status(200).send({
                    "message": "Login Successful.",
                    "studentData": student[0],
                    "userRole": "S",
                    "SECRET_TOKEN": token
                });
            }

            // check if user is manager, query by managerEmail and managerPassword

            const [manager] = await db_connection.query(`SELECT m.managerId, m.managerFullName, m.managerEmail, m.deptId, d.deptName, m.roleId, m.createdAt, m.managerStatus from managementData AS m JOIN departmentData AS d ON d.deptId = m.deptId WHERE m.managerEmail = ? AND m.managerPassword = ?`, [req.body.userEmail, req.body.userPassword]);

            if (manager.length > 0) {
                if (manager[0].managerStatus != '1') {
                    return res.status(400).send({
                        "message": "Access Restricted. Your account is blocked."
                    });
                }

                const token = await generateToken({
                    "userId": manager[0].managerId,
                    "userRole": "M"
                });

                return res.status(200).send({
                    "message": "Login Successful.",
                    "managerData": manager[0],
                    "userRole": "M",
                    "SECRET_TOKEN": token,
                });
            }

            return res.status(400).send({
                "message": "Invalid Credentials",
            })

        } catch (err) {
            console.log(err);
            const time = new Date();
            fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - userLogin - ${err}\n`);
            return res.status(500).send({ "message": "Internal Server Error." });
        } finally {
            await db_connection.query('UNLOCK TABLES');
            db_connection.release();
            db_connection.close();
        }

    },

    forgotPassword: async (req, res) => {
        /*
        JSON
        {
            "userEmail": "<email_id>"
        }
        */

        if (!(typeof (req.body.userEmail) === 'string' && req.body.userEmail.length > 0 && validator.isEmail(req.body.userEmail))) {
            return res.status(400).send({ "message": "Invalid Email ID" });
        }

        const db_connection = await vcDb.promise().getConnection();

        try {

            await db_connection.query(`LOCK TABLES studentData AS s READ, managementData AS m READ`);

            const [student] = await db_connection.query(`SELECT studentName, studentId from studentData AS s WHERE s.studentEmail = ?`, [req.body.userEmail]);

            if (student.length > 0) {
                const otp = generateOTP();
                // Store OTP into DB

                await db_connection.query('LOCK TABLES forgotPasswordStudent WRITE');

                await db_connection.query(`DELETE FROM forgotPasswordStudent WHERE studentId = ?`, [student[0].studentId]);

                await db_connection.query(`INSERT INTO forgotPasswordStudent (studentId, otp) VALUES (?, ?)`, [student[0].studentId, otp]);

                await db_connection.query('UNLOCK TABLES');

                const token = await createOtpToken({
                    "userId": student[0].studentId,
                    "userEmail": req.body.userEmail,
                    "userRole": "S"
                });

                reset_PW_OTP(student[0].studentName, otp, req.body.userEmail);

                return res.status(200).send({
                    "message": "OTP sent to your email.",
                    "SECRET_TOKEN": token
                });
            }

            const [manager] = await db_connection.query(`SELECT managerId from managementData AS m WHERE m.managerEmail = ?`, [req.body.userEmail]);
            if (manager.length > 0) {
                const otp = generateOTP();
                // Store OTP into DB

                await db_connection.query('LOCK TABLES forgotPasswordManagement WRITE');

                await db_connection.query(`DELETE FROM forgotPasswordManagement WHERE managerId = ?`, [manager[0].managerId]);

                await db_connection.query(`INSERT INTO forgotPasswordManagement (managerId, otp) VALUES (?, ?)`, [manager[0].managerId, otp]);

                await db_connection.query('UNLOCK TABLES');

                const token = await createOtpToken({
                    "userId": manager[0].managerId,
                    "userEmail": req.body.userEmail,
                    "userRole": "M"
                });

                reset_PW_OTP(manager[0].managerFullName, otp, req.body.userEmail);

                return res.status(200).send({
                    "message": "OTP sent to your email.",
                    "SECRET_TOKEN": token
                });

            }

            return res.status(400).send({
                "message": "Invalid Request"
            });

        } catch (err) {
            console.log(err);
            const time = new Date();
            fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - forgotPassword - ${err}\n`);
            return res.status(500).send({ "message": "Internal Server Error." });
        } finally {
            await db_connection.query('UNLOCK TABLES');
            db_connection.release();
            db_connection.close();
        }
    },

    verifyAndResetPassword: [
        otpTokenValidator,
        /*
        JSON
        {
            "otp": "<otp>",
            "newPassword": "<new_password>"
        }
        */
        async (req, res) => {
            if (!(typeof (req.body.otp) === 'string' && req.body.otp.length > 0 && validator.isNumeric(req.body.otp))) {
                return res.status(400).send({ "message": "Invalid OTP" });
            }

            if (!(typeof (req.body.newPassword) === 'string' && req.body.newPassword.length > 0)) {
                return res.status(400).send({ "message": "Invalid Data" });
            }


            const db_connection = await vcDb.promise().getConnection();

            try {

                await db_connection.query(`LOCK TABLES studentData AS s READ, managementData AS m READ`);

                if (req.body.userRole == "S") {
                    const [student] = await db_connection.query(`SELECT * from studentData AS s WHERE s.studentId = ?`, [req.body.userId]);

                    if (student.length > 0) {

                        await db_connection.query('LOCK TABLES forgotPasswordStudent WRITE');

                        const [check1] = await db_connection.query(`DELETE FROM forgotPasswordStudent WHERE studentId = ? AND otp = ?`, [student[0].studentId, req.body.otp]);

                        if (check1.affectedRows == 0) {
                            return res.status(400).send({
                                "message": "Invalid OTP"
                            });
                        }

                        await db_connection.query("LOCK TABLES studentData WRITE");

                        await db_connection.query(`UPDATE studentData SET studentPassword = ? WHERE studentId = ?`, [req.body.newPassword, student[0].studentId]);

                        return res.status(200).send({
                            "message": "Password Reset Successful."
                        });

                    } else {
                        return res.status(400).send({
                            "message": "Invalid Request"
                        });
                    }
                }

                if (req.body.userRole == "M") {
                    const [manager] = await db_connection.query(`SELECT * from managementData AS m WHERE m.managerId = ?`, [req.body.userId]);

                    if (manager.length > 0) {

                        await db_connection.query('LOCK TABLES forgotPasswordManagement WRITE');

                        const [check1] = await db_connection.query(`DELETE FROM forgotPasswordManagement WHERE managerId = ? AND otp = ?`, [manager[0].managerId, req.body.otp]);

                        if (check1.affectedRows == 0) {
                            return res.status(400).send({
                                "message": "Invalid OTP"
                            });
                        }

                        await db_connection.query("LOCK TABLES managementData WRITE");

                        await db_connection.query(`UPDATE managementData SET managerPassword = ? WHERE managerId = ?`, [req.body.newPassword, manager[0].managerId]);

                        return res.status(200).send({
                            "message": "Password Reset Successful."
                        });

                    } else {
                        return res.status(400).send({
                            "message": "Invalid Request"
                        });
                    }
                }

                return res.status(400).send({
                    "message": "Invalid Request"
                });


            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - verifyAndResetPassword - ${err}\n`);
                return res.status(500).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query('UNLOCK TABLES');
                db_connection.release();
                db_connection.close();
            }

        }
    ],
}


module.exports = authController;