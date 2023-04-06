const express = require('express')

const premiumController = require('../controllers/premiumController')
const userAuthentication = require('../middleware/auth')

const router = express.Router()

router.get('/premium/leaderBoard',userAuthentication.authenticate,premiumController.getUserLeaderboard)

module.exports = router