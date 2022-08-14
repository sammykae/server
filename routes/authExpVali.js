const router = require("express").Router();
const User = require("../models/User");
// const bcrypt = require("bcrypt");

// const express = require("express");
// const router = express.Router();
const {
  getLogin,
  getRegister,
  postLogin,
  postRegister,
  getLogout,
} = require("../controllers.ignore/authCtrl");

const {
  loginValidation,
  signupValidation,
} = require("../validation.ignore/auth");

router.get("/login", getLogin);
router.post("/login", loginValidation(), postLogin);
router.get("/register", getRegister);
router.post("/register", signupValidation(), postRegister);
router.get("/logout", getLogout);

module.exports = router;
