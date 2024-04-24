const vcDb = require('../connection/poolConnection');

const { generateToken } = require('../middleware/login/tokenGenerator');
const { validateToken } = require('../middleware/login/tokenValidator');
const generateOTP = require("../middleware/forgotPassword/otpGenerator");
const createToken = require("../middleware/forgotPassword/tokenGenerator");
const createOtpToken = require("../middleware/forgotPassword/otpTokenGenerator");
const resetPasswordValidator = require("../middleware/forgotPassword/otpTokenValidator");
const tokenValidator = require("../middleware/forgotPassword/tokenValidator");
const fs = require('fs');
const reset_PW_OTP = require('../mail/mailer');

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
    forgotPassword: async(req,res)=>{
        if(req.body.userEmail === null || req.body.userEmail === undefined || req.body.userEmail === ""){
            return res.status(400).send({"message":"missing details"});
        }
        let db_connection = await vcDb.promise().getConnection();
        try{
            await db_connection.query("LOCK TABLES studentData READ,managementData READ");
            let [student]=await db_connection.query("SELECT * FROM studentData WHERE studentEmail=?",[req.body.userEmail])
            let [manager]=await db_connection.query("SELECT * FROM managementData WHERE managerEmail=?",[req.body.userEmail])
            await db_connection.query('UNLOCK TABLES');
            if(student.length===0 && manager.length===0)
            {
                
                return res.status(400).send({"message":"no user exists"});
            }
            const otp=generateOTP();
            let userRole="";
            let name="";
            if(manager.length===0)
            {
                if (student[0].studentStatus === "2") {
                    return res.status(401).send({ "message": "Your Account has been deactivated. Check you mail for further instructions." });
                } else if (student[0].studentStatus !== "1") {
                    return res.status(401).send({ "message": "account restricted!" });
                }
                await db_connection.query(`LOCK TABLES studentRegister WRITE`);
                userRole="S";
                name = student[0]["studentName"]
                let [student_2]=await db_connection.query("SELECT * FROM studentRegister WHERE studentEmail=?",[req.body.userEmail]);
                if(student_2.length===0)
                {
                    await db_connection.query("INSERT INTO studentRegister (studentEmail,otp,createdAt) VALUES(?,?,?)",[req.body.userEmail,otp,new Date().toISOString().slice(0, 19).replace('T', ' ')]);
                }
                else{
                    await db_connection.query("UPDATE studnetRegister SET otp=?,createdAt=? WHERE studnetEmail=?",[otp,new Date().toISOString().slice(0, 19).replace('T', ' '),req.body.userEmail]);
                }
                await db_connection.query(`UNLOCK TABLES`);
            }
            else{
                if (manager[0].managerstatus === "2") {
                    return res.status(401).send({ "message": "Your Account has been deactivated. Check you mail for further instructions." });
                } else if (manager[0].managerstatus !== "1") {
                    return res.status(401).send({ "message": "account restricted!" });
                }
                await db_connection.query(`LOCK TABLES managerRegister WRITE`);
                userRole="M";
                name = manager[0]["managerFullName"]
                let [manager_2]=await db_connection.query("SELECT * FROM managerRegister WHERE managerEmail=?",[req.body.userEmail]);
                if(manager_2.length===0)
                {
                    await db_connection.query("INSERT INTO managerRegister (managerEmail,otp,createdAt) VALUES(?,?,?)",[req.body.userEmail,otp,new Date().toISOString().slice(0, 19).replace('T', ' ')]);
                }
                else{
                    await db_connection.query("UPDATE managerRegister SET otp=?,createdAt=? WHERE managerEmail=?",[otp,new Date().toISOString().slice(0, 19).replace('T', ' '),req.body.userEmail]);
                }
                await db_connection.query(`UNLOCK TABLES`);
            } 
            const secret_token=await createOtpToken({
                "userEmail":req.body.userEmail, 
                "userRole":userRole
            })
            // console.log(name);
            reset_PW_OTP(name, otp, req.body.userEmail);
            return res.status(200).send({
                "message": "OTP sent to email.",
                "SECRET_TOKEN": secret_token,
                "userEmail": req.body.userEmail
            });
        }catch (err) {
            console.log(err);
            const time = new Date();
            fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - forgotPassword - ${err}\n`);
            return res.status(500).send({ "message": "Internal Server Error." });
        } finally {
            await db_connection.query(`UNLOCK TABLES`);
            db_connection.release();
        }
    },
    resetPasswordVerify : [
        resetPasswordValidator,
        async(req,res)=>{
            if ((req.body.authorization_tier !== "S" && req.body.authorization_tier !== "M" ) || req.body.userEmail === null || req.body.userEmail === undefined || req.body.userEmail === "" ||  req.body.otp === null || req.body.otp === undefined || req.body.otp === "") {
                return res.status(400).send({ "message": "Access Restricted!" });
            }
            let db_connection = await vcDb.promise().getConnection();
            try{

                await db_connection.query(`LOCK studentRegister WRITE,managerRegister WRITE`);
                let check;
                if(req.authorization_tier === "M")
                {
                    [check]=db_connection.query(`DELETE FROM managerRegister WHERE ManagerEmail=? AND otp=?`,[req.body.userEmail,req.body.otp])
                }
                if(req.authorization_tier === "S")
                {
                    [check]=db_connection.query(`DELETE FROM managerRegister WHERE ManagerEmail=? AND otp=?`,[req.body.userEmail,req.body.otp])
                }

                if (check.affectedRows === 0) {
                    await db_connection.query(`UNLOCK TABLES`);
                    return res.status(400).send({ "message": "Invalid OTP!" });
                }
                await db_connection.query(`UNLOCK TABLES`);
                const secret_token = await createToken({
                    "userEmail": req.body.userEmail,
                    "userRole": req.body.authorization_tier
                });

                return res.status(200).send({
                    "message": "Otp verified successfully!",
                    "SECRET_TOKEN": secret_token
                });

            }catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - resetPassword - ${err}\n`);
                return res.status(500).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.release();
            }
        }
    ],

    
}


module.exports = authController;