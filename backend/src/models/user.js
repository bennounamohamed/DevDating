const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 30,
    },
    lastName: {
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minLength: 5,
      maxLength: 254,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email.");
        }
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minLength: 4,
      maxLength: 30,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 100,
    },
    phone: {
      type: Number,
      trim: true,
      minLength: 7,
      maxLength: 15,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"], // Custom Built-in validator that check wheter the value passed matches one of the array values.
    },
    age: {
      type: Number,
      trim: true,
      max: 100,
      min: 8,
    },
    photoUrl: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
      maxLength: 100,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo Url.");
        }
      },
    },
    about: {
      type: String,
      default: "Default about section.",
      trim: true,
      minLength: 5,
      maxLength: 150,
    },
    skills: {
      type: [String],
      validate: function (value) {
        if (value.length > 5) {
          throw new Error("Cannot add more than 5 skills.");
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
