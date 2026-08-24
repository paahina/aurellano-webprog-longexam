const express = require("express");
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/getAllSuppliers", getSuppliers);
router.get("/get/:id", getSupplierById);
router.post("/create", protect, authorize("Admin"), createSupplier);
router.put("/update/:id", protect, authorize("Admin"), updateSupplier);
router.delete("/delete/:id", protect, authorize("Admin"), deleteSupplier);

module.exports = router;
