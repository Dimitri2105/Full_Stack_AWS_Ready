const express = require('express')

const forgetPasswordController = require('../controllers/forgetPasswordController')
const userAuthentication = require('../middleware/auth')

const router = express.Router()

router.post('/password/forgotpassword',userAuthentication.authenticate,forgetPasswordController.forgetPassword)

module.exports = router