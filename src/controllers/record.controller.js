const recordService = require("../services/record.service")

const createRecord = async (req, res, next) => {
    try{
        const record = await  recordService.createRecord(
            req.user.id,
            req.body
        );
        res.status(201).json({
            success:true,
            record
        });
    }catch(err){
        next(err);
    }
};

const getRecords = async (req, res, next) => {
    try{
        const records = await recordService.getRecords(req.query);

        res.status(200).json({
            success:true,
            count: records.length,
            records
        });
    }catch (err){
        next(err);
    }
};


const getRecord = async (req, res, next) => {
    try{
        const record = await recordService.getRecordById(
            req.params.id
        );

        res.status(200).json({
            success:true,
            record
        });
    }catch (err){
        next(err);
    }
};


const updateRecord = async (req, res, next) => {
    try{
        const record = await recordService.updateRecord(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success:true,
            record
        });
    }catch (err){
        next(err);
    }
};


const deleteRecord = async (req, res, next) => {
  try {
    const record = await recordService.deleteRecord(req.params.id);

    res.status(200).json({
      success: true,
      message: "Record deleted"
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