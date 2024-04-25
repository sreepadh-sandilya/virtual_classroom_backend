const authController = require('../controller/authController');

const express = require('express');
const authRouter = express.Router();

authRouter.get("/test", authController.testConnection);
authRouter.post("/login",authController.userLogin);
authRouter.post("/forgotPassword",authController.forgotPassword)
authRouter.post("/resetPasswordVerify",authController.resetPasswordVerify)
authRouter.post("/resetPassword",authController.resetPassword)

module.exports = authRouter;