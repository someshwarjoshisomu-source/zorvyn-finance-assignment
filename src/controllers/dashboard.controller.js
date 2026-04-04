const dashboardService = require("../services/dashboard.service")

const getSummary = async (req, res, next) => {
    try {
        const data = await dashboardService.getSummary();

        res.status(200).json({
            success: true,
            data
        });
    }catch(err){
        next(err);
    }
};

const getCategoryTotals = async (req, res, next) => {
  try {
    const data = await dashboardService.getCategoryTotals();

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
    const data = await dashboardService.getMonthlyTrends();

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
    const data = await dashboardService.getRecentActivity();

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
    getRecentActivity
}

