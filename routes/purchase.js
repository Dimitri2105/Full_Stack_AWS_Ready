const express = require('express')

const purchaseController = require('../controllers/purchaseController')
const userAuthentication = require('../middleware/auth')

const router = express.Router()

router.get('/buyPremiumMembership',userAuthentication.authenticate,purchaseController.premiumMember)

router.post('/updateTransactionStatus',userAuthentication.authenticate,purchaseController.updateStatus)


module.exports = router