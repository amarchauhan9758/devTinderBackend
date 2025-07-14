const express = require('express')
const connectDB = require('./config/database')
const User = require('./models/user')
const { adminAuth, userAuth } = require('./middlewares/adminAuth')
require('./config/database')
const app = express()
const port = 4000;

app.use(express.json())
app.post('/signup', async (req, res) => {

    const user = new User(req.body)
    try {
        await user.save()
        res.send('User Created Successfully !')
    } catch (error) {
        res.status(400).send('Bad request' + error.message)
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

