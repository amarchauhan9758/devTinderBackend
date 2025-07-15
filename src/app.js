const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connectDB = require('./config/database')
const User = require('./models/user')
const { validateRegistration } = require('./utils/validation');
const validator = require('validator');
const { adminAuth, userAuth } = require('./middlewares/adminAuth')
require('./config/database')
const app = express()
const port = 4000;

app.use(express.json())
app.use(cookieParser())
app.post('/signup', async (req, res) => {
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


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email })
        console.log(user, 'line no 35')
        if (!user) {
            throw new Error("Invalid Credentials");
        }


        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            throw new Error("Invalid Credentials");
        }
        else {

            // Cookies that have been signed
            // console.log('token:', req.signedCookies)
            // console.log('Cookies: ', req.cookies)
            const token = await jwt.sign({ _id: user._id }, "devTinder@1234");
            // console.log(token, 'line no 45')
            // cookies.send('token', token)
            res.cookie('token', token)
            res.send('Login Successfully !')
        }

    } catch (error) {
        res.status(400).send(error.message)
    }
})



app.get('/profile', async (req, res) => {
    try {
        // console.log(req.cookies)
        const { token } = req.cookies

        const decoded = await jwt.verify(token, 'devTinder@1234');
        const { _id } = decoded

        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user)


    } catch (error) {
        res.status(400).send(error.message)
    }
})




app.get('/user', async (req, res) => {
    const userEmailId = req.body.email
    try {
        const user = await User.find({ email: userEmailId })
        res.send(user)
    } catch (error) {

        res.status(400).send('Bad request' + error.message)

    }
})

app.patch('/user-update', async (req, res) => {



    try {
        const userId = req.body.userId
        const data = req.body


        const allowedKeysForEdit = ["email", "firstName"];

        const isAllowrd = Object.keys(data).some((key) => allowedKeysForEdit.includes(key))
        console.log(isAllowrd, 'line no 46')
        if (isAllowrd) {
            throw new Error("not allowed");

        }


        if (!userId) {
            return res.status(400).send("userId is required");
        }

        const user = await User.findByIdAndUpdate({ _id: userId }, data)
        console.log(user, 'line no 41')
        if (!user) {
            res.send('User not found !')
        }
        res.send("User update successfully")
    } catch (error) {
        res.status(500).send(error.message)
    }


})



app.delete('/user', async (req, res) => {
    try {
        const userId = req.body._id
        const user = await User.findByIdAndDelete(userId)
        res.send('User Deleteted Successfully')

    } catch (error) {
        res.status(400).send(error.message)
    }
})
connectDB()
    .then(() => {
        console.log('DB is connecting now ')
        app.listen(port, () => {
            console.log('server is running')
        })
    })
    .catch((err) => console.log(err))

