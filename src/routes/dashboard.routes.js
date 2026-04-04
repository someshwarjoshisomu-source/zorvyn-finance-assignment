const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const dashboardController = require("../controllers/dashboard.controller");

const router = express.Router();


router.use(authenticate);

//Summary (all roles)
router.get(
    "/summary",
    authorize("VIEWER", "ANALYST", "ADMIN"),
    dashboardController.getSummary
);

// Category totals (ANALYST, ADMIN)
router.get(
  "/categories",
  authorize("ANALYST", "ADMIN"),
  dashboardController.getCategoryTotals
);

// Monthly trends (ANALYST, ADMIN)
router.get(
  "/trends",
  authorize("ANALYST", "ADMIN"),
  dashboardController.getMonthlyTrends
);

// Recent activity (all roles)
router.get(
  "/recent",
  authorize("VIEWER", "ANALYST", "ADMIN"),
  dashboardController.getRecentActivity
);

module.exports = router;