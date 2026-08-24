const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    productSlug: { type: String, required: true, unique: true, trim: true },
    productDescription: { type: String, required: true },
    productPrice: { type: Number, required: true, min: 0 },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    productImage: { type: String, default: "", trim: true },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    stockStatus: { type: String, required: true, default: "in_stock", trim: true },
  },
  { timestamps: true }
);

productSchema.index({ productName: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ supplierId: 1 });
productSchema.index({ stockStatus: 1 });
productSchema.index({ productPrice: 1 });

module.exports = mongoose.model("Product", productSchema, "product");
