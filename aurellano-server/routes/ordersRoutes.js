const express = require("express");
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/ordersController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { createOrderValidation, mongoIdParamValidation } = require("../middleware/validationMiddleware");
const { writeApiLimiter } = require("../middleware/rateLimiterMiddleware");

const router = express.Router();

router.get("/getAllOrders", protect, authorize("customer", "Admin", "supplier"), getOrders);
router.get(
  "/get/:id",
  protect,
  authorize("customer", "Admin", "supplier"),
  mongoIdParamValidation,
  getOrderById,
);
router.post(
  "/create",
  writeApiLimiter,
  protect,
  authorize("customer", "Admin"),
  createOrderValidation,
  createOrder,
);
router.put(
  "/update/:id",
  writeApiLimiter,
  protect,
  authorize("customer", "Admin", "supplier"),
  mongoIdParamValidation,
  updateOrder,
);
router.delete(
  "/delete/:id",
  writeApiLimiter,
  protect,
  authorize("Admin"),
  mongoIdParamValidation,
  deleteOrder,
);

module.exports = router;
