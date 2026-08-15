const express = require("express");
const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewsController");

const router = express.Router();

router.get("/getAllReviews", getReviews);
router.get("/get/:id", getReviewById);
router.post("/create", createReview);
router.put("/update/:id", updateReview);
router.delete("/delete/:id", deleteReview);

module.exports = router;
