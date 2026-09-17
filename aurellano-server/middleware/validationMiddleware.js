const { body, validationResult } = require("express-validator");
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

module.exports = {
  registerValidation,
  loginValidation,
  updateUserValidation,
};
