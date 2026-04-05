const recordService = require("../services/record.service");

const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.user._id, req.body);

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const { page, limit, ...filters } = req.query;

    const result = await recordService.getRecords(
      req.user,
      filters,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      count: result.totalCount,
      records: result.records,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    });
  } catch (err) {
    next(err);
  }
};

const getRecord = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.user, req.params.id);

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(
      req.user,
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    await recordService.deleteRecord(req.user, req.params.id);

    res.status(200).json({
      success: true,
      data: null,
      message: "Record deleted",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
};
