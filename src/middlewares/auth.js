
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const userAuth = async (req, res, next) => {

    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Please Login Again !")
        }

        const decodeJwt = await jwt.verify(token, 'devTinder@1234');

        const { _id } = decodeJwt;

        const user = await User.findById(_id);

        if (!user) {
            throw new Erro('User not found');
        }
        req.user = user; // Attach user to request object
        next(); // Call the next middleware or route handler

    } catch (error) {
        return res.status(401).send('Unauthorized: ' + error.message);
    }


}
module.exports = { userAuth }