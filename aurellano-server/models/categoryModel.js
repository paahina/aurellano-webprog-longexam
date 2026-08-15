const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true, unique: true, trim: true },
    categoryDescription: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema, "category");
