export const LOW_STOCK_THRESHOLD = 10;

export const deriveStockStatus = (quantity) => {
  const qty = Math.max(0, Number(quantity) || 0);
  if (qty <= 0) return "out_of_stock";
  if (qty <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
};

export const getCartItemStockIssue = (item) => {
  const product = item.productId || {};
  const stock = product.stockQuantity ?? 0;
  const quantity = item.quantity ?? 0;

  if (stock <= 0) {
    return { blocked: true, message: "Out of stock" };
  }
  if (quantity > stock) {
    return { blocked: true, message: `Only ${stock} available` };
  }
  return { blocked: false, message: "" };
};
