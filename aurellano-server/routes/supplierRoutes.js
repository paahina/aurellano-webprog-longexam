const express = require("express");
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const router = express.Router();

router.get("/getAllSuppliers", getSuppliers);
router.get("/get/:id", getSupplierById);
router.post("/create", createSupplier);
router.put("/update/:id", updateSupplier);
router.delete("/delete/:id", deleteSupplier);

module.exports = router;
