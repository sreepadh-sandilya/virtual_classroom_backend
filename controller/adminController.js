const vcDb = require('../connection/poolConnection');

const fs = require('fs');
const validateToken = require('../middleware/login/tokenValidator');
const [validateEmail, ValidTimestamp, ValidateLink, calculateDuration] = require('../helper/dataValidator');
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

                return res.status(200).send({ "message": "Course created successfully." });

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

                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3 && roleCheck[0].roleId != 4)) {
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
                    await db_connection.query('LOCK TABLES courseData c READ, courseFaculty f READ');

                    let [courseData] = await db_connection.query(`SELECT c.courseId,c.courseCode,c.courseName,c.courseDeptId,c.courseStatus,c.courseType FROM courseData AS c INNER JOIN courseFaculty f ON f.courseId=c.courseId WHERE managerId=?`, [req.body.userId]);

                    if (courseData.length === 0) {
                        return res.status(200).send({ "message": "No courses found.", "data": [] });
                    }

                    return res.status(200).send({
                        "message": "Fetched Successfully",
                        "data": courseData,
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
    assignProfessor: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }
            if (!(typeof (req.body.batchStart) == 'string' && req.body.batchStart.length == 4 && typeof (req.body.batchEnd) == 'string' && req.body.batchEnd.length == 4 && typeof (req.body.section) == 'string' && req.body.section.length == 1 && validator.isNumeric(req.body.courseId) && validateEmail(req.body.managerEmail))) {
                return res.status(400).send({ "message": "invalid inputs!" });
            }

            if (!(typeof(req.body.isMentor) == 'string' && req.body.isMentor.length == 1)) {
                return res.status(400).send({ "message": "invalid inputs!" });
            }

            let db_connection = await vcDb.promise().getConnection();
            try {

                await db_connection.query(`LOCK TABLES managementData m READ, courseData c READ`);

                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData AS m WHERE managerId = ?`, [req.body.userId]);

                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3)) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                let [courseCheck] = await db_connection.query(`SELECT courseId FROM courseData AS c WHERE courseId = ?`, [req.body.courseId]);

                if (courseCheck.length == 0) {
                    return res.status(400).send({ "message": "Course does not exist." });
                }

                await db_connection.query(`LOCK TABLES courseFaculty f WRITE, managementData m READ`);

                let [professorCheck] = await db_connection.query(`SELECT managerId FROM managementData AS m WHERE managerEmail = ? AND (roleId = 2 OR roleId = 4)`, [req.body.managerEmail]);

                if (professorCheck.length == 0) {
                    return res.status(400).send({ "message": "Professor does not exist." });
                } 

                // check if some professor is already assigned to course for that batch
                await db_connection.query(`LOCK TABLES courseFaculty READ`);
                let [professorCourseCheck] = await db_connection.query(`SELECT * FROM courseFaculty WHERE courseId = ? AND batchStart = ? AND batchEnd = ? AND section = ?`, [req.body.courseId, req.body.batchStart, req.body.batchEnd, req.body.section]);

                if (professorCourseCheck.length > 0) {
                    return res.status(400).send({ "message": "Some Professor already assigned to course for that batch." });
                }

                // check is mentor is already assigned to course and batch
                if (req.body.isMentor === "1") {
                    let [mentorCheck] = await db_connection.query(`SELECT * FROM courseFaculty WHERE courseId = ? AND batchStart = ? AND batchEnd = ? AND section = ? AND isMentor = '1'`, [req.body.courseId, req.body.batchStart, req.body.batchEnd, req.body.section]);

                    if (mentorCheck.length > 0) {
                        return res.status(400).send({ "message": "Mentor already assigned to course for that batch." });
                    }
                }

                await db_connection.query(`LOCK TABLES courseFaculty WRITE`);
                await db_connection.query(`INSERT INTO courseFaculty (courseId, managerId, batchStart, batchEnd, section, isMentor, createdBy, updatedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [req.body.courseId, professorCheck[0].managerId, req.body.batchStart, req.body.batchEnd, req.body.section, req.body.isMentor, req.body.userId, req.body.userId]);

                return res.status(200).send({ "message": "Professor assigned to course." });

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

    editAssignedProfessor: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }
            if (!(typeof (req.body.batchStart) == 'string' && req.body.batchStart.length == 4 && typeof (req.body.batchEnd) == 'string' && req.body.batchEnd.length == 4 && typeof (req.body.section) == 'string' && req.body.section.length == 1 && validator.isNumeric(req.body.courseId) && validateEmail(req.body.managerEmail))) {
                return res.status(400).send({ "message": "invalid inputs!" });
            }

            if (!(typeof(req.body.isMentor) == 'string' && req.body.isMentor.length == 1)) {
                return res.status(400).send({ "message": "invalid inputs!" });
            }

            let db_connection = await vcDb.promise().getConnection();

            try {

                await db_connection.query(`LOCK TABLES managementData m READ, courseData c READ`);

                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData AS m WHERE managerId = ?`, [req.body.userId]);

                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3)) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                let [courseCheck] = await db_connection.query(`SELECT courseId FROM courseData AS c WHERE courseId = ?`, [req.body.courseId]);

                if (courseCheck.length == 0) {
                    return res.status(400).send({ "message": "Course does not exist." });
                }

                await db_connection.query(`LOCK TABLES courseFaculty f READ, managementData m READ`);

                let [professorCheck] = await db_connection.query(`SELECT managerId FROM managementData AS m WHERE managerEmail = ? AND (roleId = 2 OR roleId = 4)`, [req.body.managerEmail]);

                if (professorCheck.length == 0) {
                    return res.status(400).send({ "message": "Professor does not exist." });
                }

                // check whether entry exists in courseFaculty

                await db_connection.query(`LOCK TABLES courseFaculty READ`);
                let [professorCourseCheck] = await db_connection.query(`SELECT * FROM courseFaculty WHERE courseId = ? AND batchStart = ? AND batchEnd = ? AND section = ?`, [req.body.courseId, req.body.batchStart, req.body.batchEnd, req.body.section]);

                if (professorCourseCheck.length == 0) {
                    return res.status(400).send({ "message": "No Professor assigned to course for that batch." });
                }

                // check is mentor is already assigned to course and batch
                if (req.body.isMentor === "1") {
                    let [mentorCheck] = await db_connection.query(`SELECT * FROM courseFaculty WHERE courseId = ? AND batchStart = ? AND batchEnd = ? AND section = ? AND isMentor = '1'`, [req.body.courseId, req.body.batchStart, req.body.batchEnd, req.body.section]);

                    if (mentorCheck.length > 0) {
                        return res.status(400).send({ "message": "Mentor already assigned to course for that batch." });
                    }
                }

                await db_connection.query(`LOCK TABLES courseFaculty WRITE`);
                await db_connection.query(`UPDATE courseFaculty SET managerId = ?, isMentor = ?, updatedBy = ? WHERE courseId = ? AND batchStart = ? AND batchEnd = ? AND section = ?`, [professorCheck[0].managerId, req.body.isMentor, req.body.userId, req.body.courseId, req.body.batchStart, req.body.batchEnd, req.body.section]);

                return res.status(200).send({ "message": "Professor assigned to course." });

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

    addDepartment: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            let db_connection = await vcDb.promise().getConnection();
            try {
                if (typeof (req.body.deptName) != 'string' || req.body.deptName.length == 0) {
                    return res.status(400).send({ "message": "invalid inputs!" });
                }
                await db_connection.query(`LOCK TABLES managementData READ`);
                // only admin can insert departmnets
                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData WHERE managerId=?`, [req.body.userId]);
                if (roleCheck.length == 0 || roleCheck[0].roleId != 1) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }
                await db_connection.query(`LOCK TABLES departmentData WRITE`);
                [checkDepartment] = await db_connection.query(`SELECT deptName FROM departmentData WHERE deptName=?`, [req.body.deptName]);
                if (checkDepartment.length != 0) {
                    return res.status(400).send({ "message": "department already exists!" });
                }
                await db_connection.query(`INSERT INTO departmentData(deptName) VALUES(?)`, [req.body.deptName]);
                await db_connection.query(`UNLOCK TABLES`);
                return res.status(200).send({ "message": "sucessfully updated!" });
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
    createClassroom: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            let db_connection = await vcDb.promise().getConnection();
            try {
                if (!(validator.isNumeric(req.body.classroomId) && ValidateLink(req.body.classLink) && ValidTimestamp(req.body.classStartTime) && ValidTimestamp(req.body.classEndTime))) {
                    return res.status(400).send({ "message": "invalid inputs!" });
                }
                await db_connection.query(`LOCK TABLES managementData READ`);

                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData WHERE managerId=?`, [req.body.userId]);
                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3 && roleCheck[0].roleId != 4)) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "Unauthorized Access" });
                }
                await db_connection.query(`LOCK TABLES classRoomData WRITE,courseFaculty READ`);
                // check if classroomId is present in courseFac table
                let [checkRoomIdFac] = await db_connection.query(`SELECT classroomId FROM courseFaculty WHERE classroomId=?`, [req.body.classroomId]);
                if (checkRoomIdFac.length == 0) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "classroomId does not exists!" });
                }
                // check if same classroomId exists at particular startTime and endTime
                let [checkRoomId] = await db_connection.query(`SELECT classroomId FROM classRoomData WHERE classroomId=? AND classStartTime=? AND classEndTime=?`, [req.body.classroomId, req.body.classStartTime, req.body.classEndTime]);
                if (checkRoomId.length != 0) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "classroomId already exists during that time period!" })
                }

                // check if same link exists in same time period 

                let [checkLink] = await db_connection.query(`SELECT classLink FROM classRoomData WHERE classLink=? AND classStartTime=? AND classEndTime=?`, [req.body.classLink, req.body.classStartTime, req.body.classEndTime]);
                if (checkLink.length != 0) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "link already exists in this period" });
                }
                if (req.body.classStartTime > req.body.classEndTime) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "start time cannot be greater than end time!" });
                }
                await db_connection.query(`INSERT INTO classRoomData(classroomId,classStartTime,classEndTime,classLink) VALUES(?,?,?,?)`, [req.body.classroomId, req.body.classStartTime, req.body.classEndTime, req.body.classLink]);
                await db_connection.query('UNLOCK TABLES');
                return res.status(200).send({ "message": "sucessfully inserted!" });

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
    updateClassroom: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            let db_connection = await vcDb.promise().getConnection();
            try {
                if (!(validator.isNumeric(req.body.classroomId) && validator.isNumeric(req.body.classId) && ValidateLink(req.body.classLink) && ValidTimestamp(req.body.classStartTime) && ValidTimestamp(req.body.classEndTime))) {
                    return res.status(400).send({ "message": "invalid inputs!" });
                }
                await db_connection.query(`LOCK TABLES managementData READ`);

                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData WHERE managerId=?`, [req.body.userId]);
                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3 && roleCheck[0].roleId != 4)) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }
                await db_connection.query(`LOCK TABLES classRoomData WRITE,courseFaculty READ`);
                // check if classroomId is present in courseFac table
                let [checkRoomIdFac] = await db_connection.query(`SELECT classroomId FROM courseFaculty WHERE classroomId=?`, [req.body.classroomId]);
                if (checkRoomIdFac.length == 0) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "classroomId does not exists!" });
                }
                // check if same classroomId exists at particular startTime and endTime
                let [checkRoomId] = await db_connection.query(`SELECT classroomId FROM classRoomData WHERE classroomId=? AND classStartTime=? AND classEndTime=?`, [req.body.classroomId, req.body.classStartTime, req.body.classEndTime]);
                if (checkRoomId.length != 0) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "classroomId already exists during that time period!" })
                }
                //check classId if exists
                let [checkclassId] = await db_connection.query(`SELECT classId FROM classRoomData WHERE classId=?`, [req.body.classId]);
                if (checkclassId.length == 0) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "classId doesnot exists!" })
                }

                // check if same link exists in same time period

                let [checkLink] = await db_connection.query(`SELECT classLink FROM classRoomData WHERE classLink=? AND classStartTime=? AND classEndTime=?`, [req.body.classLink, req.body.classStartTime, req.body.classEndTime]);
                if (checkLink.length != 0) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "link already exists in this period" });
                }
                // start time should greater than current time
                const dateToCompare = new Date(req.body.classStartTime);
                if (new Date() > dateToCompare) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "cannot update the past data!" });
                }
                // start time cannot be greater than end time
                if (req.body.classStartTime > req.body.classEndTime) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "start time cannot be greater than end time!" });
                }
                await db_connection.query(`UPDATE classRoomData SET classroomId=?,classStartTime=?,classEndTime=?,classLink=? WHERE classId=?`, [req.body.classroomId, req.body.classStartTime, req.body.classEndTime, req.body.classLink, req.body.classId]);
                await db_connection.query('UNLOCK TABLES');
                return res.status(200).send({ "message": "sucessfully updated!" });


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
    createQuiz: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            let db_connection = await vcDb.promise().getConnection();
            try {
                if (!(typeof (req.body.quizName) == 'string' && req.body.quizName.length > 0 && typeof (req.body.quizDescription) == 'string' && req.body.quizDescription.length > 0 && validator.isNumeric(req.body.classroomId) && ValidTimestamp(req.body.startTime) && ValidTimestamp(req.body.endTime))) {
                    return res.status(400).send({ "messsge": "invalid data!" });
                }
                await db_connection.query(`LOCK TABLES managementData READ`);

                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData WHERE managerId=?`, [req.body.userId]);
                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3 && roleCheck[0].roleId != 4)) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "Unauthorized Access" });
                }

                await db_connection.query(`LOCK TABLES classRoomData READ,courseFaculty READ`);
                // check if classroomId is present in courseFac table
                let [checkRoomIdFac] = await db_connection.query(`SELECT classroomId FROM courseFaculty WHERE classroomId=?`, [req.body.classroomId]);
                if (checkRoomIdFac.length == 0) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "classroomId does not exists!" });
                }
                // check if same classroomId have quiz in same slots
                await db_connection.query(`LOCK TABLES quizData WRITE`);
                let [checkRoomId] = await db_connection.query(`SELECT classroomId FROM quizData WHERE classroomId=? AND startTime=? AND endTime=?`, [req.body.classroomId, req.body.startTime, req.body.endTime]);
                if (checkRoomId.length != 0) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "classroomId already has quiz during that time period!" })
                }
                if (req.body.startTime > req.body.endTime) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "start time cannot be greater than end time!" });
                }
                const duration = calculateDuration(req.body.startTime, req.body.endTime);
                await db_connection.query(`INSERT INTO quizData(classroomId,quizName,quizDescription,quizData,startTime,endTime,duration,createdBy,updatedBy) VALUES(?,?,?,?,?,?,?,?,?)`, [req.body.classroomId, req.body.quizName, req.body.quizDescription, JSON.stringify(req.body.quizData), req.body.startTime, req.body.endTime, duration, req.body.userId, req.body.userId]);
                await db_connection.query('UNLOCK TABLES');
                return res.status(200).send({ "messgage": "quiz created!", "data": req.body.quizData });
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
    updateQuiz: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            let db_connection = await vcDb.promise().getConnection();
            try {
                if (!(typeof (req.body.quizName) == 'string' && req.body.quizName.length > 0 && typeof (req.body.quizDescription) == 'string' && req.body.quizDescription.length > 0 && validator.isNumeric(req.body.classroomId) && validator.isNumeric(req.body.quizId) && ValidTimestamp(req.body.startTime) && ValidTimestamp(req.body.endTime))) {
                    return res.status(400).send({ "messsge": "invalid data" });
                }
                await db_connection.query(`LOCK TABLES managementData READ`);

                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData WHERE managerId=?`, [req.body.userId]);
                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3 && roleCheck[0].roleId != 4)) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "Unauthorized Access" });
                }

                await db_connection.query(`LOCK TABLES classRoomData READ,courseFaculty READ`);
                // check if classroomId is present in courseFac table
                let [checkRoomIdFac] = await db_connection.query(`SELECT classroomId FROM courseFaculty WHERE classroomId=?`, [req.body.classroomId]);
                if (checkRoomIdFac.length == 0) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "classroomId does not exists!" });
                }
                // check if same classroomId have quiz in same slots
                await db_connection.query(`LOCK TABLES quizData WRITE`);
                let [checkRoomId] = await db_connection.query(`SELECT classroomId FROM quizData WHERE classroomId=? AND startTime=? AND endTime=?`, [req.body.classroomId, req.body.startTime, req.body.endTime]);
                // if(checkRoomId.length!=0)
                // {
                //     await db_connection.query('UNLOCK TABLES');
                //     return res.status(400).send({"message":"classroomId already has quiz during that time period!"})
                // }
                if (req.body.startTime > req.body.endTime) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "start time cannot be greater than end time!" });
                }
                // check if quizId exists and whether start time is more than current time;
                let [quiz] = await db_connection.query(`SELECT * FROM quizData WHERE quizId=?`, [req.body.quizId]);
                if (quiz.length == 0) {
                    return res.status(400).send({ "message": "quizId does not exists!" });
                }
                const dateToCompare = new Date(req.body.startTime);
                if (new Date() > dateToCompare) {
                    await db_connection.query('UNLOCK TABLES');
                    return res.status(400).send({ "message": "cannot update the past data!" });
                }
                const duration = calculateDuration(req.body.startTime, req.body.endTime);
                await db_connection.query(`
    UPDATE quizData
    SET
        classroomId = ?,
        quizName = ?,
        quizDescription = ?,
        quizData = ?,
        startTime = ?,
        endTime = ?,
        duration = ?,
        createdBy = ?,
        updatedBy = ?
    WHERE
        quizId = ?
`, [
                    req.body.classroomId,
                    req.body.quizName,
                    req.body.quizDescription,
                    JSON.stringify(req.body.quizData),
                    req.body.startTime,
                    req.body.endTime,
                    duration,
                    req.body.userId,
                    req.body.userId,
                    req.params.quizId // Assuming req.params.quizId contains the quizId for the update condition
                ]);

                await db_connection.query('UNLOCK TABLES');
                return res.status(200).send({ "messgage": "quiz created!", "data": req.body.quizData });
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

    getCourseById: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access!" });
            }

            if (!(validator.isNumeric(req.params.courseId))) {
                return res.status(400).send({ "message": "Invalid Data." });
            }

            req.params.courseId = parseInt(req.params.courseId);

            let db_connection = await vcDb.promise().getConnection();

            try {

                // check if admin or dept head or office, roleId = 1 or 2 or 3
                await db_connection.query(`LOCK TABLES managementData m READ`);

                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData AS m WHERE managerId = ?`, [req.body.userId]);
                // console.log(roleCheck);
                if (roleCheck.length == 0 || (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3 && roleCheck[0].roleId != 4)) {
                    return res.status(400).send({ "message": "Unauthorized Access!!" });
                }


                // if admin or office, show all
                if (roleCheck[0].roleId == 1 || roleCheck[0].roleId == 3) {
                    await db_connection.query('LOCK TABLES courseFaculty f READ, courseData c READ, departmentData d READ, managementData m READ');

                    let [courseData] = await db_connection.query(`SELECT c.courseId, c.courseCode, c.courseType, c.courseName, c.courseDeptId, d.deptName, m.managerEmail, m.managerFullName FROM courseData AS c JOIN departmentData AS d ON c.courseDeptId = d.deptId JOIN managementData AS m ON c.createdBy = m.managerId WHERE c.courseId = ?`, [req.params.courseId]);

                    let [facultyData] = await db_connection.query(`SELECT f.classroomId, f.courseId, f.batchStart, f.batchEnd, f.section, f.isMentor, f.isActive, f.createdAt, f.updatedAt, f.managerId, m.managerEmail, m.managerFullName FROM courseFaculty AS f JOIN managementData AS m ON f.managerId = m.managerId WHERE f.courseId = ?`, [req.params.courseId]);

                    if (courseData.length === 0) {
                        return res.status(200).send({ "message": "No courses found.", "data": [] });
                    }

                    return res.status(200).send({
                        "message": "Fetched Successfully",
                        "data": courseData,
                        "classrooms": facultyData
                    })
                }

                // if dept head. show only respective dept courses
                if (roleCheck[0].roleId == 2) {
                    await db_connection.query('LOCK TABLES courseData c READ, departmentData d READ, managementData m READ');

                    let [courseData] = await db_connection.query(`SELECT c.courseId, c.courseCode, c.courseType, c.courseName, c.courseDeptId, d.deptName, m.managerEmail, m.managerFullName FROM courseData AS c JOIN departmentData AS d ON c.courseDeptId = d.deptId JOIN managementData AS m ON c.createdBy = m.managerId WHERE c.courseDeptId = ? AND c.courseId = ?`, [roleCheck[0].deptId, req.params.courseId]);

                    let [facultyData] = await db_connection.query(`SELECT f.classroomId, f.courseId, f.batchStart, f.batchEnd, f.section, f.isMentor, f.isActive, f.createdAt, f.updatedAt, f.managerId, m.managerEmail, m.managerFullName FROM courseFaculty AS f JOIN managementData AS m ON f.managerId = m.managerId WHERE f.courseId = ?`, [req.params.courseId]);

                    if (courseData.length === 0) {
                        return res.status(200).send({ "message": "No courses found.", "data": [] });
                    }

                    return res.status(200).send({
                        "message": "Fetched Successfully",
                        "data": courseData,
                        "classrooms": facultyData
                    })
                }

                // if professor. show only their courses
                if (roleCheck[0].roleId == 4) {
                    await db_connection.query('LOCK TABLES courseFaculty f READ, courseData c READ, departmentData d READ, managementData m READ');

                    // check if the course is assigned to the professor

                    let [checkCourse] = await db_connection.query(`SELECT courseId FROM courseFaculty WHERE courseId = ? AND managerId = ?`, [req.params.courseId, req.body.userId]);

                    if (checkCourse.length == 0) {
                        return res.status(200).send({ "message": "No courses found.", "data": [] });
                    }

                    let [courseData] = await db_connection.query(`SELECT c.courseId, c.courseCode, c.courseType, c.courseName, c.courseDeptId, d.deptName, m.managerEmail, m.managerFullName FROM courseData AS c JOIN departmentData AS d ON c.courseDeptId = d.deptId JOIN managementData AS m ON c.createdBy = m.managerId WHERE c.courseId = ?`, [req.params.courseId]);

                    let [facultyData] = await db_connection.query(`SELECT f.classroomId, f.courseId, f.batchStart, f.batchEnd, f.section, f.isMentor, f.isActive, f.createdAt, f.updatedAt, f.managerId, m.managerEmail, m.managerFullName FROM courseFaculty AS f JOIN managementData AS m ON f.managerId = m.managerId WHERE f.courseId = ? AND f.managerId = ?`, [req.params.courseId, req.body.userId]);

                    if (courseData.length == 0) {
                        return res.status(200).send({ "message": "No courses found.", "data": [] });
                    }
                    return res.status(200).send({
                        "message": "Fetched Successfully",
                        "data": courseData,
                        "classrooms": facultyData
                    })
                }
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


    updateDepartment: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            if (typeof (req.body.deptName) != 'string' || req.body.deptName.length == 0) {
                return res.status(400).send({ "message": "invalid inputs!" });
            }

            if (typeof (req.body.deptId) != 'string' || req.body.deptId.length != 1) {
                return res.status(400).send({ "message": "invalid inputs!" });
            }

            let db_connection = await vcDb.promise().getConnection();
            try {
                await db_connection.query(`LOCK TABLES managementData READ`);
                // only admin can insert departmnets
                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData WHERE managerId=?`, [req.body.userId]);
                if (roleCheck.length == 0 || roleCheck[0].roleId != 1) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }
                await db_connection.query(`LOCK TABLES departmentData WRITE`);
                [checkDepartment] = await db_connection.query(`SELECT deptName FROM departmentData WHERE deptName=? AND deptId != ?`, [req.body.deptName, req.body.deptId]);
                if (checkDepartment.length != 0) {
                    return res.status(400).send({ "message": "department already exists!" });
                }

                await db_connection.query(`UPDATE departmentData SET deptName=? WHERE deptId=?`, [req.body.deptName, req.body.deptId]);
                await db_connection.query(`UNLOCK TABLES`);
                return res.status(200).send({ "message": "sucessfully updated!" });
            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - updateDepartmentData - ${err}\n`);
                return res.status(500).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query('UNLOCK TABLES');
                db_connection.close();
                db_connection.release();
            }
        },
    ],


    registerOfficial: [
        validateToken,
        async (req, res) => {
            /*
            Admin can add Office, Dept Head and Professor
            Office can add Dept Head and Professor
            Dept Head can add Professor

            1 admin
            2 dept head
            3 office
            4 professor

            JSON
            {
                "managerEmail": "email",
                "managerFullName": "name",
                "deptId": "id",
                "roleId": "id",
            }
            */

            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            if (!(typeof (req.body.managerEmail) == 'string' && req.body.managerEmail.length > 0 && typeof (req.body.managerFullName) == 'string' && req.body.managerFullName.length > 0 && validator.isNumeric(req.body.deptId) && validator.isNumeric(req.body.roleId))) {
                return res.status(400).send({ "message": "Invalid Data." });
            }

            let db_connection = await vcDb.promise().getConnection();

            try {

                await db_connection.query(`LOCK TABLES managementData READ`);
                // only admin can insert departmnets
                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData WHERE managerId=?`, [req.body.userId]);
                if (roleCheck.length == 0) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                if (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                // check if deptId exists

                await db_connection.query(`LOCK TABLES departmentData READ`);
                let [deptCheck] = await db_connection.query(`SELECT deptId FROM departmentData WHERE deptId=?`, [req.body.deptId]);
                if (deptCheck.length == 0) {
                    await db_connection.query(`UNLOCK TABLES`);
                    return res.status(400).send({ "message": "department not exists" });
                }

                // check if managerEmail exists

                await db_connection.query(`UNLOCK TABLES`);
                await db_connection.query(`LOCK TABLES managementData READ`);
                let [managerCheck] = await db_connection.query(`SELECT managerId FROM managementData WHERE managerEmail=?`, [req.body.managerEmail]);
                if (managerCheck.length != 0) {
                    await db_connection.query(`UNLOCK TABLES`);
                    return res.status(400).send({ "message": "manager already exists" });
                }

                const newPassword = generatePassword();

                if (roleCheck[0].roleId == 1) {

                    await db_connection.query(`LOCK TABLES managementData WRITE`)
                    await db_connection.query(`INSERT INTO managementData(managerEmail,managerFullName,managerPassword,roleId,deptId,createdBy) VALUES(?,?,?,?,?,?)`, [req.body.managerEmail, req.body.managerFullName, newPassword, req.body.roleId, req.body.deptId, req.body.userId]);

                    // send email to the user
                    new_official_created(req.body.managerFullName, req.body.managerEmail, newPassword);

                    return res.status(200).send({ "message": "sucessfully registered!" });

                } else if (roleCheck[0].roleId == 2) {

                    if (req.body.roleId == 1 || req.body.roleId == 2) {
                        return res.status(400).send({ "message": "Unauthorized Access." });
                    }

                    await db_connection.query(`LOCK TABLES managementData WRITE`)
                    await db_connection.query(`INSERT INTO managementData(managerEmail,managerFullName,managerPassword,roleId,deptId,createdBy) VALUES(?,?,?,?,?,?)`, [req.body.managerEmail, req.body.managerFullName, newPassword, req.body.roleId, req.body.deptId, req.body.userId]);

                    // send email to the user
                    new_official_created(req.body.managerFullName, req.body.managerEmail, newPassword);

                    return res.status(200).send({ "message": "sucessfully registered!" });


                } else if (roleCheck[0].roleId == 3) {

                    if (req.body.roleId == 1) {
                        return res.status(400).send({ "message": "Unauthorized Access." });
                    }

                    await db_connection.query(`LOCK TABLES managementData WRITE`)
                    await db_connection.query(`INSERT INTO managementData(managerEmail,managerFullName,managerPassword,roleId,deptId,createdBy) VALUES(?,?,?,?,?,?)`, [req.body.managerEmail, req.body.managerFullName, newPassword, req.body.roleId, req.body.deptId, req.body.userId]);

                    // send email to the user
                    new_official_created(req.body.managerFullName, req.body.managerEmail, newPassword);

                    return res.status(200).send({ "message": "sucessfully registered!" });
                }


            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - registerOfficial - ${err}\n`);
                return res.status(500).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query('UNLOCK TABLES');
                db_connection.close();
                db_connection.release();
            }
        },
    ],

    getAllOfficials: [
        validateToken,
        async (req, res) => {
            /*
            Admin can view all
            Dept Head can view his dept officials
            Professor not allowed
            */

            if (req.body.userRole != 'M') {
                return res.status(401).send({ "message": "Unauthorized Access." });
            }

            let db_connection = await vcDb.promise().getConnection();

            try {

                await db_connection.query(`LOCK TABLES managementData m READ`);

                let [roleCheck] = await db_connection.query(`SELECT * FROM managementData AS m WHERE managerId = ?`, [req.body.userId]);

                if (roleCheck.length == 0) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                if (roleCheck[0].roleId != 1 && roleCheck[0].roleId != 2 && roleCheck[0].roleId != 3) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }

                if (roleCheck[0].roleId == 1) {
                    await db_connection.query(`LOCK TABLES managementData m READ, departmentData d READ`);

                    let [officialsData] = await db_connection.query(`SELECT m.managerId, m.managerEmail, m.managerFullName, m.roleId, m.deptId, d.deptName FROM managementData AS m JOIN departmentData AS d ON m.deptId = d.deptId`);

                    if (officialsData.length == 0) {
                        return res.status(200).send({ "message": "No officials found.", "data": [] });
                    }

                    return res.status(200).send({
                        "message": "Fetched Successfully",
                        "data": officialsData
                    })

                } else if (roleCheck[0].roleId == 2) {
                    await db_connection.query(`LOCK TABLES managementData m READ, departmentData d READ`);

                    let [officialsData] = await db_connection.query(`SELECT m.managerId, m.managerEmail, m.managerFullName, m.roleId, m.deptId, d.deptName FROM managementData AS m JOIN departmentData AS d ON m.deptId = d.deptId WHERE m.deptId = ?`, [roleCheck[0].deptId]);

                    if (officialsData.length == 0) {
                        return res.status(200).send({ "message": "No officials found.", "data": [] });
                    }

                    return res.status(200).send({
                        "message": "Fetched Successfully",
                        "data": officialsData
                    })
                } else if (roleCheck[0].roleId == 3) {
                    return res.status(400).send({ "message": "Unauthorized Access." });
                }


            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - getAllOfficials - ${err}\n`);
                return res.status(500).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query('UNLOCK TABLES');
                db_connection.close();
                db_connection.release();
            }

        }
    ],
}

module.exports = adminController;