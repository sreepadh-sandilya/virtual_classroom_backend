CREATE TABLE IF NOT EXISTS userRole (
    roleId INT PRIMARY KEY AUTO_INCREMENT,
    roleName VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS course (
    courseId INT PRIMARY KEY AUTO_INCREMENT,
    courseCode VARCHAR(20) NOT NULL,
    courseName VARCHAR(255) NOT NULL,
    courseDept VARCHAR(100),
    createdBy INT,
    FOREIGN KEY (courseDept) REFERENCES departmentData(deptName),
    FOREIGN KEY (createdBy) REFERENCES managementData(managerId)
);

CREATE TABLE IF NOT EXISTS studentData (
    studentId INT PRIMARY KEY AUTO_INCREMENT,
    studentName VARCHAR(255) NOT NULL,
    studentRollNumber VARCHAR(50) NOT NULL,
    studentGender VARCHAR(10) NOT NULL,
    studentPhone VARCHAR(20) NOT NULL,
    studentEmail VARCHAR(255) NOT NULL,
    studentPassword VARCHAR(255) NOT NULL,
    studentDob DATE NOT NULL,
    studentDeptId INT NOT NULL,
    studentSection VARCHAR(20) NOT NULL,
    studentBatch INT NOT NULL,
    createdBy INT NOT NULL,
    studentStatus BOOLEAN NOT NULL
    FOREIGN KEY (studentDeptId) REFERENCES departmentData(deptId),
    FOREIGN KEY (createdBy) REFERENCES managementData(managerId),
    
);

CREATE TABLE IF NOT EXISTS departmentData (
    deptId INT PRIMARY KEY AUTO_INCREMENT,
    deptName VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS managementData (
    managerId INT PRIMARY KEY AUTO_INCREMENT,
    managerEmail VARCHAR(255) NOT NULL,
    managerPassword VARCHAR(255) NOT NULL,
    deptId INT,
    managementRollId INT,
    managerFullName VARCHAR(255),
    createdBy INT,
    managerStatus VARCHAR(1) DEFAULT '1',
    FOREIGN KEY (deptId) REFERENCES departmentData(deptId),
    FOREIGN KEY (createdBy) REFERENCES userRole(roleId),
);

CREATE TABLE IF NOT EXISTS assignment (
    assignmentId INT PRIMARY KEY AUTO_INCREMENT,
    courseId INT NOT NULL,
    isOpentoAll BOOLEAN NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    FOREIGN KEY (courseId) REFERENCES course(courseId)
);

CREATE TABLE IF NOT EXISTS courseFaculty (
    courseFacultyid INT PRIMARY KEY AUTO_INCREMENT,
    courseId INT,
    managerID INT,
    batch INT,

    section VARCHAR(1),
    isMentor BOOLEAN,
    isActive BOOLEAN,
    FOREIGN KEY (courseId) REFERENCES course(courseId),
    FOREIGN KEY (managerId) REFERENCES managementData(managerid)
);

CREATE TABLE IF NOT EXISTS quiz (
    quizId INT PRIMARY KEY AUTO_INCREMENT,
    courseFacultyid INT NOT NULL,
    isOpenForAll BOOLEAN NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    duration INT NOT NULL,
    FOREIGN KEY (courseFacultyid) REFERENCES courseFaculty(courseFacultyid)
);

CREATE TABLE IF NOT EXISTS quizSubmission (
    quizSubmission_id INT PRIMARY KEY AUTO_INCREMENT,
    quizId INT NOT NULL,
    studentId INT NOT NULL,
    marks DECIMAL(10, 2),
    time DATETIME NOT NULL,
    FOREIGN KEY (quizId) REFERENCES quiz(quizId),
    FOREIGN KEY (studentId) REFERENCES studentData(studentId)
);

CREATE TABLE IF NOT EXISTS quizResponse (
    quizResponseId INT PRIMARY KEY AUTO_INCREMENT,
    quizId INT,
    responseData JSON,
    FOREIGN KEY (quizId) REFERENCES quiz(quizId)
);

CREATE TABLE IF NOT EXISTS quizQuestion (
    questionId INT PRIMARY KEY AUTO_INCREMENT,
    quizId INT,
    questionData JSON,
    FOREIGN KEY (quizId) REFERENCES quiz(quizId)
);

CREATE TABLE IF NOT EXISTS forgetPasswordStudent (
    passowrdId INT PRIMARY KEY AUTO_INCREMENT,
    studentId INT,
    oTP VARCHAR(20) NOT NULL,
    expiryTime DATETIME NOT NULL,
    FOREIGN KEY (studentId) REFERENCES studentData(studentId)
);

CREATE TABLE IF NOT EXISTS forgetPasswordManager (
    passwordId INT PRIMARY KEY AUTO_INCREMENT,
    managerId INT,
    OTP VARCHAR(20) NOT NULL,
    expiryTime DATETIME NOT NULL,
    FOREIGN KEY (managerId) REFERENCES managementData(managerId) 
    -- above should be buggged........................................................
);




CREATE TABLE IF NOT EXISTS courseOpenFor (
    courseOpenId INT PRIMARY KEY AUTO_INCREMENT,
    courseId INT,
    deptId INT,
    Batch INT,
    FOREIGN KEY (courseId) REFERENCES course(courseId),
    FOREIGN KEY (deptId) REFERENCES departmentData(deptid)
);

CREATE TABLE IF NOT EXISTS studentRegister (
    id INT NOT NULL AUTO_INCREMENT,
    studentEmail VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    createdAt DATETIME NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS managerRegister (
    id INT NOT NULL AUTO_INCREMENT,
    managerEmail VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    createdAt DATETIME NOT NULL,
    PRIMARY KEY (id)
);

-- insert into userRole values(1,'sree');

