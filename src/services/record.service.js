const FinancialRecord = require("../models/record.model");

//create record

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
}

//get record with filters

const getRecords = async (filters) => {
    const query = { isDeleted: false };

    if(filters.type){
        query.type = filters.type;
    }

    if(filters.category){
        query.category = filters.category;
    }

    if(filters.startDate || filters.endDate){
        query.date = {};
        if(filters.startDate){
            query.date.$gte = new Date(filters.startDate);
        }
        if(filters.endDate){
            query.date.$lte = new Date(filters.endDate);
        }
    }

    const records = await FinancialRecord.find(query)
    .sort({date:-1})
    .populate("userId", "name email");

    return records;
}

//get single record
const getRecordById = async (id)=>{
    const record = await FinancialRecord.findOne({
        _id: id,
        isDeleted: false
    });

    if(!record) {
        throw new Error("Record not found");
    }

    return record;
};

//update record

const updateRecord = async (id, data) => {
    const record = await FinancialRecord.findOne({
      _id: id,
      isDeleted: false
    });

    if (!record) {
      throw new Error("Record not found");
    }

    if(data.amount !== undefined) record.amount = data.amount
    if(data.type !== undefined) record.type = data.type
    if(data.category !== undefined) record.category = data.category
    if(data.date !== undefined) record.date = data.date
    if(data.notes !== undefined) record.notes = data.notes

    await record.save();

    return record;
}

//soft delete

const deleteRecord = async (id) => {
    const record = await FinancialRecord.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!record) {
      throw new Error("Record not found");
    }

    record.isDeleted = true;
    await record.save();

    return { message: "Record deleted"};
}

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};