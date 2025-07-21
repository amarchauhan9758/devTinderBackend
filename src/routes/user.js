const express = require('express')
const User = require('../models/user')
const userRouter = express.Router()
const { userAuth } = require('../middlewares/auth')
const ConnectionRequest = require('../models/connectionRequest')

// Get all  pending connection requests for a user

const USER_SAFE_FIELDS = 'firstName profileURL  lastName about skills'

userRouter.get('/user/requests', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user
        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: 'interested'
        }).populate('fromUserId', USER_SAFE_FIELDS) // Populate fromUserId with name and profileURL

        if (!connectionRequest || connectionRequest.length === 0) {
            return res.status(404).send('No connection requests found')
        }

        res.json({
            message: 'Connection requests fetched successfully',
            data: connectionRequest
        })
    }
    catch (error) {
        console.error('Error fetching connection requests:', error)
        return res.status(500).send('Internal Server Error')
    }
})



userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequestes = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: 'accepted' },
                { toFromUserId: loggedInUser._id, status: 'accepted' }
            ]
        }).populate('fromUserId', USER_SAFE_FIELDS).populate('toUserId', USER_SAFE_FIELDS);



        const data = connectionRequestes.map((item) => {
            if (item.fromUserId._id.equals(loggedInUser._id)) {
                return item.toUserId
            }
            return item.fromUserId
        })

        res.json({
            message: 'Connections fetched successfully',
            data: data
        })
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})


userRouter.get('/user/feed', userAuth, async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const skip = (page - 1) * limit;

    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, },
                { toUserId: loggedInUser._id }
            ]
        })

        console.log(connectionRequests, 'line no 79')

        const hideUserFromFeed = new Set()
        connectionRequests.forEach((req) => {
            hideUserFromFeed.add(req.fromUserId.toString())
            hideUserFromFeed.add(req.toUserId.toString())
        })
        // console.log(hideUserFromFeed, 'line no 83')

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUserFromFeed) } },
                { _id: { $ne: loggedInUser._id } }
            ]
        }).select(USER_SAFE_FIELDS).skip(skip).limit(limit)
        // console.log(users, 'line no 85')

        res.send(users)


    } catch (error) {
        res.status(400).send(error.message)
    }

})




module.exports = userRouter