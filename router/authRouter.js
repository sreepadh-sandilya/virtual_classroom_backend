const authController = require('../controller/authController');

const express = require('express');
const authRouter = express.Router();

authRouter.get("/test", authController.testConnection);
authRouter.post("/login",authController.userLogin);

module.exports = authRouter;