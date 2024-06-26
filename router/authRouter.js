const authController = require('../controller/authController');

const express = require('express');
const authRouter = express.Router();

authRouter.get("/test", authController.testConnection);
authRouter.post("/login", authController.userLogin);
authRouter.post("/forgot-password", authController.forgotPassword)
authRouter.post("/forgot-password/verify", authController.verifyAndResetPassword);

module.exports = authRouter;