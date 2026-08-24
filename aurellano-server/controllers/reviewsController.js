const mongoose = require("mongoose");
const Reviews = require("../models/reviewModel");
const { HttpStatus } = require("../config/constants");
const { isAdmin, forbidIfNotOwner } = require("../middleware/authMiddleware");
const { buildDateSort } = require("../utils/listSort");

const reviewPopulate = (query) =>
  query.populate("userId", "firstName lastName").populate("productId", "productName productImage");

const shapeReview = (doc) => {
  const user = doc.userDoc?.[0] || doc.userId;
  const product = doc.productDoc?.[0] || doc.productId;
  return {
    _id: doc._id,
    productId: product
      ? { _id: product._id, productName: product.productName }
      : doc.productId,
    userId: user
      ? { _id: user._id, firstName: user.firstName, lastName: user.lastName }
      : doc.userId,
    reviewRating: doc.reviewRating,
    reviewComment: doc.reviewComment,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const getReviews = async (req, res) => {
  try {
    const { productId, search, sort } = req.query;
    const sortOption = buildDateSort(sort, "createdAt", true);

    if (search) {
      const keyword = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matchStage = {};
      if (productId) {
        matchStage.productId = new mongoose.Types.ObjectId(productId);
      }

      const pipeline = [
        ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "userDoc",
          },
        },
        {
          $lookup: {
            from: "product",
            localField: "productId",
            foreignField: "_id",
            as: "productDoc",
          },
        },
        {
          $match: {
            $or: [
              { "userDoc.firstName": { $regex: keyword, $options: "i" } },
              { "userDoc.lastName": { $regex: keyword, $options: "i" } },
              { "productDoc.productName": { $regex: keyword, $options: "i" } },
            ],
          },
        },
        { $sort: sortOption },
      ];

      const reviews = await Reviews.aggregate(pipeline);
      return res.status(HttpStatus.OK).json(reviews.map(shapeReview));
    }

    const filter = {};
    if (productId) filter.productId = productId;
    const reviews = await reviewPopulate(Reviews.find(filter).sort(sortOption));
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
