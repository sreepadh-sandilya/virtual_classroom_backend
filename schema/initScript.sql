DROP TABLE IF EXISTS assignmentSubmission;
DROP TABLE IF EXISTS assignmentData;
DROP TABLE IF EXISTS quizSubmission;
DROP TABLE IF EXISTS quizData;
DROP TABLE IF EXISTS attendanceData;
DROP TABLE IF EXISTS classRoomData;
DROP TABLE IF EXISTS studentCourse;
DROP TABLE IF EXISTS courseFaculty;
DROP TABLE IF EXISTS courseData;
DROP TABLE IF EXISTS forgotPasswordManagement;
DROP TABLE IF EXISTS forgotPasswordStudent;
DROP TABLE IF EXISTS studentData;
DROP TABLE IF EXISTS managementData;
DROP TABLE IF EXISTS departmentData;
DROP TABLE IF EXISTS userRole;

CREATE TABLE IF NOT EXISTS userRole (
    roleId INT PRIMARY KEY AUTO_INCREMENT,
    roleName VARCHAR(255) NOT NULL
);

INSERT INTO userRole (roleName) VALUES ('ADMIN');
INSERT INTO userRole (roleName) VALUES ('DEPT_HEAD');
INSERT INTO userRole (roleName) VALUES ('OFFICE');
INSERT INTO userRole (roleName) VALUES ('PROFESSOR');

CREATE TABLE IF NOT EXISTS departmentData (
    deptId INT PRIMARY KEY AUTO_INCREMENT,
    deptName VARCHAR(255) NOT NULL
);

INSERT INTO departmentData (deptName) VALUES ('CSE');
INSERT INTO departmentData (deptName) VALUES ('AIE');
INSERT INTO departmentData (deptName) VALUES ('CYS');

CREATE TABLE IF NOT EXISTS managementData (
    managerId INT PRIMARY KEY AUTO_INCREMENT,
    managerEmail VARCHAR(255) NOT NULL UNIQUE,
    managerPassword VARCHAR(255) NOT NULL,
    deptId INT NOT NULL,
    roleId INT NOT NULL,
    managerFullName VARCHAR(255),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdBy INT NULL,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    managerStatus CHAR(1) DEFAULT '1',
    FOREIGN KEY (deptId) REFERENCES departmentData(deptId),
    FOREIGN KEY (roleId) REFERENCES userRole(roleId),
    FOREIGN KEY (createdBy) REFERENCES managementData(managerId)
);

-- ADMIN
INSERT INTO managementData (managerEmail, managerPassword, deptId, roleId, managerFullName) VALUES ('hsheadone@gmail.com', 'hsheadone', 1, 1, 'A S Sreepadh');

-- SAMPLE DEPT HEAD
INSERT INTO managementData (managerEmail, managerPassword, deptId, roleId, managerFullName) VALUES ('shettyajoy@gmail.com', 'shettyajoy', 1, 2, 'Ajoy Shetty'); 

-- SAMPLE OFFICE
INSERT INTO managementData (managerEmail, managerPassword, deptId, roleId, managerFullName) VALUES ('21f3001600@ds.study.iitm.ac.in', '21f3001600', 1, 3, 'CSE Office');

-- SAMPLE PROFESSOR
INSERT INTO managementData (managerEmail, managerPassword, deptId, roleId, managerFullName) VALUES ('ashrockzzz2003@gmail.com', 'ashrockzzz2003', 1, 4, 'Ashwin Narayanan S');


CREATE TABLE IF NOT EXISTS studentData (
    studentId INT PRIMARY KEY AUTO_INCREMENT,
    studentName VARCHAR(255) NOT NULL,
    studentRollNumber VARCHAR(50) UNIQUE NOT NULL,
    studentGender CHAR(1) NOT NULL DEFAULT 'N', -- 'M' or 'F' or 'N'
    studentPhone CHAR(10) NOT NULL,
    studentEmail VARCHAR(255) UNIQUE NOT NULL,
    studentPassword VARCHAR(255) NOT NULL,
    studentDob CHAR(10) NOT NULL,
    studentDeptId INT NOT NULL,
    studentSection CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'... etc
    studentBatchStart CHAR(4) NOT NULL, -- 2021
    studentBatchEnd CHAR(4) NOT NULL, -- 2025
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdBy INT NULL,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    studentStatus CHAR(1) NOT NULL DEFAULT '1',
    FOREIGN KEY (studentDeptId) REFERENCES departmentData(deptId),
    FOREIGN KEY (createdBy) REFERENCES managementData(managerId)
);

-- SAMPLE STUDENT

INSERT INTO studentData (studentName, studentRollNumber, studentGender, studentPhone, studentEmail, studentPassword, studentDob, studentDeptId, studentSection, studentBatchStart, studentBatchEnd) VALUES ('Ashwin Narayanan S', 'CB.EN.U4CSE21008', 'M', '8870014773', 'cb.en.u4cse21008@cb.students.amrita.edu', 'cb.en.u4cse21008', '2003-10-13', 1, 'A', '2021', '2025');
INSERT INTO studentData (studentName, studentRollNumber, studentGender, studentPhone, studentEmail, studentPassword, studentDob, studentDeptId, studentSection, studentBatchStart, studentBatchEnd) VALUES ('Ananya R', 'CB.EN.U4CSE21006', 'F', '6361737009', 'cb.en.u4cse21006@cb.students.amrita.edu', 'cb.en.u4cse21006', '2003-10-16', 1, 'A', '2021', '2025');
INSERT INTO studentData (studentName, studentRollNumber, studentGender, studentPhone, studentEmail, studentPassword, studentDob, studentDeptId, studentSection, studentBatchStart, studentBatchEnd) VALUES ('A S Sreepadh', 'CB.EN.U4CSE21009', 'M', '9896893224', 'cb.en.u4cse21009@cb.students.amrita.edu', 'cb.en.u4cse21009', '2003-10-15', 1, 'A', '2021', '2025');
INSERT INTO studentData (studentName, studentRollNumber, studentGender, studentPhone, studentEmail, studentPassword, studentDob, studentDeptId, studentSection, studentBatchStart, studentBatchEnd) VALUES ('Arjun P', 'CB.EN.U4CSE21007', 'M', '8921228979', 'cb.en.u4cse21007@cb.students.amrita.edu', 'cb.en.u4cse21007', '2003-10-14', 1, 'A', '2021', '2025');
INSERT INTO studentData (studentName, studentRollNumber, studentGender, studentPhone, studentEmail, studentPassword, studentDob, studentDeptId, studentSection, studentBatchStart, studentBatchEnd) VALUES ('Hirthick Raj', 'CB.EN.U4CSE21023', 'M', '9600801391', 'cb.en.u4cse21023@cb.students.amrita.edu', 'cb.en.u4cse21023', '2003-10-17', 1, 'A', '2021', '2025');

CREATE TABLE IF NOT EXISTS forgotPasswordStudent (
    studentId INT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expiresAt TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 5 MINUTE),
    FOREIGN KEY (studentId) REFERENCES studentData(studentId)
);

CREATE TABLE IF NOT EXISTS forgotPasswordManagement (
    managerId INT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expiresAt TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 5 MINUTE),
    FOREIGN KEY (managerId) REFERENCES managementData(managerId)
);

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
INSERT INTO courseData(courseCode,courseName,courseDeptId,createdBy,courseStatus,courseType,updatedBy) VALUES('19CSE301','dsa',1,1,'1','1',1);
INSERT INTO courseData(courseCode,courseName,courseDeptId,createdBy,courseStatus,courseType,updatedBy) VALUES('19CSE302','daa',1,1,'1','1',1);

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
INSERT INTO courseFaculty(courseId,managerId,batchStart,batchEnd,section,createdBy,updatedBy) VALUES(1,1,'2021','2025','A',1,1);
INSERT INTO courseFaculty(courseId,managerId,batchStart,batchEnd,section,createdBy,updatedBy) VALUES(2,4,'2021','2025','A',1,1);

-- Below table meant only for electives
CREATE TABLE IF NOT EXISTS studentCourse(
    studentId INT NOT NULL,
    classroomId INT NOT NULL,
    FOREIGN KEY (studentId) REFERENCES studentData(studentId),
    FOREIGN KEY (classroomId) REFERENCES courseFaculty(classroomId)
);

CREATE TABLE IF NOT EXISTS classRoomData (
    classId INT PRIMARY KEY AUTO_INCREMENT,
    classroomId INT NOT NULL,
    classStartTime TIMESTAMP NOT NULL,
    classEndTime TIMESTAMP NOT NULL,
    classLink VARCHAR(255) NOT NULL,
    classStatus CHAR(1) NOT NULL DEFAULT '1',
    FOREIGN KEY (classroomId) REFERENCES courseFaculty(classroomId)
);
INSERT INTO classRoomData(classroomId,classStartTime,classEndTime,classLink) VALUES(1,'2024-05-26T11:02:00','2024-05-29T11:02:00',"stackoverflow.com/questions/12422918/how-to-validate-timestamp-in-javascript");



CREATE TABLE IF NOT EXISTS attendanceData (
    classId INT NOT NULL,
    studentId INT NOT NULL,
    isPresent CHAR(1) NOT NULL DEFAULT '0',
    FOREIGN KEY (classId) REFERENCES classRoomData(classId),
    FOREIGN KEY (studentId) REFERENCES studentData(studentId)
);

CREATE TABLE IF NOT EXISTS quizData (
    quizId INT PRIMARY KEY AUTO_INCREMENT,
    classroomId INT NOT NULL,
    quizName VARCHAR(255) NOT NULL,
    quizDescription LONGTEXT NOT NULL,
    quizData JSON NOT NULL,
    isOpenForAll CHAR(1) NOT NULL DEFAULT '0',
    startTime TIMESTAMP NOT NULL,
    endTime TIMESTAMP NOT NULL,
    duration VARCHAR(20) NULL, -- Format: 00:00:00:00
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdBy INT NOT NULL,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updatedBy INT NOT NULL,
    FOREIGN KEY (classroomId) REFERENCES courseFaculty(classroomId),
    FOREIGN KEY (createdBy) REFERENCES managementData(managerId),
    FOREIGN KEY (updatedBy) REFERENCES managementData(managerId) 
);

CREATE TABLE IF NOT EXISTS quizSubmission (
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

CREATE TABLE IF NOT EXISTS assignmentData (
    assignmentId INT PRIMARY KEY AUTO_INCREMENT,
    classroomId INT NOT NULL,
    assignmentName VARCHAR(255) NOT NULL,
    assignmentDescription LONGTEXT NOT NULL,
    isOpenToAll CHAR(1) NOT NULL DEFAULT '0',
    startTime TIMESTAMP NOT NULL,
    endTime TIMESTAMP NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdBy INT NOT NULL,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updatedBy INT NOT NULL,
    FOREIGN KEY (classroomId) REFERENCES courseFaculty(classroomId),
    FOREIGN KEY (createdBy) REFERENCES managementData(managerId),
    FOREIGN KEY (updatedBy) REFERENCES managementData(managerId)
);

CREATE TABLE IF NOT EXISTS assignmentSubmission (
    assignmentSubmissionId INT PRIMARY KEY AUTO_INCREMENT,
    assignmentId INT NOT NULL,
    studentId INT NOT NULL,
    marks INT NULL,
    isPublished CHAR(1) NOT NULL DEFAULT '0',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdBy INT NOT NULL,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updatedBy INT NOT NULL,
    FOREIGN KEY (assignmentId) REFERENCES assignmentData(assignmentId),
    FOREIGN KEY (studentId) REFERENCES studentData(studentId),
    FOREIGN KEY (createdBy) REFERENCES managementData(managerId),
    FOREIGN KEY (updatedBy) REFERENCES managementData(managerId)
);
