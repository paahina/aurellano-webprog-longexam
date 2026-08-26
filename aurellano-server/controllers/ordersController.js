const Orders = require("../models/orderModel");
const { HttpStatus } = require("../config/constants");
const { isAdmin, forbidIfNotOwner } = require("../middleware/authMiddleware");
const { buildDateSort } = require("../utils/listSort");
const {
  enrichOrderItems,
  groupOrderItemsBySupplier,
  toStoredOrderItems,
  normalizeOrder,
} = require("../utils/orderItems");
const {
  assertOrderStock,
  deductOrderItems,
  restoreOrderItems,
} = require("../utils/stock");
const { parsePagination, paginatedResponse } = require("../utils/pagination");

const isSupplier = (req) => req.user?.userRole === "supplier";

const buildOrderFilter = (req) => {
  if (isAdmin(req)) return {};
  if (isSupplier(req)) return { supplierId: req.user.supplierId };
  return { userId: req.user.id };
};

const forbidIfNotOrderAccess = (order, req, res) => {
  if (isAdmin(req)) return false;
  if (isSupplier(req)) {
    if (!order.supplierId || order.supplierId.toString() !== req.user.supplierId) {
      res.status(HttpStatus.FORBIDDEN).json({
        message: "You do not have permission to access this order",
      });
      return true;
    }
    return false;
  }
  return forbidIfNotOwner(order.userId, req, res);
};

const orderPopulate = (query) =>
  query
    .populate("userId", "firstName lastName email")
    .populate("supplierId", "supplierName")
    .populate("orderItems.productId", "productName productPrice productImage productSlug");

const getOrders = async (req, res) => {
  try {
    const filter = buildOrderFilter(req);
    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.ongoing === "true") {
      filter.orderStatus = { $in: ["pending", "confirmed"] };
    }

    const sortOption = buildDateSort(req.query.sort, "orderedAt", true);
    const { requested, page, limit, skip } = parsePagination(req.query);

    if (requested) {
      const [total, orders] = await Promise.all([
        Orders.countDocuments(filter),
        orderPopulate(Orders.find(filter).sort(sortOption).skip(skip).limit(limit)),
      ]);
      return res.status(HttpStatus.OK).json(
        paginatedResponse({
          data: orders.map(normalizeOrder),
          total,
          page,
          limit,
        })
      );
    }

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
    if (forbidIfNotOrderAccess(order, req, res)) return;
    res.status(HttpStatus.OK).json(normalizeOrder(order));
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  const createdOrders = [];

  try {
    const enriched = await enrichOrderItems(req.body.orderItems);
    const groups = groupOrderItemsBySupplier(enriched);
    const userId = isAdmin(req) && req.body.userId ? req.body.userId : req.user.id;
    const pickupDetails = req.body.pickupDetails;

    for (const [supplierId, groupItems] of groups) {
      const orderItems = toStoredOrderItems(groupItems);
      await assertOrderStock(orderItems);
      await deductOrderItems(orderItems);

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.productPrice * item.quantity,
        0
      );

      const order = await Orders.create({
        userId,
        supplierId,
        orderItems,
        totalAmount,
        pickupDetails,
      });
      createdOrders.push(order);
    }

    const populated = await Promise.all(
      createdOrders.map((order) => orderPopulate(Orders.findById(order._id)))
    );
    res.status(HttpStatus.CREATED).json(populated.map(normalizeOrder));
  } catch (error) {
    for (const order of createdOrders) {
      try {
        await restoreOrderItems(order.orderItems);
        await order.deleteOne();
      } catch {
        // best-effort rollback
      }
    }
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);
    if (!order) return res.status(HttpStatus.NOT_FOUND).json({ message: "Order not found" });
    if (forbidIfNotOrderAccess(order, req, res)) return;

    const payload = { ...req.body };

    if (isSupplier(req)) {
      const allowed = {};
      if (payload.orderStatus !== undefined) allowed.orderStatus = payload.orderStatus;
      if (payload.pickupDetails !== undefined) allowed.pickupDetails = payload.pickupDetails;
      Object.keys(payload).forEach((key) => delete payload[key]);
      Object.assign(payload, allowed);
    } else if (!isAdmin(req)) {
      delete payload.userId;
      delete payload.supplierId;
      delete payload.orderItems;
      delete payload.totalAmount;
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
