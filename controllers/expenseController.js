const Expense = require('../modals/expenseModal')
const User = require('../modals/userModal')
const path = require('path')
const rootDir = require('../util/path')
const sequelize = require('../database/database')
const userAuthentication = require('../middleware/auth')

exports.saveToStorage = async(req,res,next) =>{

    const amount = req.body.amountAdd
    const description = req.body.descriptionAdd
    const category = req.body.categoryAdd

    if (!amount || !description || !category) {
        return res.status(400).json({ error: 'Amount, description, and category fields are required' });
      }

    const t = await sequelize.transaction();

    try {
        const data = await Expense.create(
            {   expenseAmount:amount,
                description:description, 
                category:category,
                userId:req.user.id,
            },
            {
                transaction:t
            });
        const totalExpense = Number(req.user.totalExpenses) + Number(data.expenseAmount)

        await User.update( {totalExpenses:totalExpense} , {where:{id:req.user.id},transaction:t})
        
        await t.commit()
        
        res.status(201).json({ newExpense: data ,totalExpense : totalExpense})
      
    } catch (error) {
        await t.rollback()
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

    const t = await sequelize.transaction();
    try{
        const expenseId = req.params.id
        const expense = await Expense.findOne({where:{id:expenseId,userId:req.user.id},transaction:t})
        const totalExpense = Number(req.user.totalExpenses) - Number(expense.expenseAmount)

        await expense.destroy({transaction:t})
        await User.update( {totalExpenses:totalExpense} , {where:{id:req.user.id},transaction:t},)
        
        await t.commit()
        res.status(201).json({success:true, totalExpense : totalExpense})

    }catch(error){
        await t.rollback()
        console.log(error)
        res.status(500).json({error:error})

    }
}