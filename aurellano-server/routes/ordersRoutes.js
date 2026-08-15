const express = require("express");
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/ordersController");

const router = express.Router();

router.get("/getAllOrders", getOrders);
router.get("/get/:id", getOrderById);
router.post("/create", createOrder);
router.put("/update/:id", updateOrder);
router.delete("/delete/:id", deleteOrder);

module.exports = router;
