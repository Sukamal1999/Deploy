const express = require("express");
const router = express.Router();
const resetPasswordController = require("../controllers/resetPasswordController");

// Route to display the forgot password page
router.get("/forgotPasswordPage", resetPasswordController.forgotPasswordPage);

// Route to display the reset password page with a requestId parameter
router.get("/resetPasswordPage/:requestId", resetPasswordController.resetPasswordPage);

// Route to send mail for password reset
router.post("/sendMail", resetPasswordController.sendMail);

// Route to update the password
router.post("/resetPassword", resetPasswordController.updatePassword);

module.exports = router;
