const path = require("path");
const rootDir = require("../util/path");
const userAuthentication = require("../middleware/auth");
const sequelize = require("../database/database");
const Expense = require("../modals/expenseModal");
const User = require("../modals/userModal");
const ForgetPassword = require("../modals/forgetPasswordModal");

// const Sib = require('sib-api-v3-sdk')
const sgMail = require("@sendgrid/mail");
const uuid = require("uuid");
const dotenv = require("dotenv");

dotenv.config();

exports.forgetPassword = async (req, res, next) => {
  try {
    sgMail.setApiKey(process.env.API_KEY);
    const email = req.body.emailAdd;
    const user = await User.findOne({ where: { email: req.body.emailAdd } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const id = uuid.v4();
    const newForgotPassword = await ForgetPassword.create({
      id: id,
      active: true,
    });
    console.log("newForgotPassword>>>>>>>>>>>>>>>>>>", newForgotPassword);
    const message = {
      to: email,
      from: "karanthakur577@gmail.com",
      subject: "Password Reset",
      text: "Click on below link to reset password",
      html: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,
    };
    const result = await sgMail.send(message);
    console.log("Send Message>>>>>>>>>>>", result);

    res.status(200).json({ message: "Password reset email sent",success:true});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
