const FinancialRecord = require("../models/record.model");

//summary
const getSummary = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
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
const getCategoryTotals = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
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
const getMonthlyTrends = async ()=>{
    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
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
            totalExpense:1,
        }
      },
      { $sort: { year: 1, month: 1}}
    ]);
    return result;
}


//Recent activity
const getRecentActivity = async () => {
    const records = await FinancialRecord.find({ isDeleted: false})
    .sort({ createdAt: -1})
    .limit(10)
    .populate("userId", "name email");

    return records;
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity
};