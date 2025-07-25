const express = require('express');
const { validateRegistration } = require('../utils/validation');
const User = require('../models/user')
const bcrypt = require('bcrypt');
const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    try {
        validateRegistration(req)
        const { firstName, lastName, email, password } = req.body;
        console.log(password, 'line no 20')
        const encrpytedPassword = await bcrypt.hash(password, 10);


        const user = new User({
            firstName,
            lastName,
            email,
            password: encrpytedPassword,

        })
        await user.save()
        res.send('User Created Successfully !')
    } catch (error) {
        res.status(400).send(error.message)
    }

})
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password, 'line no 36')
        const user = await User.findOne({ email: email })

        if (!user) {
            throw new Error("Invalid Credentials");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            throw new Error("Invalid Credentials");
        }
        else {
            const token = user.getJWT();
            res.cookie('token', token)
            res.json({
                status: 'success',
                data: user,
                message: "Login Sccessfully ..!"
            })
        }

    } catch (error) {

        res.status(400).send({
            status: 'error',
            data: null,
            message: error.message
        })
    }
})

authRouter.post('/logout', async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error('No token provided');
        }

        // Clear cookie properly
        res.clearCookie('token', {
            expires: new Date(0), // Set expiration date to the past
        });

        res.send('Logout Successfully!');
    } catch (error) {
        res.status(400).send(error.message)
    }

})


module.exports = authRouter