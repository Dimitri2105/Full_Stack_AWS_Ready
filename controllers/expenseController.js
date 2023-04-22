const Expense = require("../modals/expenseModal");
const User = require("../modals/userModal");
const DownloadUrl = require("../modals/fileURL")
const path = require("path");
const rootDir = require("../util/path");
const sequelize = require("../database/database");
const userAuthentication = require("../middleware/auth");
const UserServices = require('../services/userServices')
const S3Services = require('../services/s3Services')
const AWS = require("aws-sdk");
const dotenv = require("dotenv");

dotenv.config()

exports.saveToStorage = async (req, res, next) => {
  const amount = req.body.amountAdd;
  const description = req.body.descriptionAdd;
  const category = req.body.categoryAdd;

  if (!amount || !description || !category) {
    return res
      .status(400)
      .json({ error: "Amount, description, and category fields are required" });
  }

  const t = await sequelize.transaction();

  try {
    const data = await Expense.create(
      {
        expenseAmount: amount,
        description: description,
        category: category,
        userId: req.user.id,
      },
      {
        transaction: t,
      });
    const totalExpense =
      Number(req.user.totalExpenses) + Number(data.expenseAmount);

    await User.update(
      { totalExpenses: totalExpense },
      { where: { id: req.user.id }, transaction: t }
    );

    await t.commit();

    res.status(201).json({ newExpense: data, totalExpense: totalExpense });
  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.getAllUsers = async (req, res, next) => {
  const page = req.params.id
  const Items_Per_Page = parseInt(req.query.limit || 2);
  try {
    let count = await Expense.count({where: { userId: req.user.id}})

    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      offset: (page-1)*Items_Per_Page,
      limit: Items_Per_Page
    })  
    res.status(200).json({
      expenses,
      info: {
          currentPage: page,
          hasNextPage: count > page * Items_Per_Page,
          hasPreviousPage: page > 1,
          nextPage: +page + 1,
          previuosPage: +page - 1,
          lastPage: Math.ceil(count / Items_Per_Page) 
      }
  });
    // Expense.findAll({ where: { userId: req.user.id } }).then((expense) => {
    // res.status(201).json({ expense });
    // });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.deleteExpense = async (req, res, next) => {
  console.log(req.params.id);

  if (!req.params.id) {
    res.status(400).json({ err: "Missing ExpenseID" });
  }

  const t = await sequelize.transaction();
  try {
    const expenseId = req.params.id;
    const expense = await Expense.findOne({
      where: { id: expenseId, userId: req.user.id },
      transaction: t,
    });
    const totalExpense =
      Number(req.user.totalExpenses) - Number(expense.expenseAmount);

    await expense.destroy({ transaction: t });
    await User.update(
      { totalExpenses: totalExpense },
      { where: { id: req.user.id }, transaction: t }
    );

    await t.commit();
    res.status(201).json({ success: true, totalExpense: totalExpense });
  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.downloadExpense = async (req, res, next) => {
  try {
    // const expenses = await req.user.getExpenses()
    // const expenses = await Expense.findAll({ where: { userId: req.user.id } });

    const expenses = await UserServices.getExpenses(req)
    const userID = req.user.id;
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expense/${userID}/${new Date()}.txt`;
    const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
    const downloadUrlData = await DownloadUrl.create(
        {
          fileURL: fileURL,
          filename,
          userId: req.user.id,
        });
    res.status(200).json({ fileURL,downloadUrlData,success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({fileURL: '', success: false });
  }
};
exports.downloadAllUrl = async(req,res,next) =>{
    try{
        const allURL = await DownloadUrl.findAll({where:{userID:req.user.id}})
        res.status(200).json({allURL})

    }catch (error) {
        console.log(error);
        res.status(500).json({error: "Something went wrong", success: false });

    }

}

