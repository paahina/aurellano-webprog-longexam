const express = require("express");
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  supplierValidation,
  supplierUpdateValidation,
  mongoIdParamValidation,
} = require("../middleware/validationMiddleware");
const { writeApiLimiter } = require("../middleware/rateLimiterMiddleware");

const router = express.Router();

router.get("/getAllSuppliers", getSuppliers);
router.get("/get/:id", mongoIdParamValidation, getSupplierById);
router.post(
  "/create",
  writeApiLimiter,
  protect,
  authorize("Admin"),
  supplierValidation,
  createSupplier,
);
router.put(
  "/update/:id",
  writeApiLimiter,
  protect,
  authorize("Admin", "supplier"),
  mongoIdParamValidation,
  supplierUpdateValidation,
  updateSupplier,
);
router.delete(
  "/delete/:id",
  writeApiLimiter,
  protect,
  authorize("Admin"),
  mongoIdParamValidation,
  deleteSupplier,
);

module.exports = router;
