const Reviews = require("../models/reviewModel");
const { HttpStatus } = require("../config/constants");

const getReviews = async (req, res) => {
  try {
    const reviews = await Reviews.find()
      .populate("userId", "firstName lastName")
      .populate("productId", "productName");
    res.status(HttpStatus.OK).json(reviews);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await Reviews.findById(req.params.id)
      .populate("userId", "firstName lastName")
      .populate("productId", "productName");
    if (!review) return res.status(HttpStatus.NOT_FOUND).json({ message: "Review not found" });
    res.status(HttpStatus.OK).json(review);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const review = await Reviews.create(req.body);
    res.status(HttpStatus.CREATED).json(review);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Reviews.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) return res.status(HttpStatus.NOT_FOUND).json({ message: "Review not found" });
    res.status(HttpStatus.OK).json(review);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Reviews.findByIdAndDelete(req.params.id);
    if (!review) return res.status(HttpStatus.NOT_FOUND).json({ message: "Review not found" });
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
