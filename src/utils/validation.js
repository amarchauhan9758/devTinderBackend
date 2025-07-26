const validator = require("validator");

const validateRegistration = (req) => {
  const { email, password, firstName, lastName } = req.body;

  if (!firstName) {
    throw new Error("firstName are required");
  } else if (firstName.isLength >= 4) {
    throw new Error("firstName must be at least 4 characters long");
  } else if (firstName === lastName) {
    throw new Error("firstName and lastName must be the same");
  } else if (!email || !validator.isEmail(email)) {
    throw new Error("Invalid email address");
  }
  // else if (!password || !validator.isStrongPassword(password)) {
  //     throw new Error("Password must be strong");
  // }
};

const validateProfileUpdate = (req, res, next) => {
  const allowedFields = [
    "lastName",
    "profileURL",
    "age",
    "about",
    "skills",
    "firstName",
    "gender",
  ];

  const isAllowed = Object.keys(req.body).every((key) =>
    allowedFields.includes(key)
  );

  console.log(isAllowed, "line no 35");
  if (!isAllowed) {
    throw new Error("Invalid fields in profile update");
  }
};
module.exports = { validateRegistration, validateProfileUpdate };
