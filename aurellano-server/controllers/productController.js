const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const { HttpStatus } = require("../config/constants");

const getProducts = async (req, res) => {
  try {
    const { category, sort } = req.query;
    const filter = {};
    const sortOption = {};

    if (category) {
      const matchedCategory = await Category.findOne({
        categoryName: { $regex: category, $options: "i" },
      });

      if (!matchedCategory) {
        return res.status(HttpStatus.OK).json({
          products: [],
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 10,
          total: 0,
          totalPages: 0,
        });
      }

      filter.categoryId = matchedCategory._id;
    }

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

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("categoryId", "categoryName")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.status(HttpStatus.OK).json({
      products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categoryId",
      "categoryName"
    );
    if (!product) return res.status(HttpStatus.NOT_FOUND).json({ message: "Product not found" });
    res.status(HttpStatus.OK).json(product);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(HttpStatus.CREATED).json(product);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(HttpStatus.NOT_FOUND).json({ message: "Product not found" });
    res.status(HttpStatus.OK).json(product);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(HttpStatus.NOT_FOUND).json({ message: "Product not found" });
    res.status(HttpStatus.OK).json({ message: "Product deleted" });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
