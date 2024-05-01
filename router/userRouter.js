const userController = require('../controller/userController');

const express = require('express');
const userRouter = express.Router();

userRouter.get("/test", userController.testConnection);
userRouter.get("/department/all", userController.getAllDepartments);
userRouter.get("/department/:deptId(\\d+)", userController.getDepartmentById)

module.exports = userRouter;