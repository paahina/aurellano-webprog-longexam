const mongoose = require("mongoose");

const reviewsSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewRating: { type: Number, required: true, min: 1, max: 5 },
    reviewComment: { type: String, trim: true },
  },
  { timestamps: true }
);

reviewsSchema.index({ productId: 1 });
reviewsSchema.index({ userId: 1 });
reviewsSchema.index({ productId: 1, userId: 1 });
reviewsSchema.index({ reviewRating: 1 });

module.exports = mongoose.model("Reviews", reviewsSchema, "reviews");
