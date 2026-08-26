const mongoose = require("mongoose");
const Reviews = require("../models/reviewModel");
const Product = require("../models/productModel");
const Orders = require("../models/orderModel");
const { HttpStatus } = require("../config/constants");
const { isAdmin, forbidIfNotOwner } = require("../middleware/authMiddleware");
const { buildDateSort } = require("../utils/listSort");
const { parsePagination, paginatedResponse } = require("../utils/pagination");

const reviewPopulate = (query) =>
  query
    .populate("userId", "firstName lastName")
    .populate("productId", "productName productImage productSlug");

const shapeReview = (doc) => {
  const user = doc.userDoc?.[0] || doc.userId;
  const product = doc.productDoc?.[0] || doc.productId;
  return {
    _id: doc._id,
    productId: product
      ? {
          _id: product._id,
          productName: product.productName,
          productImage: product.productImage,
          productSlug: product.productSlug,
        }
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
    const { requested, page, limit, skip } = parsePagination(req.query);

    let supplierProductIds = null;
    if (req.user?.userRole === "supplier" && req.user.supplierId) {
      const products = await Product.find({ supplierId: req.user.supplierId }).select("_id");
      supplierProductIds = products.map((p) => p._id);
      const supplierProductIdStrings = supplierProductIds.map((id) => id.toString());
      if (!supplierProductIds.length) {
        return res
          .status(HttpStatus.OK)
          .json(requested ? paginatedResponse({ data: [], total: 0, page, limit }) : []);
      }
      if (productId && !supplierProductIdStrings.includes(String(productId))) {
        return res
          .status(HttpStatus.OK)
          .json(requested ? paginatedResponse({ data: [], total: 0, page, limit }) : []);
      }
    }

    if (search) {
      const keyword = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matchStage = {};
      if (productId) {
        matchStage.productId = new mongoose.Types.ObjectId(productId);
      }
      if (!productId && supplierProductIds) {
        matchStage.productId = { $in: supplierProductIds };
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

      if (requested) {
        const [agg] = await Reviews.aggregate([
          ...pipeline,
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: limit }],
              meta: [{ $count: "total" }],
            },
          },
        ]);
        const total = agg?.meta?.[0]?.total ?? 0;
        const list = (agg?.data || []).map(shapeReview);
        return res.status(HttpStatus.OK).json(paginatedResponse({ data: list, total, page, limit }));
      }

      const reviews = await Reviews.aggregate(pipeline);
      return res.status(HttpStatus.OK).json(reviews.map(shapeReview));
    }

    const filter = {};
    if (productId) filter.productId = productId;
    if (!productId && supplierProductIds) {
      filter.productId = { $in: supplierProductIds };
    }

    if (requested) {
      const [total, reviews] = await Promise.all([
        Reviews.countDocuments(filter),
        reviewPopulate(Reviews.find(filter).sort(sortOption).skip(skip).limit(limit)),
      ]);
      return res.status(HttpStatus.OK).json(
        paginatedResponse({
          data: reviews,
          total,
          page,
          limit,
        })
      );
    }

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

const getReviewable = async (req, res) => {
  try {
    const userId = req.user.id;
    const search = String(req.query.search || "").trim().toLowerCase();
    const { page, limit, skip } = parsePagination(req.query);

    const [orders, myReviews] = await Promise.all([
      Orders.find({ userId, orderStatus: "delivered" }).sort({ orderedAt: -1 }),
      Reviews.find({ userId }).sort({ createdAt: 1 }),
    ]);

    const pools = {};
    myReviews.forEach((review) => {
      const productId = review.productId?.toString();
      if (!productId) return;
      if (!pools[productId]) pools[productId] = [];
      pools[productId].push({
        _id: review._id,
        productId: review.productId,
        userId: review.userId,
        reviewRating: review.reviewRating,
        reviewComment: review.reviewComment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      });
    });

    let entries = [];
    orders.forEach((order) => {
      (order.orderItems || []).forEach((item, index) => {
        const productId = (item.productId?._id || item.productId)?.toString?.();
        if (!productId) return;
        const pool = pools[productId] || [];
        const review = pool.shift() || null;
        entries.push({
          key: `${order._id}-${productId}-${index}`,
          productId,
          productName: item.productName || "Product",
          productImage: item.productImage || "",
          productSlug: item.productSlug || "",
          orderedAt: order.orderedAt,
          review,
        });
      });
    });

    if (search) {
      entries = entries.filter((entry) =>
        String(entry.productName || "")
          .toLowerCase()
          .includes(search)
      );
    }

    const total = entries.length;
    const data = entries.slice(skip, skip + limit);
    res.status(HttpStatus.OK).json(paginatedResponse({ data, total, page, limit }));
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
  getReviewable,
  createReview,
  updateReview,
  deleteReview,
};
