const express = require("express");
const connectDB = require("./src/config/db.js");
const UserModel = require("./src/models/user.js");
const validator = require("validator");

const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware for all the routes to read json.

// Post signup API
app.post("/signup", async (req, res) => {
  const data = req.body;

  const validEmail = validator.isEmail(data.email); // Email Validation

  // firstName & lastName Validation
  const patternName = /^[a-zA-Zà-ÿÀ-Ÿ' -]{2,30}$/;
  let validName;
  if (data.lastName) {
    validName =
      patternName.test(data.firstName) && patternName.test(data.lastName);
  } else {
    validName = patternName.test(data.firstName);
  }

  // username Validation
  const patternUsername =
    /^(?!.*[_.]{2})[a-zA-Z0-9][a-zA-Z0-9._]{2,28}[a-zA-Z0-9]$/;
  const validUsername = patternUsername.test(data.username);

  try {
    // Input validation
    if (!validEmail) {
      throw new Error("Invalid Email.");
    }
    if (!validName) {
      throw new Error("Invalid Name");
    }
    if (!validUsername) {
      throw new Error("Invalid username.");
    }

    // check for duplicate username
    const username = data.username;
    const checkDuplicateUsername = await UserModel.find({ username });

    // check for duplicate email
    const email = data.email;
    const checkDuplicateEmail = await UserModel.find({ email });

    // Check if username or email exist already.
    if (
      checkDuplicateUsername.length !== 0 ||
      checkDuplicateEmail.length !== 0
    ) {
      throw new Error(
        "User already exists. Please try a different email or username."
      );
    }

    const user = new UserModel(data);
    await user.save(); // Save the user to the database.
    res.send("User added Successfully.");
  } catch (err) {
    res.status(400).send("Error adding user. " + err.message);
  }
});

// Feed API - GET /feed - get all users from the database
app.get("/feed", async (req, res) => {
  try {
    const feed = await UserModel.find({});
    console.log(feed);
    res.send("Got feed data.");
  } catch (err) {
    res.status(400).send("Something went wrong getting feed users.");
  }
});

// find user by email
app.get("/user", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await UserModel.find({ email }); // Shorthand for email: email.
    if (user.length !== 0) {
      res.send(user);
    } else {
      res.status(404).send("There is no username with such email.");
    }
  } catch (err) {
    res.status(400).send("Something went wrong getting user by email.");
    console.log(err);
  }
});

// Delete user by ID
app.delete("/user", async (req, res) => {
  const userID = req.body._id;
  try {
    const user = await UserModel.findByIdAndDelete(userID);

    res.send("Deleted user");
  } catch (err) {
    res.status(400).send("Something went wrong deleting user...");
  }
});

// Update user
app.patch("/user/:userID", async (req, res) => {
  const data = req.body;
  const userID = req.params?.userID;

  const ALLOWED_UPDATES = [
    "phone",
    "age",
    "photoUrl",
    "about",
    "skills",
    "password",
  ];

  try {
    const isUpdatable = Object.keys(data).every(
      (
        key // Checks whether provided fields for update are allowed.
      ) => ALLOWED_UPDATES.includes(key)
    );

    if (!isUpdatable) {
      throw new Error("Can only update certain fields.");
    }

    // Validate Skills
    if (data?.skills) {
      if (data?.skills.length > 5) {
        throw new Error("Cannot add more than 5 skills.");
      }
    }

    // Validate Phone Number
    if (data.phone !== undefined) {
      const phonePattern = /^\+?[0-9\s\-]{7,20}$/;

      if (!phonePattern.test(data.phone)) {
        throw new Error("Invalid phone number.");
      }
    }

    // Validating age
    if (data.age !== undefined) {
      if (Number(data.age) > 100 || Number(data.age) < 8) {
        throw new Error("Invalid Age.");
      }
    }

    // Validating photo
    if (data.photoUrl !== undefined) {
      const urlPattern =
        /^(https?:\/\/)?(www\.)?[a-zA-Z0-9\-]+(\.[a-zA-Z]{2,})(\/[^\s]*)?$/;

      if (!urlPattern.test(data.photoUrl)) {
        throw new Error("Invalid photo url.");
      }
    }

    // Validating about
    if (data.about !== undefined) {
      const aboutPattern = /^.{5,150}$/;

      if (!aboutPattern.test(data.about)) {
        throw new Error("About me should be between 5 and 150 charachters.");
      }
    }

    const update = await UserModel.findByIdAndUpdate(userID, data, {
      runValidators: true,
    });
    if (update !== null) {
      res.send("Updated user.");
    } else {
      throw new Error("Cannot update User.");
    }
  } catch (err) {
    res.status(400).send("Something went wrong updating user..." + err.message);
  }
});

connectDB() // Connecting to the Database
  .then(() => {
    console.log("Connection Successful.");
    app.listen(PORT, () => {
      // only start listening if the db is successfully connected.
      console.log(`App listening on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Cannot connect to the database.");
  });
