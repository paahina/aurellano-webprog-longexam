const Orders = require("../models/orderModel");
const { HttpStatus } = require("../config/constants");

const getOrders = async (req, res) => {
  try {
    const orders = await Orders.find()
      .populate("userId", "firstName lastName email")
      .populate("orderItems.productId", "productName productPrice");
    res.status(HttpStatus.OK).json(orders);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id)
      .populate("userId", "firstName lastName email")
      .populate("orderItems.productId", "productName productPrice");
    if (!order) return res.status(HttpStatus.NOT_FOUND).json({ message: "Order not found" });
    res.status(HttpStatus.OK).json(order);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const order = await Orders.create(req.body);
    res.status(HttpStatus.CREATED).json(order);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Orders.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!order) return res.status(HttpStatus.NOT_FOUND).json({ message: "Order not found" });
    res.status(HttpStatus.OK).json(order);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Orders.findByIdAndDelete(req.params.id);
    if (!order) return res.status(HttpStatus.NOT_FOUND).json({ message: "Order not found" });
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
