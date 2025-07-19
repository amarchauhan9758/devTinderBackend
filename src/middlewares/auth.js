
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const userAuth = async (req, res, next) => {

    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Erro('Access denied. No token provided.');
        }

        const decodeJwt = await jwt.verify(token, 'devTinder@1234', { expiresIn: '7d' });

        const { _id } = decodeJwt;

        const user = await User.findById(_id);

        if (!user) {
            throw new Erro('User not found');
        }
        req.user = user; // Attach user to request object
        next(); // Call the next middleware or route handler

    } catch (error) {
        throw new Error(error.message);
    }


}
module.exports = { userAuth }