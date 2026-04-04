const express = require("express");
const { body } = require("express-validator");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");

const userController = require("../controllers/user.controller");

const router = express.Router();

//all routes require authentication

router.use(authenticate);

//GET all users(admin only)
router.get("/", authorize("ADMIN"), userController.getUsers);

//GET user by id (admin only)
router.get("/:id", authorize("ADMIN"), userController.getUser);

//UPDATE ROLE (ADMIN only)

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

//UPDATE Status (ADMIN only)

router.patch(
  "/:id/status",
  authorize("ADMIN"),
  [body("status").isIn(["ACTIVE", "INACTIVE"]).withMessage("Invalid status")],
  validate,
  userController.updateRole,
);

module.exports = router;