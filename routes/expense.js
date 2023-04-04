const express = require('express')

const expenseController = require('../controllers/expenseController')

const router = express.Router()

router.post('/add-expense',expenseController.saveToStorage)

router.get('/get-expenses',expenseController.getAllUsers)

router.delete('/delete-expense/:id',expenseController.deleteExpense)

module.exports = router