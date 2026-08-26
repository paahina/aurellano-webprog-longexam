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
router.post("/create", protect, authorize("Admin", "supplier"), createProduct);
router.put("/update/:id", protect, authorize("Admin", "supplier"), updateProduct);
router.delete("/delete/:id", protect, authorize("Admin", "supplier"), deleteProduct);

router.get("/v1", getProducts);
router.get("/v1/slug/:slug", getProductBySlug);
router.get("/v1/:id", getProductById);

router.get("/supplier/v1", protect, authorize("supplier"), getProducts);

router.post("/v1", protect, authorize("Admin", "supplier"), createProduct);
router.put("/v1/:id", protect, authorize("Admin", "supplier"), updateProduct);
router.delete("/v1/:id", protect, authorize("Admin", "supplier"), deleteProduct);

module.exports = router;
