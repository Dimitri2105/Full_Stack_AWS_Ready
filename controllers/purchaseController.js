const path = require("path");
const Razorpay = require("razorpay");

const rootDir = require("../util/path");
const userAuthentication = require("../middleware/auth");
const Order = require("../modals/orderModal");
const User = require("../modals/userModal");

exports.premiumMember = async (req, res, next) => {
  console.log("INSIDE PURCHASE CONTROLLER premiumMember ");

  try {
    var rzr = new Razorpay({
      key_id: "rzp_test_B36ECwpTYdG0Ot",
      key_secret: "qIupJTkYPcht4AjcUUCGYfud",
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
    res.status(500).json({ error: error });
  }
};

exports.updateStatus = async (req, res, next) => {

  try {
    const order_id = req.body.order_id;
    const payment_id = req.body.payment_id;

    const order = await Order.findOne({ where: { orderId: order_id } })
      
    const promise1 = order.update({ paymentId: payment_id, status: "SUCCESS" })
    const promise2 = req.user.update({ isPremiumUser: true })

    Promise.all([promise1,promise2])
    .then( () =>{
        return res.status(200).json({ message: "Transaction Succesfull" });
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
