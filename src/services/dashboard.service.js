const FinancialRecord = require("../models/record.model");

const buildDashboardMatch = (user) => {
  // Assignment behavior: VIEWER and ANALYST can read complete
  // dashboard/record datasets, while write operations remain ADMIN-only.
  return { isDeleted: false };
};

//summary
const getSummary = async (user) => {
  const match = buildDashboardMatch(user);

  const result = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0],
          },
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  const totalIncome = result[0]?.totalIncome || 0;
  const totalExpense = result[0]?.totalExpense || 0;

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  };
};

//category totals
const getCategoryTotals = async (user) => {
  const match = buildDashboardMatch(user);

  const result = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id.category",
        type: "$_id.type",
        total: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);
  return result;
};

//Monthly trends
const getMonthlyTrends = async (user) => {
  const match = buildDashboardMatch(user);

  const result = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0],
          },
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        totalIncome: 1,
        totalExpense: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  return result;
};

//Weekly trends (ISO week)
const getWeeklyTrends = async (user) => {
  const match = buildDashboardMatch(user);

  const result = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          isoYear: { $isoWeekYear: "$date" },
          isoWeek: { $isoWeek: "$date" },
        },
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0],
          },
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        isoYear: "$_id.isoYear",
        isoWeek: "$_id.isoWeek",
        totalIncome: 1,
        totalExpense: 1,
      },
    },
    { $sort: { isoYear: 1, isoWeek: 1 } },
  ]);

  return result;
};

// Last 7 days trends (daily)
const getLast7DaysTrends = async (user) => {
  const match = buildDashboardMatch(user);
  
  // Inclusive 7-day window: start of day 6 days ago through end of current day.
  const endOfToday = new Date();
  endOfToday.setUTCHours(23, 59, 59, 999);

  const startOfWindow = new Date(endOfToday);
  startOfWindow.setUTCDate(startOfWindow.getUTCDate() - 6);
  startOfWindow.setUTCHours(0, 0, 0, 0);

  const aggregated = await FinancialRecord.aggregate([
    {
      $match: {
        ...match,
        date: { $gte: startOfWindow, $lte: endOfToday },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0],
          },
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        day: "$_id.day",
        totalIncome: 1,
        totalExpense: 1,
      },
    },
    { $sort: { year: 1, month: 1, day: 1 } },
  ]);

  const byDate = new Map();
  for (const row of aggregated) {
    const keyDate = new Date(Date.UTC(row.year, row.month - 1, row.day));
    const key = keyDate.toISOString().slice(0, 10);
    byDate.set(key, row);
  }

  const filled = [];
  for (let i = 0; i < 7; i += 1) {
    const cursor = new Date(startOfWindow);
    cursor.setUTCDate(startOfWindow.getUTCDate() + i);
    const key = cursor.toISOString().slice(0, 10);
    const existing = byDate.get(key);

    filled.push({
      year: cursor.getUTCFullYear(),
      month: cursor.getUTCMonth() + 1,
      day: cursor.getUTCDate(),
      totalIncome: existing ? Number(existing.totalIncome || 0) : 0,
      totalExpense: existing ? Number(existing.totalExpense || 0) : 0,
    });
  }

  return filled;
};



//Recent activity
const getRecentActivity = async (user) => {
  const match = buildDashboardMatch(user);

  const records = await FinancialRecord.find(match)
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("userId", "name email");

  return records;
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getWeeklyTrends,
  getLast7DaysTrends,
  getRecentActivity,
};