const express = require("express");
const { body, query, param } = require("express-validator");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");

const recordController = require("../controllers/record.controller");

const router = express.Router();

router.use(authenticate);

const getRecordsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100"),
  query("type")
    .optional()
    .isIn(["INCOME", "EXPENSE"])
    .withMessage("Invalid type"),
  query("category")
    .optional()
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage("category must be between 1 and 64 characters"),
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("search must be at most 100 characters"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be a valid ISO8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid ISO8601 date"),
  query("endDate").optional().custom((endDate, { req }) => {
    if (!req.query.startDate) return true;
    if (new Date(req.query.startDate) > new Date(endDate)) {
      throw new Error("endDate must be greater than or equal to startDate");
    }
    return true;
  }),
];

const recordIdValidation = [
  param("id").isMongoId().withMessage("Invalid record id"),
];

//GET ALL RECORDS
router.get(
  "/",
  authorize("VIEWER", "ANALYST", "ADMIN"),
  getRecordsValidation,
  validate,
  recordController.getRecords,
);

//GET record
router.get(
  "/:id",
  authorize("VIEWER", "ANALYST", "ADMIN"),
  recordIdValidation,
  validate,
  recordController.getRecord,
);

//validation rules

const createValidation = [
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
  body("type").isIn(["INCOME", "EXPENSE"]).withMessage("Invalid type"),
  body("category").trim().isLength({ min: 1, max: 64 }).withMessage("Category is required and must be at most 64 characters"),
  body("date").isISO8601().withMessage("Invalid date").toDate(),
  body("notes").optional().trim().isLength({ max: 500 }).withMessage("Notes can be at most 500 characters"),
];

const updateValidation = [
  body("amount").optional().isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
  body("type")
    .optional()
    .isIn(["INCOME", "EXPENSE"])
    .withMessage("Invalid type"),
  body("category").optional().trim().isLength({ min: 1, max: 64 }).withMessage("Category must be between 1 and 64 characters"),
  body("date").optional().isISO8601().withMessage("Invalid date").toDate(),
  body("notes").optional().trim().isLength({ max: 500 }).withMessage("Notes can be at most 500 characters"),
];

// Create (ADMIN only)
router.post(
    "/",
    authorize("ADMIN"),
    createValidation,
    validate,
    recordController.createRecord
)

// Update (ADMIN only)

router.patch(
  "/:id",
  authorize("ADMIN"),
  recordIdValidation,
  updateValidation,
  validate,
  recordController.updateRecord
);

// Support PUT for backward compatibility with older frontend calls.
router.put(
  "/:id",
  authorize("ADMIN"),
  recordIdValidation,
  updateValidation,
  validate,
  recordController.updateRecord
);

// Delete (soft delete) - ADMIN only
router.delete(
  "/:id",
  authorize("ADMIN"),
  recordIdValidation,
  validate,
  recordController.deleteRecord
);

module.exports = router;