CREATE TABLE userRole (
    roleId INT PRIMARY KEY AUTO_INCREMENT,
    roleName VARCHAR(255) NOT NULL
);

CREATE TABLE course (
    courseId INT PRIMARY KEY AUTO_INCREMENT,
    courseCode VARCHAR(20) NOT NULL,
    courseName VARCHAR(255) NOT NULL,
    courseDept VARCHAR(100),
    createdBy VARCHAR(255)
);

CREATE TABLE studentData (
    studentId INT PRIMARY KEY AUTO_INCREMENT,
    studentName VARCHAR(255) NOT NULL,
    studentRollNumber VARCHAR(50) NOT NULL,
    studentGender VARCHAR(10) NOT NULL,
    studentNo VARCHAR(20) NOT NULL,
    studentEmail VARCHAR(255) NOT NULL,
    studentPassword VARCHAR(255) NOT NULL,
    studentDob DATE NOT NULL,
    studentDeptid INT NOT NULL,
    studentSection VARCHAR(20) NOT NULL,
    studentBatch INT NOT NULL,
    createdBy VARCHAR(255) NOT NULL,
    studentStatus BOOLEAN NOT NULL
);

CREATE TABLE departmentData (
    deptId INT PRIMARY KEY AUTO_INCREMENT,
    deptName VARCHAR(255) NOT NULL
);

CREATE TABLE managementData (
    managerId INT PRIMARY KEY AUTO_INCREMENT,
    managerEmail VARCHAR(255) NOT NULL,
    managerPassword VARCHAR(255) NOT NULL,
    deptId INT,
    managementRollId INT,
    managerFullName VARCHAR(255),
    createdBy VARCHAR(255),
    managerStatus BOOLEAN,
    FOREIGN KEY (deptId) REFERENCES departmentData(deptId)
);

CREATE TABLE assignment (
    assignmentId INT PRIMARY KEY AUTO_INCREMENT,
    courseId INT NOT NULL,
    isOpentoAll BOOLEAN NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    FOREIGN KEY (courseId) REFERENCES course(courseId)
);

CREATE TABLE courseFaculty (
    courseFacultyid INT PRIMARY KEY AUTO_INCREMENT,
    courseId INT,
    managerID INT,
    batch VARCHAR(20),
    section VARCHAR(10),
    isMentor BOOLEAN,
    isActive BOOLEAN,
    FOREIGN KEY (courseId) REFERENCES course(courseId),
    FOREIGN KEY (managerID) REFERENCES managementData(managerid)
);

CREATE TABLE quiz (
    quizId INT PRIMARY KEY AUTO_INCREMENT,
    courseFacultyid INT NOT NULL,
    isOpenForAll BOOLEAN NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    duration INT NOT NULL,
    FOREIGN KEY (courseFacultyid) REFERENCES courseFaculty(courseFacultyid)
);

CREATE TABLE quizSubmission (
    quizSubmission_id INT PRIMARY KEY AUTO_INCREMENT,
    quizId INT NOT NULL,
    studentId INT NOT NULL,
    marks DECIMAL(10, 2),
    time DATETIME NOT NULL,
    FOREIGN KEY (quizId) REFERENCES quiz(quizId),
    FOREIGN KEY (studentId) REFERENCES studentData(studentId)
);

CREATE TABLE quizResponse (
    quizResponseId INT PRIMARY KEY AUTO_INCREMENT,
    quizId INT,
    responseData JSON,
    FOREIGN KEY (quizId) REFERENCES quiz(quizId)
);

CREATE TABLE quizQuestion (
    questionId INT PRIMARY KEY AUTO_INCREMENT,
    quizId INT,
    questionData JSON,
    FOREIGN KEY (quizId) REFERENCES quiz(quizId)
);

CREATE TABLE forgetPasswordStudent (
    passowrdId INT PRIMARY KEY AUTO_INCREMENT,
    studentId INT,
    oTP VARCHAR(20) NOT NULL,
    expiryTime DATETIME NOT NULL,
    FOREIGN KEY (studentId) REFERENCES studentData(studentId)
);

CREATE TABLE forgetPasswordManager (
    passwordId INT PRIMARY KEY AUTO_INCREMENT,
    managerId INT,
    OTP VARCHAR(20) NOT NULL,
    expiryTime DATETIME NOT NULL,
    FOREIGN KEY (managerId) REFERENCES managementData(managerId)
);




CREATE TABLE courseOpenFor (
    courseOpenId INT PRIMARY KEY AUTO_INCREMENT,
    courseId INT,
    deptId INT,
    Batch VARCHAR(20),
    FOREIGN KEY (courseId) REFERENCES course(courseId),
    FOREIGN KEY (deptId) REFERENCES departmentData(deptid)
);

insert into userRole values(1,'sree');

