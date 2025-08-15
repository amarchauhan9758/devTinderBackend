const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  mongoose.connect(process.env.DB_URL);
  // mongoose.connect('mongodb+srv://amarchauhan06232:HnrpnED16vULbwHe@cluster0.qul64bv.mongodb.net/devTinder')
};

module.exports = connectDB;

// connectDB()
//     .then(console.log(
//         'database connection established'
//     ))
//     .catch((e) => console.log(e))
// .finally(() => mongoose.close())
