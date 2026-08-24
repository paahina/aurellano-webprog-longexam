const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/getAllProducts", getProducts);
router.get("/get/:id", getProductById);
router.post("/create", protect, authorize("Admin"), createProduct);
router.put("/update/:id", protect, authorize("Admin"), updateProduct);
router.delete("/delete/:id", protect, authorize("Admin"), deleteProduct);

module.exports = router;
