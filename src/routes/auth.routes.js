const express = require("express");

const { body } = require("express-validator");

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

//Register

router.post(
    "/register",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password")
        .isLength({min: 6})
        .withMessage("Password must be at least 6 characters")
    ],
    validate,
    authController.register
);

//Login

router.post("/login", [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password must be at least 6 characters")
],
validate,
authController.login
);

module.exports = router;