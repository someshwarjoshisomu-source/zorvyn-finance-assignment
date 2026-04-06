const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Indexes for performance optimization
recordSchema.index({ userId: 1 });
recordSchema.index({ date: -1 });
recordSchema.index({ type: 1 });
recordSchema.index({ userId: 1, date: -1 });
recordSchema.index({ userId: 1, type: 1, isDeleted: 1 });


module.exports = mongoose.model("FinancialRecord", recordSchema)