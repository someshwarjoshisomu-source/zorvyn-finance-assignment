const dashboardService = require("../services/dashboard.service");

const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary(req.user);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getCategoryTotals = async (req, res, next) => {
  try {
    const data = await dashboardService.getCategoryTotals(req.user);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getMonthlyTrends(req.user);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getWeeklyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getWeeklyTrends(req.user);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getLast7DaysTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getLast7DaysTrends(req.user);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecentActivity(req.user);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getWeeklyTrends,
  getLast7DaysTrends,
  getRecentActivity,
};

