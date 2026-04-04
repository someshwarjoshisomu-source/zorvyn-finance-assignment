const express = require("express");
const { body } = require("express-validator");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");

const recordController = require("../controllers/record.controller");

const router = express.Router();

router.use(authenticate);

//GET ALL RECORDS
router.get(
  "/",
  authorize("VIEWER", "ANALYST", "ADMIN"),
  recordController.getRecords,
);

//GET record
router.get(
  "/:id",
  authorize("VIEWER", "ANALYST", "ADMIN"),
  recordController.getRecord,
);

//validation rules

const createValidation = [
  body("amount").isNumeric().withMessage("Amount must be a number"),
  body("type").isIn(["INCOME", "EXPENSE"]).withMessage("Invalid type"),
  body("category").notEmpty().withMessage("Category is required"),
  body("date").isISO8601().withMessage("Invalid date"),
];

const updateValidation = [
  body("amount").optional().isNumeric().withMessage("Amount must be a number"),
  body("type")
    .optional()
    .isIn(["INCOME", "EXPENSE"])
    .withMessage("Invalid type"),
  body("category").optional().notEmpty().withMessage("Category is required"),
  body("date").optional().isISO8601().withMessage("Invalid date"),
];

//Create (ADMIN only)
router.post(
    "/",
    authorize("ADMIN"),
    createValidation,
    validate,
    recordController.createRecord
)

//Update(admin only)

router.patch(
  "/:id",
  authorize("ADMIN"),
  updateValidation,
  validate,
  recordController.updateRecord,
);

//delete
router.delete(
  "/:id",
  authorize("ADMIN"),
  recordController.deleteRecord,
);

module.exports = router