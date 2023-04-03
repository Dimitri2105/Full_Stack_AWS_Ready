const path = require('path')
const { where } = require('sequelize')

const User = require('../modals/userModal')
const rootDir = require('../util/path')

exports.signUp = async(req,res,next) =>{

    const userName = req.body.userAdd
    const emailAdd = req.body.emailAdd
    const passwordAdd = req.body.passwordAdd

    if (!userName || !emailAdd || !passwordAdd) {
        return res.status(400).json({ error: ' All fields are required' });
        
      }
      try {
        const data = await User.create
        ({ 
            userName:userName,
            email:emailAdd, 
            password:passwordAdd 

        });
        res.status(201).json({ newUser: data })
      
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: error });
      }

}

exports.logIn = async (req, res, next) => {
  const email = req.body.emailAdd;
  const password = req.body.passwordAdd;

  console.log("email: ", email);
  console.log("password: ", password);

  try {
    const user = await User.findOne({
      where: { email: email},
    });
    if (!user) {
      res.status(400).json({ message: "User Not Found" });
    } else if (user.password !== password) {
      res.status(400).json({ message: "User not authorized" });
    } else {
      res.status(200).json({ message: "User Login Succesfull" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
