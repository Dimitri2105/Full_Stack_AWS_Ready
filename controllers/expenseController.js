const Expense = require('../modals/expenseModal')
const User = require('../modals/userModal')
const path = require('path')
const rootDir = require('../util/path')
const userAuthentication = require('../middleware/auth')

exports.saveToStorage = async(req,res,next) =>{

    const amount = req.body.amountAdd
    const description = req.body.descriptionAdd
    const category = req.body.categoryAdd

    if (!amount || !description || !category) {
        return res.status(400).json({ error: 'Amount, description, and category fields are required' });
        
      }
      try {
        const data = await Expense.create(
            {   expenseAmount:amount,
                description:description, 
                category:category,
                userId:req.user.id

            });
        console.log(data.expenseAmount)
        const totalExpense = Number(req.user.totalExpenses) + Number(data.expenseAmount)
        console.log(totalExpense)
        await User.update( {totalExpenses:totalExpense} , {where:{id:req.user.id}},)
        .then(() =>{
            res.status(201).json({ newExpense: data ,totalExpense : totalExpense})
        })
        .catch(error =>{
            console.log(error)
            res.status(500).json({error:error})
        })
        // res.status(201).json({ newExpense: data })
      
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: error });
      }
}

exports.getAllUsers = async(req,res,next) =>{
    try{
        Expense.findAll({where:{ userId : req.user.id }})
        .then(expense =>{
            res.status(201).json({expense})
        })

    }catch(error){
        console.log(error)
        res.status(500).json({error:error})
    }

}

exports.deleteExpense = async(req,res,next) =>{
    console.log(req.params.id)
    if(!req.params.id){
        res.status(400).json({err:"Missing ExpenseID"})
    }
    try{
        console.log("User id is >>>>>>>",req.user.id)
        const expenseId = req.params.id
        Expense.destroy({where:{id:expenseId,userId:req.user.id}})
        console.log("expense Successfully destroyed")

    }catch{
        console.log(err)
        req.status(500).json({error:error})

    }
}