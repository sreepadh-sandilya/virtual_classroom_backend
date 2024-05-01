const adminController = require('../controller/adminController');

const express = require('express');
const adminRouter = express.Router();

adminRouter.get("/test", adminController.testConnection);

adminRouter.post("/official/create", adminController.registerOfficial);
adminRouter.get("/official/all", adminController.getAllOfficials);

adminRouter.get("/course/all", adminController.getAllCourses);
adminRouter.post("/course/create", adminController.createNewCourse);
adminRouter.post("/course/update", adminController.updateCourseData);
adminRouter.get("/course/:courseId(\\d+)", adminController.getCourseById);

adminRouter.post("/assign/professor", adminController.assignProfessor);
adminRouter.post("/assign/professor/update", adminController.editAssignedProfessor);

adminRouter.post("/department/create",adminController.addDepartment);
adminRouter.post("/department/update",adminController.updateDepartment);

adminRouter.post("/classroom/create",adminController.createClassroom);
adminRouter.post("/classroom/update",adminController.updateClassroom);

adminRouter.post("/quiz/create",adminController.createQuiz);
adminRouter.post("/quiz/update",adminController.updateQuiz);
adminRouter.post("/quiz/get",adminController.getQuizById);

adminRouter.post("/classroom/get", adminController.getClassRoomData);

adminRouter.post("/student/create", adminController.registerStudents);

module.exports = adminRouter;

