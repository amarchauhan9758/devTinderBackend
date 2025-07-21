const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const requestRouter = express.Router();
const User = require('../models/user');

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id; // Get the ID of the user making the request from the authenticated user
        const toUserId = req.params.toUserId
        const status = req.params.status

        const allowredStatuses = ['interested', 'ignored'];
        console.log(status, 'line no 32')
        const isAllowedConnection = allowredStatuses.includes(status);
        console.log(isAllowedConnection, 'line no 32')
        if (!isAllowedConnection) {
            return res.status(400).send('Invalid status provided. Allowed statuses are: interested, ignore');
        }

        const toUserIdValid = await User.findById(toUserId);
        if (!toUserIdValid) {
            return res.status(400).send('User not found.');
        }

        // Check if a connection request already exists between the two users
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });


        if (existingRequest) {
            return res.status(400).send('Connection request already exists between these users.');
        }


        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });
        const data = await connectionRequest.save()
        res.json({
            message: req.user.firstName + ' ' + ' has sent a connection request to ' + toUserIdValid.firstName + ' ' + toUserIdValid.lastName,
            connectionRequestId: connectionRequest._id,
            data,
            status: 'Connection Request Sent Successfully !'
        })

    } catch (error) {
        res.status(400).send(error.message);
    }
})

requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {

    try {
        const requestId = req.params.requestId;
        const status = req.params.status;
        const allowedStatuses = ['accepted', 'rejected'];

        const isAllowedStatus = allowedStatuses.includes(status);
        if (!isAllowedStatus) {
            return res.status(400).send('Invalid status provided.');
        }

        const connectionRequest = await ConnectionRequest.findOne({ _id: requestId, toUserId: req.user._id, status: 'interested' });
        if (!connectionRequest) {
            return res.status(404).send('Connection request not found');
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save()
        res.json({
            message: `Connection request : ${status}`,
            data

        });

    } catch (error) {
        res.status(400).send(error.message);
    }

})






module.exports = requestRouter;