const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Supplier = require("../models/supplierModel");
const { HttpStatus } = require("../config/constants");

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

    if (category) {
      const matchedCategory = await Category.findOne({
        categoryName: { $regex: category, $options: "i" },
      });

      if (!matchedCategory) {
        return sendResponse(
          res,
          HttpStatus.OK,
          true,
          "Products retrieved successfully.",
          []
        );
      }

      filter.categoryId = matchedCategory._id;
    }

    if (supplier) {
      const matchedSupplier = await Supplier.findOne({
        supplierName: { $regex: supplier, $options: "i" },
      });

      if (!matchedSupplier) {
        return sendResponse(
          res,
          HttpStatus.OK,
          true,
          "Products retrieved successfully.",
          []
        );
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
    if (sort) {
      const sortFieldMap = {
        price: "productPrice",
        name: "productName",
      };
      const isDescending = sort.startsWith("-");
      const sortKey = isDescending ? sort.slice(1) : sort;
      const field = sortFieldMap[sortKey] || sortKey;
      sortOption[field] = isDescending ? -1 : 1;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate("categoryId", "categoryName")
      .populate("supplierId", "supplierName")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    return sendResponse(
      res,
      HttpStatus.OK,
      true,
      "Products retrieved successfully.",
      products
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

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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
      "Product updated successfully.",
      product
    );
  } catch (error) {
    return sendResponse(res, HttpStatus.BAD_REQUEST, false, error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
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
  createProduct,
  updateProduct,
  deleteProduct,
};
