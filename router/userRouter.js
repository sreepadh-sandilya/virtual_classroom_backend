const userController = require('../controller/userController');

const express = require('express');
const userRouter = express.Router();

userRouter.get("/test", userController.testConnection);
userRouter.get("/department/all", userController.getAllDepartments);
userRouter.get("/department/:deptId(\\d+)", userController.getDepartmentById)
userRouter.get("/courses-i-can-register", userController.getAvailableCoursesToRegister);
userRouter.get("/course/my", userController.getMyCourses);
userRouter.post("/course/register", userController.registerToCourse);
userRouter.post("/class/get", userController.getClass);
userRouter.post("/quiz/get", userController.getQuizById);
userRouter.post("/quiz/submit", userController.submitQuiz);

module.exports = userRouter;