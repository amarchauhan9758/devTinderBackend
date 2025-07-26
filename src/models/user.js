const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
    },
    lastName: {
      type: String,
      minLength: 3,
    },
    password: {
      type: String,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Please Make Strong Password" + value);
        }
      },
    },
    age: {
      type: Number,
      min: [18, "Must be at least 18, got {VALUE}"],
      max: 55,
    },
    gender: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(" Invalid Email address" + value);
        }
      },
    },
    skils: {
      type: [],
    },
    profileURL: {
      type: String,
      default:
        "https://cdn.vectorstock.com/i/1000v/51/05/male-profile-avatar-with-brown-hair-vector-12055105.jpg",
      validator(value) {
        if (!validator.isURL(value)) {
          throw new Error(value + " is not a valid URL");
        }
      },
    },
    about: {
      type: String,
      default: "I am a frontend developer...",
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "devTinder@1234", {
    expiresIn: "7d",
  });

  return token;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
