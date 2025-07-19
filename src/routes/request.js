const { express } = require('express');
const requestRouter = express.Router();
import { userAuth } from '../middlewares/auth';



requestRouter.post('/sendConnectionRequest', userAuth, async (req, res) => {
    try {
        const user = req.user; // User is attached to the request object by the userAuth middleware
        // User is attached to the request object by the userAuth middleware
        // User is attached to the request object by the userAuth middleware
        res.send({
            name: user.firstName,
            profile: user.profile,
            status: 'Connection Request Sent Successfully !'
        })
    } catch (error) {
        res.status(400).send(error.message)
    }

})

module.exports = requestRouter;