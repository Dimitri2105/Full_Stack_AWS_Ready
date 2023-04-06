const path = require('path')
const rootDir = require('../util/path')
const userAuthentication = require('../middleware/auth')
const sequelize = require('../database/database')


const Expense = require('../modals/expenseModal')
const User = require('../modals/userModal')

exports.getUserLeaderboard = async(req,res,next) => {
    try{
        const users = await User.findAll()
        const expenses = await Expense.findAll()

        const userAggreatedExpenses = {}
        
        expenses.forEach(expense => {
            if(userAggreatedExpenses[expense.userId]){

                userAggreatedExpenses[expense.userId] = userAggreatedExpenses[expense.userId] +  expense.expenseAmount  
            }
            else{
                userAggreatedExpenses[expense.userId] = expense.expenseAmount
            }
            
        });
        
        let userLeaderBoardDetails = []

        users.forEach(user =>{
            userLeaderBoardDetails.push({name:user.userName , totalExpense : userAggreatedExpenses[user.id] || 0 })
        })

        userLeaderBoardDetails.sort( (a,b) => {
                b.totalExpense - a.totalExpense
        })
        console.log(userLeaderBoardDetails)
        res.status(200).json(userLeaderBoardDetails)

    }catch (error) {
        console.log(error)
        res.status(500).json({ error: error });
      }

}



