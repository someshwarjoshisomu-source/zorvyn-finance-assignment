const FinancialRecord = require("../models/record.model");
const ApiError = require("../utils/ApiError");

const buildRecordScope = (user) => {
  // Assignment behavior: VIEWER and ANALYST are read-only but can
  // view the complete dataset created/managed by ADMIN.
  return { isDeleted: false };
};

const toValidDate = (value, label) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `${label} is invalid`);
  }
  return parsed;
};

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

// GET ALL (GLOBAL VISIBILITY)
const getRecords = async (_user, filters, page = 1, limit = 10) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const skip = (page - 1) * limit;

  const query = buildRecordScope(_user);

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;

  if (filters.startDate || filters.endDate) {
    const parsedStartDate = toValidDate(filters.startDate, "startDate");
    const parsedEndDate = toValidDate(filters.endDate, "endDate");

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      throw new ApiError(400, "startDate must be less than or equal to endDate");
    }

    query.date = {};
    if (parsedStartDate) {
      parsedStartDate.setUTCHours(0, 0, 0, 0);
      query.date.$gte = parsedStartDate;
    }

    if (parsedEndDate) {
      parsedEndDate.setUTCHours(23, 59, 59, 999);
      query.date.$lte = parsedEndDate;
    }
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
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    currentPage: page,
  };
};

// GET ONE
const getRecordById = async (_user, id) => {
  const scope = buildRecordScope(_user);
  const record = await FinancialRecord.findOne({
    _id: id,
    ...scope,
  });

  if (!record) throw new ApiError(404, "Record not found");

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
