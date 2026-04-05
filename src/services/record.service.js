const FinancialRecord = require("../models/record.model");
const ApiError = require("../utils/ApiError");

// CREATE
const createRecord = async (userId, data) => {
  const record = new FinancialRecord({
    userId,
    amount: data.amount,
    type: data.type,
    category: data.category,
    date: data.date,
    notes: data.notes,
  });

  await record.save();
  return record;
};

// GET ALL (WITH RBAC)
const getRecords = async (user, filters, page = 1, limit = 10) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  // RBAC: restrict for non-admin
  if (user.role !== "ADMIN") {
    query.userId = user._id;
  }

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }

  // Sanitize search
  if (filters.search) {
    const safeSearch = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    query.$or = [
      { category: { $regex: safeSearch, $options: "i" } },
      { notes: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const records = await FinancialRecord.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "name email");

  const totalCount = await FinancialRecord.countDocuments(query);

  return {
    records,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
};

// GET ONE
const getRecordById = async (user, id) => {
  const record = await FinancialRecord.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!record) throw new ApiError(404, "Record not found");

  // Ownership check
  if (
    user.role !== "ADMIN" &&
    record.userId.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized access");
  }


  return record;
};

// UPDATE
const updateRecord = async (user, id, data) => {
  const record = await FinancialRecord.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!record) throw new ApiError(404, "Record not found");

  // Ownership check
  if (
    user.role !== "ADMIN" &&
    record.userId.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized access");
  }

  if (data.amount !== undefined) record.amount = data.amount;
  if (data.type !== undefined) record.type = data.type;
  if (data.category !== undefined) record.category = data.category;
  if (data.date !== undefined) record.date = data.date;
  if (data.notes !== undefined) record.notes = data.notes;

  await record.save();

  return record;
};

// DELETE
const deleteRecord = async (user, id) => {
  const record = await FinancialRecord.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!record) throw new ApiError(404, "Record not found");

  // Ownership check
  if (
    user.role !== "ADMIN" &&
    record.userId.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized access");
  }

  record.isDeleted = true;
  await record.save();

  return { message: "Record deleted" };
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
