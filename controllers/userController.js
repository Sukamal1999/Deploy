const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/userModel");

// Function to generate an access token
function generateAccessToken(id, email) {
  return jwt.sign({ userId: id, email: email }, process.env.TOKEN);
}

// Function to render the login and registration form
const getLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../public/views/signLog.html"));
};

// Function to handle user registration
// Function to handle user registration
const postUserSignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email parameter is valid and provided in the request body
    if (!email) {
      return res.status(400).send("Email is required");
    }

    // Continue with the registration process
    await User.findOne({ where: { email: email } })
      .then((user) => {
        if (user) {
          res.status(409).send(
            `<script>alert('This email is already taken. Please choose another one.'); window.location.href='/'</script>`
          );
        } else {
          bcrypt.hash(password, 10, async (err, hash) => {
            await User.create({
              name: name,
              email: email,
              password: hash,
            });
          });
          res.status(200).send(
            `<script>alert('User Created Successfully!'); window.location.href='/'</script>`
          );
        }
      })
      .catch((err) => console.log(err));
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong.");
  }
};


// Function to handle user login
const postUserLogin = async (req, res) => {
  const { loginEmail, loginPassword } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ where: { email: loginEmail } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User doesn't exist!" });
    }

    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(loginPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Password Incorrect!" });
    }

    // Generate and return an access token
    const token = generateAccessToken(user.id, user.email);
    res.status(200).json({ success: true, message: "Login Successful!", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong!" });
  }
};

// Function to check if a user is a premium user
const isPremiumUser = (req, res) => {
  if (req.user.isPremiumUser) {
    res.json({ isPremiumUser: true });
  } else {
    res.json({ isPremiumUser: false });
  }
};

// Function to get all users and their total expenses
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["name", "totalExpenses"],
      order: [["totalExpenses", "DESC"]],
    });

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports = {
  generateAccessToken,
  getLoginPage,
  postUserSignUp,
  postUserLogin,
  isPremiumUser,
  getAllUsers,
};
