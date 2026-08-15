const express = require("express");
const {
  getCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
} = require("../controllers/cartController");

const router = express.Router();

router.get("/getAllCarts", getCarts);
router.get("/get/:id", getCartById);
router.post("/create", createCart);
router.put("/update/:id", updateCart);
router.delete("/delete/:id", deleteCart);

module.exports = router;
