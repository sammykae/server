const { body } = require("express-validator");
const User = require("../models/User");

exports.loginValidation = (req, res) => {
  return [
    body("username")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please provide username field")
      .isAlphanumeric()
      .withMessage("username should be Alphanumeric")
      .isLength({ min: 5, max: 21 })
      .withMessage("username should be between 5 - 21 characters"),
    body("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please provide password field")
      .isAlphanumeric()
      .withMessage("password should be Alphanumeric")
      .isLength({ min: 8, max: 15 })
      .withMessage("password should be between 8- 15 characters"),
  ];
};

exports.signupValidation = (req, res) => {
  return [
    body("username")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please provide username field")
      .isAlphanumeric()
      .withMessage("username should be Alphanumeric")
      .isLength({ min: 5, max: 21 })
      .withMessage("username should be between 5- 21 characters")
      .custom((value) => {
        return User.findOne({ username: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Username is taken");
          }
        });
      }),

    body("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please provide password field")
      .isAlphanumeric()
      .withMessage("password should be Alphanumeric")
      .isLength({ min: 8, max: 15 })
      .withMessage("password should be between 8- 15 characters"),

    body("password2").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password Not matching");
      } else {
        return true;
      }
    }),
  ];
};
