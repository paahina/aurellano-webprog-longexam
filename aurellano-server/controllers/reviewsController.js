const Reviews = require("../models/reviewModel");
const { HttpStatus } = require("../config/constants");
const { isAdmin, forbidIfNotOwner } = require("../middleware/authMiddleware");

const reviewPopulate = (query) =>
  query.populate("userId", "firstName lastName").populate("productId", "productName");

const getReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.productId) filter.productId = req.query.productId;
    const reviews = await reviewPopulate(Reviews.find(filter));
    res.status(HttpStatus.OK).json(reviews);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await reviewPopulate(Reviews.findById(req.params.id));
    if (!review) return res.status(HttpStatus.NOT_FOUND).json({ message: "Review not found" });
    res.status(HttpStatus.OK).json(review);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const payload = { ...req.body, userId: isAdmin(req) && req.body.userId ? req.body.userId : req.user.id };
    const review = await Reviews.create(payload);
    res.status(HttpStatus.CREATED).json(review);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Reviews.findById(req.params.id);
    if (!review) return res.status(HttpStatus.NOT_FOUND).json({ message: "Review not found" });
    if (forbidIfNotOwner(review.userId, req, res)) return;

    const payload = { ...req.body };
    if (!isAdmin(req)) {
      delete payload.userId;
      delete payload.productId;
    }

    const updated = await reviewPopulate(
      Reviews.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    );
    res.status(HttpStatus.OK).json(updated);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Reviews.findById(req.params.id);
    if (!review) return res.status(HttpStatus.NOT_FOUND).json({ message: "Review not found" });
    if (forbidIfNotOwner(review.userId, req, res)) return;
    await review.deleteOne();
    res.status(HttpStatus.OK).json({ message: "Review deleted" });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
