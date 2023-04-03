const path = require('path')

const User = require('../modals/userModal')
const rootDir = require('../util/path')

exports.saveToStorage = async(req,res,next) =>{

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