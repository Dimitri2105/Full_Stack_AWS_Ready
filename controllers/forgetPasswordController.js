const path = require("path");
const fs = require('fs');
const bcrypt = require("bcrypt");

const rootDir = require("../util/path");
const userAuthentication = require("../middleware/auth");
const sequelize = require("../database/database");
const Expense = require("../modals/expenseModal");
const User = require("../modals/userModal");
const ForgetPassword = require("../modals/forgetPasswordModal");

const sgMail = require("@sendgrid/mail");
const uuid = require("uuid");
const dotenv = require("dotenv");
const { where } = require("sequelize");
const { RequestContactExportCustomContactFilter } = require("sib-api-v3-sdk");

dotenv.config();

dotenv.config()

exports.forgetPassword = async (req, res, next) => {
  try {
    sgMail.setApiKey(process.env.API_KEY);
    const email = req.body.emailAdd;
    const user = await User.findOne({ where: { email: req.body.emailAdd } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("USer ID is >>>>>>",user.id)
    const id = uuid.v4();
    console.log("UUIID generated >>>>>>>>>>>>>>>>>>",id)
    const newForgotPassword = await ForgetPassword.create({
      id: id,
      active: true,
      userId:user.id
    });
    const message = {
      to: email,
      from: "karanthakur577@gmail.com",
      subject: "Password Reset",
      text: "Click on below link to reset password",
      html: `<a href="http://localhost:8000/password/resetpassword/${id}">Reset password</a>`,
    };
    const result = await sgMail.send(message);
    console.log("id >>>>>>>>",id)

    res.status(200).json({message: "Password reset email sent",success:true,id});

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.resetPassword = async (req, res, next) => {
  try{
    const forgetPasswordId =  req.params.id;
    console.log("forgetPasswordId>>>>>>>>>>>>>>>",forgetPasswordId)
    const forgotPasswordRequest = await ForgetPassword.findOne({ where : { id:forgetPasswordId}})
    if(forgotPasswordRequest)
    {
      await ForgetPassword.update({ active: false},{where:{id:forgetPasswordId}});
  
      const filePath = path.join(__dirname, '..', 'views', 'resetPassword', 'resetPassword.html');
      console.log('filePath>>>>>>>>>>>', filePath);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error loading file');
        }
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(data);
      });
      }
  }catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
  
  }

exports.updatePassword = async(req,res,next) =>{
  try{
    const resetId = req.params.id;
    const password = req.body.passwordAdd;

    if(!req.params.id){
      res.status(400).json({message:"Reset Password ID missing"})
    }
    const forgotPasswordRequest =  await ForgetPassword.findOne({where:{id:resetId}})
    console.log("forgotPasswordRequest>>>>>>>>>>>>>>>>",forgotPasswordRequest)
    const userRequest = await User.findOne({where:{id:forgotPasswordRequest.userId}})
    console.log("userRequest>>>>>>>>>>>>>>>>>>>>",userRequest)
    if(userRequest){
      const saltRound = 10;
      bcrypt.hash(password,saltRound,async(error,hash) =>{
        if(error){
          console.log(error);
          throw new Error(error);
        }
    await User.update({password: hash},{where:{id:userRequest.id}})
    res.status(201).json({message: 'Successfuly update the new password'})})
    }
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }

}