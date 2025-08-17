const express = require("express");
const { validateRegistration } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    validateRegistration(req);
    const { firstName, lastName, email, password } = req.body;

    const encrpytedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: encrpytedPassword,
    });
    await user.save();
    res.send("User Created Successfully !");
  } catch (error) {
    res.status(400).json({
      status: "success",
      data: null,
      message: error.message,
    });
  }
});
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new Error("Invalid Credentials");
    } else {
      const token = user.getJWT();
      res.cookie("token", token, {
        httpOnly: true, // prevents JS from accessing it
        secure: true, // required for HTTPS (Netlify)
        sameSite: "none", // allows cross-origin cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // allows cross-origin cookies
      });
      res.json({
        status: "success",
        data: user,
        message: "Login Sccessfully ..!",
      });
    }
  } catch (error) {
    res.status(400).send({
      status: "error",
      data: null,
      message: error.message,
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("No token provided");
    }

    // Clear cookie properly
    res.clearCookie("token", {
      expires: new Date(0), // Set expiration date to the past
    });

    res.send("Logout Successfully!");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = authRouter;
