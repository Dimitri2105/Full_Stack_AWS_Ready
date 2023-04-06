const path = require('path')
const rootDir = require('../util/path')
const userAuthentication = require('../middleware/auth')
const sequelize = require('../database/database')


const Expense = require('../modals/expenseModal')
const User = require('../modals/userModal')

exports.getUserLeaderboard = async(req,res,next) => {
    try{
        const listOfleaderBoardInfo = await User.findAll( {
            attributes : ["id","userName",[sequelize.fn('sum',sequelize.col('expenses.expenseAmount')),'totalExpense']],
            include : [
                {
                    model:Expense,
                    attributes : []
                }
            ],
            group : ["user.id"],
            order : [["totalExpense" , "DESC"]]

        })
        console.log(listOfleaderBoardInfo)
        res.status(200).json(listOfleaderBoardInfo)

    }catch (error) {
        console.log(error)
        res.status(500).json({ error: error });
      }

}



