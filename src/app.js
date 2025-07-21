const express = require('express')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/database')



const app = express()
const port = 4000;

app.use(express.json())
app.use(cookieParser())


const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');






app.use('/', authRouter)
app.use('/', profileRouter)
app.use('/', requestRouter)
app.use('/', userRouter)

connectDB()
    .then(() => {
        console.log('DB is connecting now ')
        app.listen(port, () => {
            console.log('server is running')
        })
    })
    .catch((err) => console.log(err))

