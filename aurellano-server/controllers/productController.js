const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Supplier = require("../models/supplierModel");
const { HttpStatus } = require("../config/constants");
const { normalizeProductPayload } = require("../utils/stock");

const sendResponse = (res, status, success, message, data = []) => {
  const list = Array.isArray(data) ? data : data ? [data] : [];
  return res.status(status).json({
    success,
    message,
    count: list.length,
    data: list,
  });
};

const getProducts = async (req, res) => {
  try {
    const { category, supplier, stockStatus, search, sort } = req.query;
    const filter = {};

    if (req.user?.userRole === "supplier" && req.user.supplierId) {
      filter.supplierId = req.user.supplierId;
    }

    if (category) {
      const matchedCategory = await Category.findOne({
        categoryName: { $regex: category, $options: "i" },
      });

      if (!matchedCategory) {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        return res.status(HttpStatus.OK).json({
          success: true,
          message: "Products retrieved successfully.",
          count: 0,
          total: 0,
          page,
          limit,
          totalPages: 1,
          data: [],
        });
      }

      filter.categoryId = matchedCategory._id;
    }

    if (!filter.supplierId && supplier) {
      const matchedSupplier = await Supplier.findOne({
        supplierName: { $regex: supplier, $options: "i" },
      });

      if (!matchedSupplier) {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        return res.status(HttpStatus.OK).json({
          success: true,
          message: "Products retrieved successfully.",
          count: 0,
          total: 0,
          page,
          limit,
          totalPages: 1,
          data: [],
        });
      }

      filter.supplierId = matchedSupplier._id;
    }

    if (stockStatus) {
      filter.stockStatus = { $regex: stockStatus, $options: "i" };
    }

    if (search) {
      const keyword = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { productName: { $regex: keyword, $options: "i" } },
        { productDescription: { $regex: keyword, $options: "i" } },
      ];
    }

    const sortOption = {};
    const isDescending = sort?.startsWith("-");
    const sortKey = sort ? (isDescending ? sort.slice(1) : sort) : null;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (sortKey === "rating") {
      const [agg] = await Product.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "productId",
            as: "reviews",
          },
        },
        {
          $addFields: {
            avgRating: { $ifNull: [{ $avg: "$reviews.reviewRating" }, 0] },
          },
        },
        { $sort: { avgRating: isDescending ? -1 : 1, productName: 1 } },
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: limit },
              {
                $lookup: {
                  from: "category",
                  localField: "categoryId",
                  foreignField: "_id",
                  as: "categoryDoc",
                },
              },
              {
                $lookup: {
                  from: "supplier",
                  localField: "supplierId",
                  foreignField: "_id",
                  as: "supplierDoc",
                },
              },
              {
                $addFields: {
                  categoryId: {
                    $let: {
                      vars: { doc: { $arrayElemAt: ["$categoryDoc", 0] } },
                      in: {
                        _id: "$$doc._id",
                        categoryName: "$$doc.categoryName",
                      },
                    },
                  },
                  supplierId: {
                    $let: {
                      vars: { doc: { $arrayElemAt: ["$supplierDoc", 0] } },
                      in: {
                        _id: "$$doc._id",
                        supplierName: "$$doc.supplierName",
                      },
                    },
                  },
                },
              },
              { $project: { reviews: 0, avgRating: 0, categoryDoc: 0, supplierDoc: 0 } },
            ],
            meta: [{ $count: "total" }],
          },
        },
      ]);

      const total = agg?.meta?.[0]?.total ?? 0;
      const list = agg?.data ?? [];
      return res.status(HttpStatus.OK).json({
        success: true,
        message: "Products retrieved successfully.",
        count: list.length,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        data: list,
      });
    }

    if (sort) {
      const sortFieldMap = {
        price: "productPrice",
        name: "productName",
        createdAt: "createdAt",
      };
      const field = sortFieldMap[sortKey] || sortKey;
      sortOption[field] = isDescending ? -1 : 1;
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate("categoryId", "categoryName")
        .populate("supplierId", "supplierName")
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
    ]);

    const list = products;
    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Products retrieved successfully.",
      count: list.length,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      data: list,
    });
  } catch (error) {
    return sendResponse(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      false,
      error.message
    );
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "categoryName")
      .populate("supplierId", "supplierName");
    if (!product) {
      return sendResponse(
        res,
        HttpStatus.NOT_FOUND,
        false,
        "Product not found."
      );
    }
    return sendResponse(
      res,
      HttpStatus.OK,
      true,
      "Product retrieved successfully.",
      product
    );
  } catch (error) {
    return sendResponse(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      false,
      error.message
    );
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ productSlug: req.params.slug })
      .populate("categoryId", "categoryName")
      .populate("supplierId", "supplierName");
    if (!product) {
      return sendResponse(
        res,
        HttpStatus.NOT_FOUND,
        false,
        "Product not found."
      );
    }
    return sendResponse(
      res,
      HttpStatus.OK,
      true,
      "Product retrieved successfully.",
      product
    );
  } catch (error) {
    return sendResponse(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      false,
      error.message
    );
  }
};

const createProduct = async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body);
    if (req.user?.userRole === "supplier" && req.user.supplierId) {
      payload.supplierId = req.user.supplierId;
    }

    const product = await Product.create(payload);
    return sendResponse(
      res,
      HttpStatus.CREATED,
      true,
      "Product created successfully.",
      product
    );
  } catch (error) {
    return sendResponse(res, HttpStatus.BAD_REQUEST, false, error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return sendResponse(
        res,
        HttpStatus.NOT_FOUND,
        false,
        "Product not found."
      );
    }

    if (req.user?.userRole === "supplier" && req.user.supplierId) {
      if (existing.supplierId.toString() !== req.user.supplierId.toString()) {
        return res.status(HttpStatus.FORBIDDEN).json({
          message: "You do not have permission to update this product",
        });
      }
    }

    const payload = normalizeProductPayload(req.body);
    if (req.user?.userRole === "supplier" && req.user.supplierId) {
      payload.supplierId = req.user.supplierId;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      }
    );
    return sendResponse(
      res,
      HttpStatus.OK,
      true,
      "Product updated successfully.",
      product
    );
  } catch (error) {
    return sendResponse(res, HttpStatus.BAD_REQUEST, false, error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return sendResponse(res, HttpStatus.NOT_FOUND, false, "Product not found.");
    }

    if (req.user?.userRole === "supplier" && req.user.supplierId) {
      if (existing.supplierId.toString() !== req.user.supplierId.toString()) {
        return res.status(HttpStatus.FORBIDDEN).json({
          message: "You do not have permission to delete this product",
        });
      }
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    return sendResponse(
      res,
      HttpStatus.OK,
      true,
      "Product deleted successfully."
    );
  } catch (error) {
    return sendResponse(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      false,
      error.message
    );
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
