const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    orderItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: { type: String, required: true, trim: true },
        productPrice: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        productImage: { type: String, default: "", trim: true },
        productSlug: { type: String, default: "", trim: true },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending",
    },
    pickupDetails: { type: String, trim: true },
  },
  { timestamps: { createdAt: "orderedAt", updatedAt: "updatedAt" } },
);

ordersSchema.index({ userId: 1 });
ordersSchema.index({ orderStatus: 1 });
ordersSchema.index({ orderedAt: -1 });
ordersSchema.index({ userId: 1, orderStatus: 1 });
ordersSchema.index({ supplierId: 1, orderStatus: 1 });
ordersSchema.index({ "orderItems.productId": 1 });

module.exports = mongoose.model("Orders", ordersSchema, "orders");
