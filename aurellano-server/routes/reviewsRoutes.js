const express = require("express");
const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewsController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/getAllReviews", getReviews);
router.get("/get/:id", getReviewById);
router.post("/create", protect, authorize("customer", "Admin"), createReview);
router.put("/update/:id", protect, authorize("customer", "Admin"), updateReview);
router.delete("/delete/:id", protect, authorize("customer", "Admin"), deleteReview);

module.exports = router;
