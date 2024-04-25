const adminController = require('../controller/adminController');

const express = require('express');
const adminRouter = express.Router();

adminRouter.get("/test", adminController.testConnection);
adminRouter.post("/create", adminController.createCourse);
adminRouter.put("/update", adminController.updateCourse);     
module.exports = adminRouter;