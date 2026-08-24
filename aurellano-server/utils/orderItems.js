const Product = require("../models/productModel");

const snapshotFromProduct = (product, item) => ({
  productId: product._id,
  productName: item.productName || product.productName,
  productPrice: item.productPrice ?? product.productPrice,
  quantity: item.quantity,
  productImage: product.productImage || "",
  productSlug: product.productSlug || "",
});

const enrichOrderItems = async (orderItems = []) => {
  if (!orderItems.length) return [];

  return Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.productId).select(
        "productName productPrice productImage productSlug"
      );
      if (!product) {
        throw new Error("One or more products in this order were not found.");
      }
      return snapshotFromProduct(product, item);
    })
  );
};

const normalizeOrderItems = (orderItems = []) =>
  orderItems.map((item) => {
    const product = item.productId && typeof item.productId === "object" ? item.productId : null;
    return {
      ...item,
      productId: product?._id || item.productId,
      productName: item.productName || product?.productName || "Product",
      productPrice: item.productPrice ?? product?.productPrice ?? 0,
      productImage: item.productImage || product?.productImage || "",
      productSlug: item.productSlug || product?.productSlug || "",
    };
  });

const normalizeOrder = (order) => {
  const plain = order.toObject ? order.toObject() : { ...order };
  plain.orderItems = normalizeOrderItems(plain.orderItems);
  return plain;
};

module.exports = {
  enrichOrderItems,
  normalizeOrder,
  normalizeOrderItems,
};
