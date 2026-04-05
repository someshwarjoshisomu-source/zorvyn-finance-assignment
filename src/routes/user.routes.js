const express = require("express");
const { body } = require("express-validator");

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
  [body("name").optional().isString(), body("email").optional().isEmail()],
  validate,
  userController.updateCurrentUser,
);

//ADMIN ROUTES

// GET all users
router.get("/", authorize("ADMIN"), userController.getUsers);

// GET user by id
router.get("/:id", authorize("ADMIN"), userController.getUser);

// UPDATE ROLE
router.patch(
  "/:id/role",
  authorize("ADMIN"),
  [
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
  [body("status").isIn(["ACTIVE", "INACTIVE"]).withMessage("Invalid status")],
  validate,
  userController.updateStatus,
);

module.exports = router;
