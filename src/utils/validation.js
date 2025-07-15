
const validator = require('validator');


const validateRegistration = (req) => {
    const { email, password, firstName, lastName } = req.body;

    if (!firstName) {
        throw new Error("firstName are required");

    }
    else if (firstName.isLength >= 4) {
        throw new Error("firstName must be at least 4 characters long");
    }
    else if (firstName === lastName) {
        throw new Error("firstName and lastName must be the same");
    }

    else if (!email || !validator.isEmail(email)) {
        throw new Error("Invalid email address");
    }
    // else if (!password || !validator.isStrongPassword(password)) {
    //     throw new Error("Password must be strong");
    // }
}

module.exports = { validateRegistration };