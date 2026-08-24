const express = require("express");
const {
  getCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
} = require("../controllers/cartController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("customer", "Admin"));

router.get("/getAllCarts", getCarts);
router.get("/get/:id", getCartById);
router.post("/create", createCart);
router.put("/update/:id", updateCart);
router.delete("/delete/:id", deleteCart);

module.exports = router;
