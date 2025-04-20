const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://ooasiic:Vek7iY5VIGiOunEa@ooasiic.fqxwyoj.mongodb.net/DevDating"
  );
};

module.exports = connectDB;
