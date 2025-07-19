const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const { validateProfileUpdate } = require('../utils/validation');

profileRouter.get('/profile/view', userAuth, async (req, res) => {
    try {
        // console.log(req.cookies)
        const user = req.user; // User is attached to the request object by the userAuth middleware
        res.send(user)





    } catch (error) {
        res.status(400).send(error.message)
    }
})

profileRouter.patch('/profile/update', userAuth, async (req, res) => {
    try {
        console.log(req, req.body, 'line no 23')
        const loggedInUser = req.user; // User is attached to the request object by the userAuth middleware
        validateProfileUpdate(req);
        const data = req.body;
        Object.keys(data).forEach((key) => loggedInUser[key] = data[key]);
        await loggedInUser.save();


        res.json({
            message: `${loggedInUser.firstName} profile updated successfully`,
            data: loggedInUser

        })





    } catch (error) {
        res.status(400).send(error.message)
    }


})

module.exports = profileRouter