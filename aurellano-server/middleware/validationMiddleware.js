const { body, param, validationResult } = require("express-validator");
const { HttpStatus } = require("../config/constants");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

const registerValidation = [
  body("firstName")
    .isString()
    .withMessage("First name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),
  body("lastName")
    .isString()
    .withMessage("Last name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidation,
];

const loginValidation = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];

const updateUserValidation = [
  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),
  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long"),
  body("email").optional().isEmail().withMessage("Invalid email address"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidation,
];

const categoryValidation = [
  body("categoryName")
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Category name must be at least 2 characters"),
  body("categoryDescription").optional().isString().trim(),
  handleValidation,
];

const supplierValidation = [
  body("supplierName")
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Supplier name must be at least 2 characters"),
  body("supplierDescription").optional().isString().trim(),
  handleValidation,
];

const productValidation = [
  body("productName")
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Product name must be at least 2 characters"),
  body("productDescription").isString().trim(),
  body("productPrice").isFloat({ min: 0 }).withMessage("Product price must be 0 or greater"),
  body("categoryId").notEmpty().withMessage("categoryId is required"),
  body("supplierId").optional().notEmpty().withMessage("supplierId cannot be empty"),
  body("stockQuantity").optional().isInt({ min: 0 }).withMessage("stockQuantity must be 0 or greater"),
  handleValidation,
];

const productUpdateValidation = [
  body("productName").optional().isString().trim().isLength({ min: 2 }),
  body("productDescription").optional().isString().trim(),
  body("productPrice").optional().isFloat({ min: 0 }),
  body("stockQuantity").optional().isInt({ min: 0 }),
  body("removeImage")
    .optional()
    .isIn(["true", "false"])
    .withMessage("removeImage must be true or false"),
  handleValidation,
];

const categoryUpdateValidation = [
  body("categoryName").optional().isString().trim().isLength({ min: 2 }),
  body("categoryDescription").optional().isString().trim(),
  handleValidation,
];

const supplierUpdateValidation = [
  body("supplierName").optional().isString().trim().isLength({ min: 2 }),
  body("supplierDescription").optional().isString().trim(),
  handleValidation,
];

const reviewValidation = [
  body("productId").notEmpty().withMessage("productId is required"),
  body("reviewRating")
    .isInt({ min: 1, max: 5 })
    .withMessage("reviewRating must be between 1 and 5"),
  body("reviewComment").optional().isString().trim().isLength({ max: 1000 }),
  handleValidation,
];

const reviewUpdateValidation = [
  body("productId").optional().notEmpty(),
  body("reviewRating").optional().isInt({ min: 1, max: 5 }),
  body("reviewComment").optional().isString().trim().isLength({ max: 1000 }),
  handleValidation,
];

const createOrderValidation = [
  body("orderItems").isArray({ min: 1 }).withMessage("orderItems must be a non-empty array"),
  body("orderItems.*.productId").notEmpty().withMessage("Each order item needs productId"),
  body("orderItems.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Each order item quantity must be at least 1"),
  body("pickupDetails").optional().isString().trim(),
  handleValidation,
];

const mongoIdParamValidation = [
  param("id").isMongoId().withMessage("Invalid id parameter"),
  handleValidation,
];

module.exports = {
  registerValidation,
  loginValidation,
  updateUserValidation,
  categoryValidation,
  categoryUpdateValidation,
  supplierValidation,
  supplierUpdateValidation,
  productValidation,
  productUpdateValidation,
  reviewValidation,
  reviewUpdateValidation,
  createOrderValidation,
  mongoIdParamValidation,
};
