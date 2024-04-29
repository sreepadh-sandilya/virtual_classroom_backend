const adminController = require('../controller/adminController');

const express = require('express');
const adminRouter = express.Router();

adminRouter.get("/test", adminController.testConnection);
adminRouter.get("/course/all", adminController.getAllCourses);
adminRouter.post("/course/create", adminController.createNewCourse);
adminRouter.post("/course/update", adminController.updateCourseData);
adminRouter.post("/assign/professor", adminController.assignProfessor);
adminRouter.post("/add/department",adminController.addDepartment);
module.exports = adminRouter;