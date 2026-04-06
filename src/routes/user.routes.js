const express = require("express");
const { body, param } = require("express-validator");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");

const userController = require("../controllers/user.controller");

const router = express.Router();

//All routes require authentication
router.use(authenticate);


//SELF ROUTES

// GET current user
router.get("/me", userController.getCurrentUser);

// UPDATE profile (name/email optional)
router.patch(
  "/me",
  [
    body("name").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters"),
    body("email").optional().isEmail().withMessage("Valid email is required").normalizeEmail(),
  ],
  validate,
  userController.updateCurrentUser,
);

//ADMIN ROUTES

// GET all users
router.get("/", authorize("ADMIN"), userController.getUsers);

// CREATE user (ADMIN)
router.post(
  "/",
  authorize("ADMIN"),
  [
    body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
      .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
      .withMessage("Password must be at least 8 characters and include letters and numbers"),
    body("role").optional().isIn(["VIEWER", "ANALYST", "ADMIN"]).withMessage("Invalid role"),
    body("status").optional().isIn(["ACTIVE", "INACTIVE"]).withMessage("Invalid status"),
  ],
  validate,
  userController.createUser,
);

// GET user by id
router.get(
  "/:id",
  authorize("ADMIN"),
  [param("id").isMongoId().withMessage("Invalid user id")],
  validate,
  userController.getUser,
);

// UPDATE ROLE
router.patch(
  "/:id/role",
  authorize("ADMIN"),
  [
    param("id").isMongoId().withMessage("Invalid user id"),
    body("role")
      .isIn(["VIEWER", "ANALYST", "ADMIN"])
      .withMessage("Invalid role"),
  ],
  validate,
  userController.updateRole,
);

// UPDATE STATUS (FIXED)
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  [
    param("id").isMongoId().withMessage("Invalid user id"),
    body("status").isIn(["ACTIVE", "INACTIVE"]).withMessage("Invalid status"),
  ],
  validate,
  userController.updateStatus,
);

// DEACTIVATE user (ADMIN lifecycle op)
router.delete(
  "/:id",
  authorize("ADMIN"),
  [param("id").isMongoId().withMessage("Invalid user id")],
  validate,
  userController.deactivateUser,
);

module.exports = router;
