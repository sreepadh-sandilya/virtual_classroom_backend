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

            if (!(typeof (req.body.courseCode) == 'string' && req.body.courseCode.length > 0 && typeof (req.body.courseName) == 'string' && req.body.courseName.length > 0 && typeof (req.body.courseDeptId) == 'string' && req.body.courseDeptId.length > 0 && validator.isNumeric(req.body.courseDeptId))) {
                return res.status(400).send({ "message": "Invalid Data." });
            }

            let db_connection = await vcDb.promise().getConnection();

            try {

                // check if admin or dept head or office, roleId = 1 or 2 or 3
                await db_connection.query(`LOCK TABLES managementData m READ`);

                let [roleCheck] = await db_connection.query(`SELECT roleId FROM managementData AS m WHERE managerId = ?`, [req.body.userId]);

                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3)) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                // check if course with same courseCode already exists
                await db_connection.query(`LOCK TABLES courseData c READ`);

                let [courseCheck] = await db_connection.query(`SELECT courseId FROM courseData AS c WHERE courseCode = ?`, [req.body.courseCode]);

                if (courseCheck.length > 0) {
                    return res.status(400).send({ "message": "Course with same courseCode already exists." });
                }

                // check if department with courseDeptId exists

                await db_connection.query(`LOCK TABLES departmentData READ`);

                let [deptCheck] = await db_connection.query(`SELECT deptId FROM departmentData WHERE deptId = ?`, [req.body.courseDeptId]);

                if (deptCheck.length == 0) {
                    return res.status(400).send({ "message": "Department does not exist." });
                }

                // insert new course

                await db_connection.query(`LOCK TABLES courseData WRITE`);

                let [insertCourse] = await db_connection.query(`INSERT INTO courseData (courseCode, courseName, courseDeptId, createdBy, updatedBy) VALUES (?, ?, ?, ?, ?)`, [req.body.courseCode, req.body.courseName, req.body.courseDeptId, req.body.userId, req.body.userId]);

                if (insertCourse.affectedRows == 0) {
                    return res.status(500).send({ "message": "Internal Server Error." });
                }

                return res.status(201).send({ "message": "Course created successfully." });

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
            // only admin and office

            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            const db_connection = await vcDb.promise().getConnection();

            try {

                await db_connection.query(`LOCK TABLES courseData c READ, managementData m READ, departmentData d READ`);

                let [roleCheck] = await db_connection.query(`SELECT roleId FROM managementData AS m WHERE managerId = ?`, [req.body.userId]);

                if (roleCheck.length === 0) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                if (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 3) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                let [courseData] = await db_connection.query(`SELECT c.courseId, c.courseCode, c.courseName, c.courseDeptId, d.deptName, m.managerEmail, m.managerFullName FROM courseData AS c JOIN departmentData AS d ON c.courseDeptId = d.deptId JOIN managementData AS m ON c.createdBy = m.managerId`);

                if (courseData.length === 0) {
                    return res.status(200).send({ "message": "No courses found.", "data": [] });
                }


                return res.status(200).send({
                    "message": "Fetched Successfully",
                    "data": courseData,
                })

            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - getAllCourses - ${err}\n`);
                return res.status(500).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query('UNLOCK TABLES');
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

            if (!(typeof (req.body.courseCode) == 'string' && req.body.courseCode.length > 0 && typeof (req.body.courseName) == 'string' && req.body.courseName.length > 0 && typeof (req.body.courseDeptId) == 'string' && req.body.courseDeptId.length > 0 && validator.isNumeric(req.body.courseDeptId) && typeof (req.body.courseId) == 'string' && req.body.courseId.length > 0 && validator.isNumeric(req.body.courseId))) {
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

                let [updateCourse] = await db_connection.query(`UPDATE courseData AS c SET courseCode = ?, courseName = ?, courseDeptId = ?, updatedBy = ? WHERE courseId = ?`, [req.body.courseCode, req.body.courseName, req.body.courseDeptId, req.body.userId, req.body.courseId]);


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


}

module.exports = adminController;