const path = require("path");
const { where } = require("sequelize");
const bcrypt = require("bcrypt");

const User = require("../modals/userModal");
const rootDir = require("../util/path");

exports.signUp = async (req, res, next) => {
  const userName = req.body.userAdd;
  const emailAdd = req.body.emailAdd;
  const passwordAdd = req.body.passwordAdd;

  if (!userName || !emailAdd || !passwordAdd) {
    return res.status(400).json({ error: " All fields are required" });
  }
  try {
    const saltRound = 10;
    bcrypt.hash(passwordAdd, saltRound, async (err, hash) => {
      const data = await User.create({
        userName: userName,
        email: emailAdd,
        password: hash,
      });
      res.status(201).json({ newUser: data });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.logIn = async (req, res, next) => {
  const email = req.body.emailAdd;
  const password = req.body.passwordAdd;

  try {
    const user = await User.findOne({
      where: { email: email },
    });
    if (!user) {
      res.status(400).json({ message: "User Not Found" });
    } else {
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          res.status(200).json({ message: "User Login Succesfull" });
        } else {
          res.status(400).json({ message: "User not authorized" });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
