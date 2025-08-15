const express = require("express");
const paymentRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const { MemberShipAmount } = require("../utils/constant");
const Razorpay = require("razorpay");
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

    const savePayment = await payment.save();

    res.json({
      status: "success",
      data: savePayment,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    res.status(400).send(error.message);
  }
});

module.exports = paymentRouter;
