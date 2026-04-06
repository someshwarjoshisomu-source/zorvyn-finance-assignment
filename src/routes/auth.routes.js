const express = require("express");

const { body } = require("express-validator");

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

//Register

router.post(
    "/register",
    [
        body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters"),
        body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
        body("password")
        .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
        .withMessage("Password must be at least 8 characters and include letters and numbers")
    ],
    validate,
    authController.register
);

//Login

router.post("/login", [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
        .isLength({ min: 6, max: 128 })
        .withMessage("Password length must be between 6 and 128 characters")
],
validate,
authController.login
);

module.exports = router;
