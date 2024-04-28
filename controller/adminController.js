const vcDb = require('../connection/poolConnection');

const fs = require('fs');
const validateToken = require('../middleware/login/tokenValidator');

const validator = require('validator');

const adminController = {
    testConnection: async (req, res) => {
        return res.status(200).send({
            "message": "Admin is up. 👍🏻",
            "WHO": "Admin"
        });
    },

    createNewCourse: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            if (!(typeof (req.body.courseCode) == 'string' && req.body.courseCode.length > 0 && typeof (req.body.courseType) == 'string' && req.body.courseType.length > 0 && ['1', '2', '3'].includes(req.body.courseType) && typeof (req.body.courseName) == 'string' && req.body.courseName.length > 0 && typeof (req.body.courseDeptId) == 'string' && req.body.courseDeptId.length > 0 && validator.isNumeric(req.body.courseDeptId))) {
                return res.status(400).send({ "message": "Invalid Data." });
            }

            let db_connection = await vcDb.promise().getConnection();

            try {

                // check if admin or dept head or office, roleId = 1 or 2 or 3
                await db_connection.query(`LOCK TABLES managementData m READ`);

                let [roleCheck] = await db_connection.query(`SELECT roleId, deptId FROM managementData AS m WHERE managerId = ?`, [req.body.userId]);

                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3)) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                // check if course with same courseCode already exists
                await db_connection.query(`LOCK TABLES courseData c READ`);

                let [courseCheck] = await db_connection.query(`SELECT courseId FROM courseData AS c WHERE courseCode = ?`, [req.body.courseCode]);

                if (courseCheck.length > 0) {
                    return res.status(400).send({ "message": "Course with same courseCode already exists." });
                }

                let [courseCheckName] = await db_connection.query(`SELECT courseName FROM courseData AS c WHERE courseCode = ?`, [req.body.courseCode]);

                if (courseCheckName.length > 0) {
                    return res.status(400).send({ "message": "Course with same courseName already exists." });
                }

                // check if department with courseDeptId exists

                await db_connection.query(`LOCK TABLES departmentData READ`);

                let [deptCheck] = await db_connection.query(`SELECT deptId FROM departmentData WHERE deptId = ?`, [req.body.courseDeptId]);

                if (deptCheck.length == 0) {
                    return res.status(400).send({ "message": "Department does not exist." });
                }

                if (roleCheck[0].roleId === 2 && roleCheck[0].deptId !== req.body.courseDeptId) {
                    return res.status(400).send({ "message": "Error! not same department" });
                }

                await db_connection.query(`LOCK TABLES courseData WRITE`);

                let [insertCourse] = await db_connection.query(`INSERT INTO courseData (courseCode, courseName, courseType, courseDeptId, createdBy, updatedBy) VALUES (?, ?, ?, ?, ?, ?)`, [req.body.courseCode, req.body.courseName, req.body.courseType, req.body.courseDeptId, req.body.userId, req.body.userId]);

                if (insertCourse.affectedRows == 0) {
                    return res.status(500).send({ "message": "Internal Server Error." });
                }

                return res.status(201).send({ "message": "Course created successfully." });

            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - createNewCourse - ${err}\n`);
                return res.status(400).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.close();
                db_connection.release();
            }

        }
    ],

    updateCourseData: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            if (!(typeof (req.body.courseCode) == 'string' && req.body.courseCode.length > 0 && typeof (req.body.courseType) == 'string' && req.body.courseType.length > 0 && ['1', '2', '3'].includes(req.body.courseType) && typeof (req.body.courseName) == 'string' && req.body.courseName.length > 0 && typeof (req.body.courseDeptId) == 'string' && req.body.courseDeptId.length > 0 && validator.isNumeric(req.body.courseDeptId) && typeof (req.body.courseId) == 'string' && req.body.courseId.length > 0 && validator.isNumeric(req.body.courseId))) {
                return res.status(400).send({ "message": "Invalid Data." });
            }



            let db_connection = await vcDb.promise().getConnection();

            try {

                // check if admin or dept head or office, roleId = 1 or 2 or 3
                await db_connection.query(`LOCK TABLES managementData m READ`);

                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData AS m WHERE managerId = ?`, [req.body.userId]);

                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3)) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                // check if course exists

                await db_connection.query(`LOCK TABLES courseData c READ, departmentData READ`);

                let [courseCheck] = await db_connection.query(`SELECT * FROM courseData AS c WHERE courseId = ?`, [req.body.courseId]);

                if (courseCheck.length == 0) {
                    return res.status(400).send({ "message": "Course does not exist." });
                }

                // if course exists, and if roleId is 2 check if course belongs to dept

                if (roleCheck[0].roleId == 2 && courseCheck[0].courseDeptId != roleCheck[0].deptId) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                // check if department with courseDeptId exists

                let [deptCheck] = await db_connection.query(`SELECT deptId FROM departmentData WHERE deptId = ?`, [req.body.courseDeptId]);

                if (deptCheck.length == 0) {
                    return res.status(400).send({ "message": "Department does not exist." });
                }

                // check if another course with same courseCode exists

                let [courseCodeCheck] = await db_connection.query(`SELECT courseId FROM courseData AS c WHERE courseCode = ? AND courseId != ?`, [req.body.courseCode, req.body.courseId]);

                if (courseCodeCheck.length > 0) {
                    return res.status(400).send({ "message": "Course with same courseCode already exists." });
                }

                // update course

                await db_connection.query(`LOCK TABLES courseData c WRITE`);


                let [updateCourse] = await db_connection.query(`UPDATE courseData AS c SET courseCode = ?, courseName = ?, courseType = ?, courseDeptId = ?, updatedBy = ? WHERE courseId = ?`, [req.body.courseCode, req.body.courseName, req.body.courseType, req.body.courseDeptId, req.body.userId, req.body.courseId]);


                if (updateCourse.affectedRows == 0) {
                    return res.status(500).send({ "message": "Internal Server Error." });
                }

                return res.status(200).send({ "message": "Course updated successfully." });

            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - createNewCourse - ${err}\n`);
                return res.status(500).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.close();
                db_connection.release();
            }

        }
    ],

    getAllCourses: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            let db_connection = await vcDb.promise().getConnection();

            try {

                // check if admin or dept head or office, roleId = 1 or 2 or 3
                await db_connection.query(`LOCK TABLES managementData m READ`);

                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData AS m WHERE managerId = ?`, [req.body.userId]);

                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3)) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }


                // if admin or office, show all
                if (roleCheck[0].roleId == 1 || roleCheck[0].roleId == 3) {
                    await db_connection.query('LOCK TABLES courseData c READ, departmentData d READ, managementData m READ');

                    let [courseData] = await db_connection.query(`SELECT c.courseId, c.courseCode, c.courseType, c.courseName, c.courseDeptId, d.deptName, m.managerEmail, m.managerFullName FROM courseData AS c JOIN departmentData AS d ON c.courseDeptId = d.deptId JOIN managementData AS m ON c.createdBy = m.managerId`);

                    if (courseData.length === 0) {
                        return res.status(200).send({ "message": "No courses found.", "data": [] });
                    }


                    return res.status(200).send({
                        "message": "Fetched Successfully",
                        "data": courseData,
                    })
                }

                // if dept head. show only respective dept courses
                if (roleCheck[0].roleId == 2) {
                    await db_connection.query('LOCK TABLES courseData c READ, departmentData d READ, managementData m READ');

                    let [courseData] = await db_connection.query(`SELECT c.courseId, c.courseCode, c.courseType, c.courseName, c.courseDeptId, d.deptName, m.managerEmail, m.managerFullName FROM courseData AS c JOIN departmentData AS d ON c.courseDeptId = d.deptId JOIN managementData AS m ON c.createdBy = m.managerId WHERE c.courseDeptId = ?`, [roleCheck[0].deptId]);

                    if (courseData.length === 0) {
                        return res.status(200).send({ "message": "No courses found.", "data": [] });
                    }

                    return res.status(200).send({
                        "message": "Fetched Successfully",
                        "data": courseData,
                    })
                }

                // if professor. show only their courses
                if (roleCheck[0].roleId == 4) {
                    return res.status(400).send({
                        "message": "Work in Progress",
                    })
                }


                return res.status(400).send({
                    "message": "Invalid Request"
                });

            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - getMyCourses - ${err}\n`);
                return res.status(500).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query('UNLOCK TABLES');
                db_connection.close();
                db_connection.release();
            }
        }
    ],
    assignProfessor:[
        validateToken,
        async(req,res)=>{
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }
            let db_connection = await vcDb.promise().getConnection();
            try{
                if(!(typeof(req.body.batchStart)=='string' && req.body.batchStart.length==4 && typeof(req.body.batchEnd)=='string' && req.body.batchEnd.length==4 && typeof(req.body.section)=='string' && req.body.section.length==1 && validator.isNumeric(req.body.courseId) && validator.isNumeric(req.body.managerId)))
                {
                    return res.status(400).send({"message":"invalid inputs!"});
                }
                await db_connection.query(`LOCK TABLES managementData READ`);
                let [roleCheck]=await db_connection.query(`SELECT * FROM managementData WHERE managerId=?`,[req.body.userId]);
                    if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3)) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }
                // the course id should be in course table
                await db_connection.query(`LOCK TABLES courseData READ`);
                let [courseCheck]=await db_connection.query(`SELECT courseId,courseDeptId FROM courseData WHERE courseId=?`,[req.body.courseId]);
                // console.log({"courseCheck":courseCheck});
                if(courseCheck[0].length==0)
                {
                    await db_connection.query(`UNLOCK TABLES`); 
                    return res.status(400).send({"message":"course not exists"});
                }
                // check if managerId exists
                await db_connection.query(`UNLOCK TABLES`); 
                await db_connection.query(`LOCK TABLES managementData READ`); 
                let [managerCheck]=await db_connection.query(`SELECT managerId,deptId FROM managementData WHERE managerId=?`,[req.body.managerId]);
                // console.log({"managerCheck":managerCheck});
                if(managerCheck[0].length==0)
                {
                    await db_connection.query(`UNLOCK TABLES`); 
                    return res.status(400).send({"message":"manager not exists"});
                }
                // check if section is present or not
                await db_connection.query(`UNLOCK TABLES`); 
                await db_connection.query(`LOCK TABLES studentData READ`);
                let [sectionCheck]=await db_connection.query(`SELECT studentSection FROM studentData WHERE studentSection=?`,[req.body.section]);
                // console.log({"sectionCheck":sectionCheck});
                if(sectionCheck[0].length===0)
                {
                    await db_connection.query(`UNLOCK TABLES`); 
                    return res.status(400).send({"message":"section not exists"});
                }
                // batch exists or not
                await db_connection.query(`UNLOCK TABLES`); 
                await db_connection.query(`LOCK TABLES studentData READ`);
                let [batchCheck]=await db_connection.query(`SELECT studentBatchStart FROM studentData WHERE studentBatchStart=? AND studentBatchEnd=?`,[req.body.batchStart,req.body.batchEnd]);
                // console.log({"batchCheck":batchCheck});
                if(batchCheck[0].length==0)
                {
                    await db_connection.query(`UNLOCK TABLES`); 
                    return res.status(400).send({"message":"batch not exists"});
                }

                // whether section is present for that particular batch
                await db_connection.query(`UNLOCK TABLES`); 
                await db_connection.query(`LOCK TABLES studentData READ`);
                let [sectionCheckBatch]=await db_connection.query(`SELECT studentSection FROM studentData WHERE studentSection=? AND studentBatchStart=? AND studentBatchEnd=?`,[req.body.section,req.body.batchStart,req.body.batchEnd]);
                // console.log({"sectionCheckBatch":sectionCheckBatch});
                if(sectionCheckBatch[0].length===0)
                {
                    await db_connection.query(`UNLOCK TABLES`); 
                    return res.status(400).send({"message":"batch not exists"});
                }

                //whether coursedept and managerdept are same
                if(managerCheck[0].deptId!=courseCheck[0].courseDeptId)
                {
                    await db_connection.query(`UNLOCK TABLES`); 
                    return res.status(400).send({"message":"not same departments"});
                }

                if(req.roleId==2 && roleCheck[0].deptId!=courseCheck[0].courseDeptId && roleCheck[0].deptId!=managerCheck[0].deptId)
                {
                    await db_connection.query(`UNLOCK TABLES`); 
                    return res.status(400).send({"message":"user is of different department"});
                }
                await db_connection.query(`LOCK TABLES courseFaculty WRITE`);
                let [insert]=await db_connection.query(`INSERT INTO courseFaculty (courseId,managerId,batchStart,batchEnd,section,createdBy,updatedBy) VALUES(?,?,?,?,?,?,?)`,[req.body.courseId,req.body.managerId,req.body.batchStart,req.body.batchEnd,req.body.section,req.body.userId,req.body.userId])
                // console.log({"insert":insert})
                await db_connection.query(`UNLOCK TABLES`);
                if(insert.affectedRows==0)
                {
                   return  res.status(400).send({"messgae":"internal server error"});
                }
                else{
                    res.status(200).send({"message":"sucessfully updated!"});
                }
            }catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - getMyCourses - ${err}\n`);
                return res.status(500).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query('UNLOCK TABLES');
                db_connection.close();
                db_connection.release();
            }
        }
    ]
}

module.exports = adminController;