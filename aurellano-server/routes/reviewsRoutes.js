const express = require("express");
const {
  getReviews,
  getReviewById,
  getReviewable,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewsController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  reviewValidation,
  reviewUpdateValidation,
  mongoIdParamValidation,
} = require("../middleware/validationMiddleware");
const { writeApiLimiter } = require("../middleware/rateLimiterMiddleware");

const router = express.Router();

router.get("/getAllReviews", getReviews);
router.get(
  "/supplier/getAllReviews",
  protect,
  authorize("supplier"),
  getReviews
);
router.get(
  "/customer/getReviewable",
  protect,
  authorize("customer", "Admin"),
  getReviewable
);
router.get("/get/:id", mongoIdParamValidation, getReviewById);
router.post(
  "/create",
  writeApiLimiter,
  protect,
  authorize("customer", "Admin"),
  reviewValidation,
  createReview,
);
router.put(
  "/update/:id",
  writeApiLimiter,
  protect,
  authorize("customer", "Admin"),
  mongoIdParamValidation,
  reviewUpdateValidation,
  updateReview,
);
router.delete(
  "/delete/:id",
  writeApiLimiter,
  protect,
  authorize("customer", "Admin"),
  mongoIdParamValidation,
  deleteReview,
);

module.exports = router;
