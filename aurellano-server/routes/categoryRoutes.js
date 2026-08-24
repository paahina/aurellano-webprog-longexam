const express = require("express");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/getAllCategories", getCategories);
router.get("/get/:id", getCategoryById);
router.post("/create", protect, authorize("Admin"), createCategory);
router.put("/update/:id", protect, authorize("Admin"), updateCategory);
router.delete("/delete/:id", protect, authorize("Admin"), deleteCategory);

module.exports = router;
