const Orders = require("../models/orderModel");
const { HttpStatus } = require("../config/constants");
const { isAdmin, forbidIfNotOwner, ownerFilter } = require("../middleware/authMiddleware");
const { buildDateSort } = require("../utils/listSort");
const { enrichOrderItems, normalizeOrder } = require("../utils/orderItems");
const {
  assertOrderStock,
  deductOrderItems,
  restoreOrderItems,
} = require("../utils/stock");

const orderPopulate = (query) =>
  query
    .populate("userId", "firstName lastName email")
    .populate("orderItems.productId", "productName productPrice productImage productSlug");

const getOrders = async (req, res) => {
  try {
    const filter = ownerFilter(req);
    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.ongoing === "true") {
      filter.orderStatus = { $in: ["pending", "confirmed"] };
    }

    const sortOption = buildDateSort(req.query.sort, "orderedAt", true);

    const orders = await orderPopulate(Orders.find(filter).sort(sortOption));
    res.status(HttpStatus.OK).json(orders.map(normalizeOrder));
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderPopulate(Orders.findById(req.params.id));
    if (!order) return res.status(HttpStatus.NOT_FOUND).json({ message: "Order not found" });
    if (forbidIfNotOwner(order.userId._id || order.userId, req, res)) return;
    res.status(HttpStatus.OK).json(normalizeOrder(order));
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const orderItems = await enrichOrderItems(req.body.orderItems);
    await assertOrderStock(orderItems);
    await deductOrderItems(orderItems);
    const payload = {
      ...req.body,
      orderItems,
      userId: isAdmin(req) && req.body.userId ? req.body.userId : req.user.id,
    };
    const order = await Orders.create(payload);
    res.status(HttpStatus.CREATED).json(normalizeOrder(order));
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);
    if (!order) return res.status(HttpStatus.NOT_FOUND).json({ message: "Order not found" });
    if (forbidIfNotOwner(order.userId, req, res)) return;

    const payload = { ...req.body };
    if (!isAdmin(req)) {
      delete payload.userId;
      if (payload.orderStatus && payload.orderStatus !== "cancelled") {
        return res.status(HttpStatus.FORBIDDEN).json({
          message: "Customers can only cancel their own orders",
        });
      }
    }

    const previousStatus = order.orderStatus;
    const nextStatus = payload.orderStatus ?? previousStatus;

    if (previousStatus !== "cancelled" && nextStatus === "cancelled") {
      await restoreOrderItems(order.orderItems);
    } else if (previousStatus === "cancelled" && nextStatus !== "cancelled") {
      await assertOrderStock(order.orderItems);
      await deductOrderItems(order.orderItems);
    }

    const updated = await orderPopulate(
      Orders.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    );
    res.status(HttpStatus.OK).json(normalizeOrder(updated));
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);
    if (!order) return res.status(HttpStatus.NOT_FOUND).json({ message: "Order not found" });
    if (forbidIfNotOwner(order.userId, req, res)) return;
    await order.deleteOne();
    res.status(HttpStatus.OK).json({ message: "Order deleted" });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
