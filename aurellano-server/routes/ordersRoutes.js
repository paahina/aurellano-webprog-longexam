const express = require("express");
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/ordersController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/getAllOrders", protect, authorize("customer", "Admin", "supplier"), getOrders);
router.get("/get/:id", protect, authorize("customer", "Admin", "supplier"), getOrderById);
router.post("/create", protect, authorize("customer", "Admin"), createOrder);
router.put("/update/:id", protect, authorize("customer", "Admin", "supplier"), updateOrder);
router.delete("/delete/:id", protect, authorize("Admin"), deleteOrder);

module.exports = router;
