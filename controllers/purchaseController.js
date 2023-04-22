const path = require("path");
const Razorpay = require("razorpay");
const jst = require('jsonwebtoken');

const rootDir = require("../util/path");
const userAuthentication = require("../middleware/auth");

const userController=require('./userController')

const Order = require("../modals/orderModal");
const User = require("../modals/userModal");

const dotenv = require('dotenv')
dotenv.config()


exports.premiumMember = async (req, res, next) => {
  try {
    const razorPayKeyId = process.env.RAZORPAY_KEY_ID
    const razorPayKeySecret = process.env.RAZORPAY_KEY_SECRET 
    var rzr = new Razorpay({
      key_id: razorPayKeyId,
      key_secret: razorPayKeySecret
    });
    const amount = 3500;

    rzr.orders.create({ amount, currency: "INR" }, (error, order) => {
      if (error) {
        throw new Error(JSON.stringify(error));
      }
      req.user
        .createOrder({ orderId: order.id, status: "PENDING" })
        .then(() => {
          return res.status(201).json({ order, key_id: rzr.key_id });
        })
        .catch((err) => {
          throw new Error(JSON.stringify(error));
        });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateStatus = async (req, res, next) => {

  try {
    const order_id = req.body.order_id;
    const payment_id = req.body.payment_id;
    const userId = req.user.id

    const order = await Order.findOne({ where: { orderId: order_id } })
      
    const promise1 = order.update({ paymentId: payment_id, status: "SUCCESS" })
    const promise2 = req.user.update({ isPremiumUser: true })

    Promise.all([promise1,promise2])
    .then( () =>{
        return res.status(200).json({ message: "Transaction Succesfull" , token : userController.generateAccessToken(userId , undefined , true)});
    })
    .catch(async (error) => {
        console.log(error);
        await order.update({ status: "FAILED" });
        throw new Error(JSON.stringify(error));
      })       
  }catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
}