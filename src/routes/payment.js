const express = require("express");
const paymentRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const { MemberShipAmount } = require("../utils/constant");
const Razorpay = require("razorpay");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
require("dotenv").config();

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: MemberShipAmount[membershipType] * 100, // Convert to paise
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    };

    const order = await instance.orders.create(options);

    const payment = new Payment({
      userId: req.user._id,
      amount: order.amount,
      currency: order.currency,
      orderId: order.id,
      receipt: order.receipt,
      status: order.status,
      notes: order.notes,
    });

    const savedPayment = await payment.save();
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
    // res.json({
    //   status: "success",
    //   data: savePayment,
    //   message: "Order created successfully",
    // });
  } catch (error) {
    console.error("Error creating payment order:", error);
    res.status(400).send(error.message);
  }
});

paymentRouter.post("/api/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("x-razorpay-signature");
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }
    // Udpate my payment Status in DB
    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });
    payment.status = paymentDetails.status;
    await payment.save();
    console.log("Payment saved");

    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    console.log("User saved");

    await user.save();
    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    return res.status(500).json({ message: err.message });
  }
});

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  const user = req.user.toJSON();

  console.log(user, "line no 98");

  if (user.isPremium) {
    return res.json({ ...user });
  }
  return res.status(400).json({ ...user });
});

module.exports = paymentRouter;
