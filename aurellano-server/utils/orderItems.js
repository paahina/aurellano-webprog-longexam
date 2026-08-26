const Product = require("../models/productModel");

const snapshotFromProduct = (product, item) => ({
  productId: product._id,
  productName: item.productName || product.productName,
  productPrice: item.productPrice ?? product.productPrice,
  quantity: item.quantity,
  productImage: product.productImage || "",
  productSlug: product.productSlug || "",
  supplierId: product.supplierId,
});

const enrichOrderItems = async (orderItems = []) => {
  if (!orderItems.length) return [];

  return Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.productId).select(
        "productName productPrice productImage productSlug supplierId"
      );
      if (!product) {
        throw new Error("One or more products in this order were not found.");
      }
      if (!product.supplierId) {
        throw new Error(`Product ${product.productName} is missing a supplier.`);
      }
      return snapshotFromProduct(product, item);
    })
  );
};

const groupOrderItemsBySupplier = (items = []) => {
  const groups = new Map();
  items.forEach((item) => {
    const supplierId = item.supplierId?.toString?.();
    if (!supplierId) {
      throw new Error("One or more products are missing a supplier.");
    }
    if (!groups.has(supplierId)) groups.set(supplierId, []);
    groups.get(supplierId).push(item);
  });
  return groups;
};

const toStoredOrderItems = (items = []) =>
  items.map(({ supplierId, ...item }) => item);

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
  groupOrderItemsBySupplier,
  toStoredOrderItems,
  normalizeOrder,
  normalizeOrderItems,
};
