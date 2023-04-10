const express = require('express')

const forgetPasswordController = require('../controllers/forgetPasswordController')
const userAuthentication = require('../middleware/auth')

const router = express.Router()

router.post('/password/forgotpassword',forgetPasswordController.forgetPassword)

router.get('/password/resetpassword/:id',forgetPasswordController.resetPassword)

router.post('/password/updatepassword/:id',forgetPasswordController.updatePassword)

module.exports = router