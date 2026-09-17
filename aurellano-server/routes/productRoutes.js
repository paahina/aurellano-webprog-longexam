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
const {
  productValidation,
  productUpdateValidation,
  mongoIdParamValidation,
} = require("../middleware/validationMiddleware");
const { writeApiLimiter } = require("../middleware/rateLimiterMiddleware");

const router = express.Router();

router.get("/getAllProducts", getProducts);
router.get("/get/slug/:slug", getProductBySlug);
router.get("/get/:id", mongoIdParamValidation, getProductById);
router.post(
  "/create",
  writeApiLimiter,
  protect,
  authorize("Admin", "supplier"),
  productValidation,
  createProduct,
);
router.put(
  "/update/:id",
  writeApiLimiter,
  protect,
  authorize("Admin", "supplier"),
  mongoIdParamValidation,
  productUpdateValidation,
  updateProduct,
);
router.delete(
  "/delete/:id",
  writeApiLimiter,
  protect,
  authorize("Admin", "supplier"),
  mongoIdParamValidation,
  deleteProduct,
);

router.get("/v1", getProducts);
router.get("/v1/slug/:slug", getProductBySlug);
router.get("/v1/:id", mongoIdParamValidation, getProductById);

router.get("/supplier/v1", protect, authorize("supplier"), getProducts);

router.post(
  "/v1",
  writeApiLimiter,
  protect,
  authorize("Admin", "supplier"),
  productValidation,
  createProduct,
);
router.put(
  "/v1/:id",
  writeApiLimiter,
  protect,
  authorize("Admin", "supplier"),
  mongoIdParamValidation,
  productUpdateValidation,
  updateProduct,
);
router.delete(
  "/v1/:id",
  writeApiLimiter,
  protect,
  authorize("Admin", "supplier"),
  mongoIdParamValidation,
  deleteProduct,
);

module.exports = router;
