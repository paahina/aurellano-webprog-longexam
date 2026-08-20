const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supplierName: { type: String, required: true, unique: true, trim: true },
    supplierDescription: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema, "supplier");
