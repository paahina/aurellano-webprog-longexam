const express = require("express");
const {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/getAllProducts", getProducts);
router.get("/get/slug/:slug", getProductBySlug);
router.get("/get/:id", getProductById);
router.post("/create", protect, authorize("Admin"), createProduct);
router.put("/update/:id", protect, authorize("Admin"), updateProduct);
router.delete("/delete/:id", protect, authorize("Admin"), deleteProduct);

router.get("/v1", getProducts);
router.get("/v1/slug/:slug", getProductBySlug);
router.get("/v1/:id", getProductById);
router.post("/v1", protect, authorize("Admin"), createProduct);
router.put("/v1/:id", protect, authorize("Admin"), updateProduct);
router.delete("/v1/:id", protect, authorize("Admin"), deleteProduct);

module.exports = router;
