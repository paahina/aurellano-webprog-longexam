const express = require("express");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  categoryValidation,
  categoryUpdateValidation,
  mongoIdParamValidation,
} = require("../middleware/validationMiddleware");
const { writeApiLimiter } = require("../middleware/rateLimiterMiddleware");

const router = express.Router();

router.get("/getAllCategories", getCategories);
router.get("/get/:id", mongoIdParamValidation, getCategoryById);
router.post(
  "/create",
  writeApiLimiter,
  protect,
  authorize("Admin"),
  categoryValidation,
  createCategory,
);
router.put(
  "/update/:id",
  writeApiLimiter,
  protect,
  authorize("Admin"),
  mongoIdParamValidation,
  categoryUpdateValidation,
  updateCategory,
);
router.delete(
  "/delete/:id",
  writeApiLimiter,
  protect,
  authorize("Admin"),
  mongoIdParamValidation,
  deleteCategory,
);

module.exports = router;
