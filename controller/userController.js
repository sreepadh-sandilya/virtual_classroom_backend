const vcDb = require('../connection/poolConnection');

const validator = require('validator');
const validateToken = require('../middleware/login/tokenValidator');
const fs = require('fs');
const { getQuizById } = require('./adminController');

const userController = {
    testConnection: async (req, res) => {
        return res.status(200).send({
            "message": "User is up. 👍🏻",
            "WHO": "User"
        });
    },


    getAllDepartments: async (req, res) => {
        const db_connection = await vcDb.promise().getConnection();


        try {

            await db_connection.query(`LOCK TABLES departmentData READ`);

            const [rows] = await db_connection.query(`SELECT * FROM departmentData`);

            await db_connection.query(`UNLOCK TABLES`);

            return res.status(200).send({
                "message": "Departments fetched successfully.",
                "data": rows
            });

        } catch (err) {
            console.log(err);
            const time = new Date();
            fs.appendFileSync('logs/user.log', `${time.toISOString()} - getAllDepartments - ${err}\n`);
            return res.status(400).send({ "message": "Internal Server Error." });
        } finally {
            await db_connection.query(`UNLOCK TABLES`);
            db_connection.release();
        }
    },

    getDepartmentById: async (req, res) => {
        const db_connection = await vcDb.promise().getConnection();

        if (!validator.isNumeric(req.params.deptId)) {
            return res.status(400).send({
                "message": "Invalid Department ID."
            });
        }

        try {

            req.params.deptId = parseInt(req.params.deptId);

            await db_connection.query(`LOCK TABLES departmentData READ`);

            const [rows] = await db_connection.query(`SELECT * FROM departmentData WHERE deptId = ?`, [req.params.deptId]);

            await db_connection.query(`UNLOCK TABLES`);

            return res.status(200).send({
                "message": "Departments fetched successfully.",
                "data": rows
            });

        } catch (err) {
            console.log(err);
            const time = new Date();
            fs.appendFileSync('logs/user.log', `${time.toISOString()} - getAllDepartments - ${err}\n`);
            return res.status(400).send({ "message": "Internal Server Error." });
        } finally {
            await db_connection.query(`UNLOCK TABLES`);
            db_connection.release();
        }
    },


    getAvailableCoursesToRegister: [
        validateToken,
        async (req, res) => {
            const db_connection = await vcDb.promise().getConnection();

            if (req.body.userRole != 'S') {
                return res.status(401).send({
                    "message": "Unauthorized Access."
                });
            }

            try {

                await db_connection.query(`LOCK TABLES studentData READ`);

                const [rows] = await db_connection.query(`SELECT * FROM studentData WHERE studentId = ?`, [req.body.userId]);

                if (rows.length == 0) {
                    return res.status(400).send({
                        "message": "Student not found."
                    });
                }

                const student = rows[0];

                /*
                CREATE TABLE IF NOT EXISTS courseData (
                    courseId INT PRIMARY KEY AUTO_INCREMENT,
                    courseCode VARCHAR(20) UNIQUE NOT NULL,
                    courseName VARCHAR(255) NOT NULL,
                    courseDeptId INT NOT NULL,
                    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    createdBy INT NOT NULL,
                    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    courseStatus CHAR(1) NOT NULL DEFAULT '1',
                    courseType CHAR(1) NOT NULL DEFAULT '1', -- 1: Regular, 2: Non-Professional Elective, 3: Professional Elective
                    updatedBy INT NOT NULL,
                    FOREIGN KEY (courseDeptId) REFERENCES departmentData(deptId),
                    FOREIGN KEY (createdBy) REFERENCES managementData(managerId),
                    FOREIGN KEY (updatedBy) REFERENCES managementData(managerId)
                );
                                CREATE TABLE IF NOT EXISTS courseFaculty (
                    classroomId INT PRIMARY KEY AUTO_INCREMENT,
                    courseId INT NOT NULL,
                    managerId INT NOT NULL,
                    batchStart CHAR(4) NOT NULL, -- 2021
                    batchEnd CHAR(4) NOT NULL, -- 2025
                    section CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'... etc
                    isMentor CHAR(1) NOT NULL DEFAULT '0',
                    isActive CHAR(1) NOT NULL DEFAULT '1',
                    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    createdBy INT NOT NULL,
                    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    updatedBy INT NOT NULL,
                    FOREIGN KEY (courseId) REFERENCES courseData(courseId),
                    FOREIGN KEY (managerId) REFERENCES managementData(managerId),
                    FOREIGN KEY (createdBy) REFERENCES managementData(managerId),
                    FOREIGN KEY (updatedBy) REFERENCES managementData(managerId)
                ); 
                CREATE TABLE IF NOT EXISTS studentCourse(
                    studentId INT NOT NULL,
                    classroomId INT NOT NULL,
                    FOREIGN KEY (studentId) REFERENCES studentData(studentId),
                    FOREIGN KEY (classroomId) REFERENCES courseFaculty(classroomId)
                );
                */

                // JOIN courseFaculty with courseData where section, batchStart, batchEnd is
                // same as student's section, batchStart, batchEnd
                // JOIN managementData with courseFaculty where managerId is same as managerId 

                await db_connection.query(`LOCK TABLES courseData c READ, courseFaculty f READ, managementData m READ, studentCourse s READ`);

                const [courseData] = await db_connection.query(`SELECT c.courseId, c.courseCode, c.courseName, c.courseDeptId, c.courseType, f.classroomId, f.batchStart, f.batchEnd, f.section, f.isMentor, m.managerId, m.managerFullName, m.managerEmail FROM courseData c JOIN courseFaculty f ON c.courseId = f.courseId JOIN managementData m ON f.managerId = m.managerId WHERE f.section = ? AND f.batchStart = ? AND f.batchEnd = ? AND f.isActive = '1' AND f.isMentor = '0'`, [student.studentSection, student.studentBatchStart, student.studentBatchEnd]);

                const [studentCourses] = await db_connection.query(`SELECT classroomId FROM studentCourse AS s WHERE studentId = ?`, [student.studentId]);

                await db_connection.query(`UNLOCK TABLES`);

                let courseDataFiltered = courseData.filter((course) => {
                    return !studentCourses.some((studentCourse) => studentCourse.classroomId == course.classroomId);
                });

                return res.status(200).send({
                    "message": "Courses fetched successfully.",
                    "data": courseDataFiltered
                });

            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/user.log', `${time.toISOString()} - getAvailableCoursesToRegister - ${err}\n`);
                return res.status(400).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.close()
                db_connection.release();
            }
        }
    ],


    getMyCourses: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'S') {
                return res.status(401).send({
                    "message": "Unauthorized Access."
                });
            }

            const db_connection = await vcDb.promise().getConnection();

            try {

                await db_connection.query(`LOCK TABLES studentData READ`);

                const [rows] = await db_connection.query(`SELECT * FROM studentData WHERE studentId = ?`, [req.body.userId]);

                if (rows.length == 0) {
                    return res.status(400).send({
                        "message": "Student not found."
                    });
                }

                const student = rows[0];

                await db_connection.query(`LOCK TABLES courseData c READ, courseFaculty f READ, managementData m READ, studentCourse s READ`);

                const [courseData] = await db_connection.query(`SELECT c.courseId, c.courseCode, c.courseName, c.courseDeptId, c.courseType, f.classroomId, f.batchStart, f.batchEnd, f.section, f.isMentor, m.managerId, m.managerFullName, m.managerEmail FROM courseData c JOIN courseFaculty f ON c.courseId = f.courseId JOIN managementData m ON f.managerId = m.managerId JOIN studentCourse s ON f.classroomId = s.classroomId WHERE s.studentId = ?`, [student.studentId]);

                await db_connection.query(`UNLOCK TABLES`);


                return res.status(200).send({
                    "message": "Courses fetched successfully.",
                    "data": courseData
                });

            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/user.log', `${time.toISOString()} - getMyCourses - ${err}\n`);
                return res.status(400).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.close()
                db_connection.release();
            }
        }
    ],


    registerToCourse: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'S') {
                return res.status(401).send({
                    "message": "Unauthorized Access."
                });
            }

            // console.log(req.body)

            const db_connection = await vcDb.promise().getConnection();

            try {

                await db_connection.query(`LOCK TABLES studentData READ`);

                const [rows] = await db_connection.query(`SELECT * FROM studentData WHERE studentId = ?`, [req.body.userId]);

                if (rows.length == 0) {
                    return res.status(400).send({
                        "message": "Student not found."
                    });
                }

                const student = rows[0];

                if (!validator.isNumeric(req.body.classroomId.toString())) {
                    return res.status(400).send({
                        "message": "Invalid Classroom ID."
                    });
                }

                await db_connection.query(`LOCK TABLES courseFaculty f READ, studentCourse s WRITE`);

                const [courseFaculty] = await db_connection.query(`SELECT * FROM courseFaculty AS f WHERE classroomId = ?`, [req.body.classroomId]);

                if (courseFaculty.length == 0) {
                    return res.status(400).send({
                        "message": "Course not found."
                    });
                }

                const [studentCourse] = await db_connection.query(`SELECT * FROM studentCourse s WHERE studentId = ? AND classroomId = ?`, [student.studentId, req.body.classroomId]);

                if (studentCourse.length > 0) {
                    return res.status(400).send({
                        "message": "Already registered to this course."
                    });
                }

                // check eligibility with student's section, batchStart, batchEnd

                if (student.studentSection != courseFaculty[0].section || student.studentBatchStart != courseFaculty[0].batchStart || student.studentBatchEnd != courseFaculty[0].batchEnd) {
                    return res.status(400).send({
                        "message": "Not eligible to register to this course."
                    });
                }

                await db_connection.query(`LOCK TABLES studentCourse WRITE`);

                await db_connection.query(`INSERT INTO studentCourse (studentId, classroomId) VALUES (?, ?)`, [student.studentId, req.body.classroomId]);

                await db_connection.query(`UNLOCK TABLES`);

                return res.status(200).send({
                    "message": "Registered to course successfully."
                });

            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/user.log', `${time.toISOString()} - registerToCourse - ${err}\n`);
                return res.status(400).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.close()
                db_connection.release();
            }
        }
    ],

    getClass: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'S') {
                return res.status(401).send({
                    "message": "Unauthorized Access."
                });
            }

            if (!validator.isNumeric(req.body.classroomId.toString())) {
                return res.status(400).send({
                    "message": "Invalid Classroom ID."
                });
            }


            const db_connection = await vcDb.promise().getConnection();

            try {

                await db_connection.query(`LOCK TABLES studentData READ`);

                const [rows] = await db_connection.query(`SELECT * FROM studentData WHERE studentId = ?`, [req.body.userId]);

                if (rows.length == 0) {
                    return res.status(400).send({
                        "message": "Student not found."
                    });
                }

                const student = rows[0];

                // check if student has registered to this course

                await db_connection.query(`LOCK TABLES studentCourse s READ`);

                const [studentCourse] = await db_connection.query(`SELECT * FROM studentCourse s WHERE studentId = ? AND classroomId = ?`, [student.studentId, req.body.classroomId]);

                if (studentCourse.length == 0) {
                    return res.status(400).send({
                        "message": "Not registered to this course."
                    });
                }

                // Join courseFaculty, courseData, managementData

                await db_connection.query(`LOCK TABLES courseFaculty f READ, courseData c READ, managementData m READ`);

                let [classData] = await db_connection.query(`SELECT f.classroomId, f.courseId, f.managerId, f.batchStart, f.batchEnd, f.section, f.isMentor, f.isActive, f.createdAt, f.updatedAt, c.courseCode, c.courseType, c.courseName, m.managerEmail, m.managerFullName FROM courseFaculty AS f JOIN courseData AS c ON f.courseId = c.courseId JOIN managementData AS m ON f.managerId = m.managerId WHERE f.classroomId = ?`, [req.body.classroomId]);

                if (classData.length == 0) {
                    return res.status(400).send({ "message": "No class found.", });
                }


                // query classRoomData table

                await db_connection.query(`LOCK TABLES classRoomData READ, quizData READ`);

                let [classRoomData] = await db_connection.query(`SELECT * FROM classRoomData WHERE classroomId = ?`, [req.body.classroomId]);

                if (classRoomData.length == 0) {
                    classRoomData = [];
                }

                let [quizData] = await db_connection.query(`SELECT * FROM quizData WHERE classroomId = ?`, [req.body.classroomId]);

                if (quizData.length == 0) {
                    quizData = [];
                }

                return res.status(200).send({
                    "message": "Fetched Successfully",
                    "data": classData,
                    "classRoomData": classRoomData,
                    "quizData": quizData
                });
            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/user.log', `${time.toISOString()} - getClass - ${err}\n`);
                return res.status(400).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.close()
                db_connection.release();
            }
        }
    ],


    getQuizById: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'S') {
                return res.status(401).send({
                    "message": "Unauthorized Access."
                });
            }

            if (!validator.isNumeric(req.body.quizId.toString())) {
                return res.status(400).send({
                    "message": "Invalid Quiz ID."
                });
            }

            const db_connection = await vcDb.promise().getConnection();

            try {

                await db_connection.query(`LOCK TABLES studentData READ`);

                const [rows] = await db_connection.query(`SELECT * FROM studentData WHERE studentId = ?`, [req.body.userId]);

                if (rows.length == 0) {
                    return res.status(400).send({
                        "message": "Student not found."
                    });
                }

                const student = rows[0];

                // check if student has registered to this course

                await db_connection.query(`LOCK TABLES studentCourse s READ`);

                const [studentCourse] = await db_connection.query(`SELECT * FROM studentCourse s WHERE studentId = ? AND classroomId = ?`, [student.studentId, req.body.classroomId]);

                if (studentCourse.length == 0) {
                    return res.status(400).send({
                        "message": "Not registered to this course."
                    });
                }

                // Join courseFaculty, courseData, managementData

                await db_connection.query(`LOCK TABLES courseFaculty f READ, courseData c READ, managementData m READ`);

                let [classData] = await db_connection.query(`SELECT f.classroomId, f.courseId, f.managerId, f.batchStart, f.batchEnd, f.section, f.isMentor, f.isActive, f.createdAt, f.updatedAt, c.courseCode, c.courseType, c.courseName, m.managerEmail, m.managerFullName FROM courseFaculty AS f JOIN courseData AS c ON f.courseId = c.courseId JOIN managementData AS m ON f.managerId = m.managerId WHERE f.classroomId = ?`, [req.body.classroomId]);

                if (classData.length == 0) {
                    return res.status(400).send({ "message": "No class found.", });
                }

                // query quizData table

                await db_connection.query(`LOCK TABLES quizData READ`);

                let [quizData] = await db_connection.query(`SELECT * FROM quizData WHERE quizId = ?`, [req.body.quizId]);

                if (quizData.length == 0) {

                    return res.status(400).send({
                        "message": "Quiz not found."
                    });
                }

                if (quizData[0]["quizData"] == null) {
                    quizData[0]["quizData"] = [];
                }

                for (let i = 0; i < quizData[0]["quizData"].length; i++) {
                    // console.log(quizData[0]["quizData"][i]);

                    if (quizData[0]["quizData"][i]["type"] == 'mcq' || quizData[0]["quizData"][i]["type"] == 'mcq_multiple') {
                        quizData[0]["quizData"][i] = {
                            "type": quizData[0]["quizData"][i]["type"],
                            "marks": quizData[0]["quizData"][i]["marks"],
                            "question": quizData[0]["quizData"][i]["question"],
                            "options": quizData[0]["quizData"][i]["options"]
                        }
                    } else {
                        quizData[0]["quizData"][i] = {
                            "type": quizData[0]["quizData"][i]["type"],
                            "marks": quizData[0]["quizData"][i]["marks"],
                            "question": quizData[0]["quizData"][i]["question"]
                        }
                    }
                }

                return res.status(200).send({
                    "message": "Fetched Successfully",
                    "data": quizData
                });

            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/user.log', `${time.toISOString()} - getQuizById - ${err}\n`);
                return res.status(400).send({ "message": "Internal Server Error." });
            }
        }
    ],

    /**
     *CREATE TABLE IF NOT EXISTS quizSubmission (
            quizSubmissionId INT PRIMARY KEY AUTO_INCREMENT,
            quizId INT NOT NULL,
            quizSubmissionData JSON NOT NULL,
            studentId INT NOT NULL,
            marks INT NULL,
            isPublished CHAR(1) NOT NULL DEFAULT '0',
            createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            createdBy INT NOT NULL,
            updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            updatedBy INT NOT NULL,
            FOREIGN KEY (quizId) REFERENCES quizData(quizId),
            FOREIGN KEY (studentId) REFERENCES studentData(studentId),
            FOREIGN KEY (createdBy) REFERENCES managementData(managerId),
            FOREIGN KEY (updatedBy) REFERENCES managementData(managerId)
        );
     */

    submitQuiz: [
        validateToken,
        async (req, res) => {
            if (req.body.userRole != 'S') {
                return res.status(401).send({
                    "message": "Unauthorized Access."
                });
            }

            if (!validator.isNumeric(req.body.quizId.toString())) {
                return res.status(400).send({
                    "message": "Invalid Quiz ID."
                });
            }
            
            if (!Array.isArray(req.body.quizSubmissionData)) {
                return res.status(400).send({
                    "message": "Invalid Quiz Submission Data."
                });
            }

            const db_connection = await vcDb.promise().getConnection();

            try {

                await db_connection.query(`LOCK TABLES studentData READ`);

                const [rows] = await db_connection.query(`SELECT * FROM studentData WHERE studentId = ?`, [req.body.userId]);

                if (rows.length == 0) {
                    return res.status(400).send({
                        "message": "Student not found."
                    });
                }

                const student = rows[0];

                // check if student has registered to this course

                await db_connection.query(`LOCK TABLES studentCourse s READ`);

                const [studentCourse] = await db_connection.query(`SELECT * FROM studentCourse s WHERE studentId = ? AND classroomId = ?`, [student.studentId, req.body.classroomId]);

                if (studentCourse.length == 0) {
                    return res.status(400).send({
                        "message": "Not registered to this course."
                    });
                }

                // Check if student has already submitted the quiz

                await db_connection.query(`LOCK TABLES quizSubmission READ`);

                const [quizSubmission] = await db_connection.query(`SELECT * FROM quizSubmission WHERE studentId = ? AND quizId = ?`, [student.studentId, req.body.quizId]);

                if (quizSubmission.length > 0) {
                    return res.status(400).send({
                        "message": "Quiz already submitted."
                    });
                }

                // Join courseFaculty, courseData, managementData

                await db_connection.query(`LOCK TABLES courseFaculty f READ, courseData c READ, managementData m READ`);

                let [classData] = await db_connection.query(`SELECT f.classroomId, f.courseId, f.managerId, f.batchStart, f.batchEnd, f.section, f.isMentor, f.isActive, f.createdAt, f.updatedAt, c.courseCode, c.courseType, c.courseName, m.managerEmail, m.managerFullName FROM courseFaculty AS f JOIN courseData AS c ON f.courseId = c.courseId JOIN managementData AS m ON f.managerId = m.managerId WHERE f.classroomId = ?`, [req.body.classroomId]);

                if (classData.length == 0) {
                    return res.status(400).send({ "message": "No class found.", });
                }

                // query quizData table

                await db_connection.query(`LOCK TABLES quizData READ`);

                let [quizData] = await db_connection.query(`SELECT * FROM quizData WHERE quizId = ?`, [req.body.quizId]);

                if (quizData.length == 0) {

                    return res.status(400).send({
                        "message": "Quiz not found."
                    });
                }

                if (quizData[0]["quizData"] == null) {
                    quizData[0]["quizData"] = [];
                }

                // quizSubmissionData: Array of JSON with {"answer": "string" if type is fill_in or mcq, "answer": ["string", "string"] if type is mcq_multiple

                let marks = 0;

                for (let i = 0; i < quizData[0]["quizData"].length; i++) {
                    if (quizData[0]["quizData"][i]["type"] == 'fill_in') {
                        if (req.body.quizSubmissionData[i]["answer"].toLowerCase() == quizData[0]["quizData"][i]["correct_answer"].toLowerCase()) {
                            marks += parseInt(quizData[0]["quizData"][i]["marks"]);
                        }
                    } else if (quizData[0]["quizData"][i]["type"] == 'mcq') {
                        if (req.body.quizSubmissionData[i]["answer"].toLowerCase() == quizData[0]["quizData"][i]["correct_option"].toLowerCase()) {
                            marks += parseInt(quizData[0]["quizData"][i]["marks"]);
                        }
                    } else if (quizData[0]["quizData"][i]["type"] == 'mcq_multiple') {
                        let correct = true;
                        for (let j = 0; j < req.body.quizSubmissionData[i]["answer"].length; j++) {
                            if (!quizData[0]["quizData"][i]["correct_options"].includes(req.body.quizSubmissionData[i]["answer"][j].toLowerCase())) {
                                correct = false;
                                break;
                            }
                        }
                        if (correct) {
                            marks += parseInt(quizData[0]["quizData"][i]["marks"]);
                        }
                    }
                }

                await db_connection.query(`LOCK TABLES quizSubmission WRITE`);

                await db_connection.query(`INSERT INTO quizSubmission (quizId, quizSubmissionData, studentId, marks, createdBy, updatedBy) VALUES (?, ?, ?, ?, ?, ?)`, [req.body.quizId, JSON.stringify(req.body.quizSubmissionData), student.studentId, marks, student.studentId, student.studentId]);

                await db_connection.query(`UNLOCK TABLES`);

                return res.status(200).send({
                    "message": "Quiz Submitted Successfully.",
                    "marks": marks
                });

            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/user.log', `${time.toISOString()} - submitQuiz - ${err}\n`);
                return res.status(400).send({ "message": "Internal Server Error." });
            } finally {
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.close()
                db_connection.release();
            }


        }
    ],
}

module.exports = userController;