const Product = require("../models/productModel");

const LOW_STOCK_THRESHOLD = 10;

const deriveStockStatus = (quantity) => {
  const qty = Math.max(0, Number(quantity) || 0);
  if (qty <= 0) return "out_of_stock";
  if (qty <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
};

const normalizeProductPayload = (body) => {
  const payload = { ...body };
  if (payload.stockQuantity !== undefined) {
    payload.stockQuantity = Math.max(0, Number(payload.stockQuantity) || 0);
    payload.stockStatus = deriveStockStatus(payload.stockQuantity);
  } else {
    delete payload.stockStatus;
  }
  return payload;
};

const applyStockUpdate = async (productId, delta) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found.");
  }

  const newQty = product.stockQuantity + delta;
  if (newQty < 0) {
    throw new Error(`Insufficient stock for ${product.productName}.`);
  }

  product.stockQuantity = newQty;
  product.stockStatus = deriveStockStatus(newQty);
  await product.save();
  return product;
};

const validateCartItems = async (cartItems = []) => {
  for (const item of cartItems) {
    const product = await Product.findById(item.productId).select("productName stockQuantity");
    if (!product) {
      throw new Error("One or more products in your cart were not found.");
    }
    if (product.stockQuantity <= 0) {
      throw new Error(`${product.productName} is out of stock.`);
    }
    if (item.quantity > product.stockQuantity) {
      throw new Error(`Only ${product.stockQuantity} of ${product.productName} available.`);
    }
  }
};

const assertOrderStock = async (orderItems = []) => {
  for (const item of orderItems) {
    const product = await Product.findById(item.productId).select("productName stockQuantity");
    if (!product) {
      throw new Error("One or more products in this order were not found.");
    }
    if (product.stockQuantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.productName}.`);
    }
  }
};

const deductOrderItems = async (orderItems = []) => {
  for (const item of orderItems) {
    await applyStockUpdate(item.productId, -item.quantity);
  }
};

const restoreOrderItems = async (orderItems = []) => {
  for (const item of orderItems) {
    await applyStockUpdate(item.productId, item.quantity);
  }
};

module.exports = {
  LOW_STOCK_THRESHOLD,
  deriveStockStatus,
  normalizeProductPayload,
  validateCartItems,
  assertOrderStock,
  deductOrderItems,
  restoreOrderItems,
};
