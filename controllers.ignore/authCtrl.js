const User = require("../models/User");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const salt = 12;

exports.getLogin = (req, res) => {
  res.render("auth/loginPage.hbs", {
    title: "Login Page",
  }); //username: username
};

exports.getRegister = (req, res) => {
  res.render("auth/registerPage.hbs", { title: "Register Page" });
};

exports.postLogin = asyncHandler(async (req, res, next) => {
  // parse the form
  const { password, username } = req.body;

  // check for validation errors
  const errors = validationResult(req);
  // if there are errors
  if (!errors.isEmpty()) {
    return res.render("auth/loginPage.hbs", {
      title: "Login Page",
      errorMessage: errors.array()[0].msg,
      password,
      username,
    });
  }

  // check if the user exist in my db or not
  const user = await User.findOne({ username: username });
  console.log(user);
  // if he username not in db
  if (!user) {
    req.flash("error", "Invalid username or password");
    return res.redirect("/login");
  }
  // check the password is the correct password
  const match = await bcrypt.compare(password, user.password);
  if (match) {
    // process to login the user
    req.session.isLoggedIn = true;
    req.session.user = user;
    // Store user session in DB
    await req.session.save();
    req.flash("success", "Logged In successfully !");
    return res.redirect("/");
  }

  //  if no match to the password
  req.flash("error", "Invalid username or password");
  return res.redirect("/login");
});

exports.postRegister = async (req, res) => {
  const { password, password2, username } = req.body;

  // check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("auth/registerPage.hbs", {
      title: "Register Page",
      errorMessage: errors.array()[0].msg,
      username,
      password,
      password2,
    });
  }

  let userData = await User.find({ username: username });

  if (userData.length > 0) {
    req.flash("error", "Username is taken, try another username");
    return res.redirect("/register");
  }

  // Hash the password and store the user info in the db
  const hash = await bcrypt.hash(password, salt);
  // Create a new user
  const user = new User({ username, password: hash, password2 });
  // store the user in DB
  const storedUser = await user.save();

  req.flash("success", "User created Successfully !");
  res.redirect("/login");
};

exports.getLogout = asyncHandler(async (req, res, next) => {
  // send a message
  // req.flash('success', 'Logged out Successfully !')
  await req.session.destroy();
  res.redirect("/");
});





