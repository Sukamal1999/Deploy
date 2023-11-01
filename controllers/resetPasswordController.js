const path = require("path");
const User = require("../models/userModel");
const ResetPassword = require("../models/resetPasswordModel");
const bcrypt = require("bcrypt");
const Sib = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require("uuid");
const saltRounds = 10;
require('dotenv').config()

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

exports.forgotPasswordPage = async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "../public/views/forgot.html"));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.sendMail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const requestId = uuidv4();

    const recipientEmail = await User.findOne({ where: { email: email } });

    if (!recipientEmail) {
      return res
        .status(404)
        .json({ message: "Please provide a registered email!" });
    }

    const resetRequest = await ResetPassword.create({
      id: requestId,
      isActive: true,
      userId: recipientEmail.dataValues.id,
    });

    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.API_KEY;
    const transEmailApi = new Sib.TransactionalEmailsApi();
    const sender = {
      email: "sukamalmondal07@gmail.com", 
    };
    const receivers = [
      {
        email: email,
      },
    ];
    const emailResponse = await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Expense Tracker Reset Password",
      textContent: "Link Below",
      htmlContent: `<h3>Hi! We received a request from you to reset your password. Here is the link below:</h3>
      <a href="http://localhost:3000/password/resetPasswordPage/${requestId}"> Click Here</a>`,
    });
    
    return res.status(200).json({
      message: "A password reset link has been sent to your email address.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send the reset password email" });
  }
};

exports.resetPasswordPage = async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "../public/views/resetPassword.html"));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const requestId = req.params.requestId; // Use params to get the request ID
    const password = req.body.password;
    const checkResetRequest = await ResetPassword.findOne({
      where: { id: requestId, isActive: true },
    });

    if (!checkResetRequest) {
      return res.status(409).json({ message: "Reset link is invalid or expired" });
    }

    const userId = checkResetRequest.userId;

    await ResetPassword.update(
      { isActive: false },
      { where: { id: requestId } }
    );

    const newPassword = await hashPassword(password);
    await User.update(
      { password: newPassword },
      { where: { id: userId } }
    );

    return res.status(200).json({ message: "Password successfully changed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to change password" });
  }
};