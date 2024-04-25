const vcDb  = require('../connection/poolConnection');
const { generateToken } = require('../middleware/login/tokenGenerator');

const fs = require('fs');

const adminController = {
    testConnection: async (req, res) => {
        return res.status(200).send({
            "MESSAGE": "Admin is up. 👍🏻",
            "WHO": "Admin"
        });
    },
    createCourse: async (req,res)=>{
        let db_connection = await vcDb.promise().getConnection();  
        console.log(req);    
        try{
            // await db_connection.query(`LOCK TABLES course READ`);
            await db_connection.query(`INSERT INTO course (courseCode, courseName, courseDept, createdBy) VALUES(?, ?, ?, ?)`,[req.body.courseCode,req.body.courseName,req.body.courseDept,req.body.userId])
            return res.json([req.body.courseCode,req.body.courseName,req.body.courseDept]);
        }catch(err){
            console.log(err);
            const time = new Date();
            fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - userLogin - ${err}\n`);
            return res.status(500).send({ "message": "Internal Server Error." });
        }finally {
            // await db_connection.query(`UNLOCK TABLES`);
            db_connection.release();
        }
    },
    updateCourse: async (req,res)=>{
        let db_connection = await vcDb.promise().getConnection();  
        console.log(req);    
        try{
            
            await db_connection.query(`UPDATE course SET courseCode=?,courseName=?,courseDept=? WHERE courseId=? `,[req.body.courseCode,req.body.courseName,req.body.courseDept,req.body.courseId])
            return res.json([req.body.courseCode,req.body.courseName,req.body.courseDept,req.body.courseId]);
        }catch(err){
            console.log(err);
            const time = new Date();
            fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - userLogin - ${err}\n`);
            return res.status(500).send({ "message": "Internal Server Error." });
        }finally {
            // await db_connection.query(`UNLOCK TABLES`);
            db_connection.release();
        }
    }
}

module.exports = adminController;