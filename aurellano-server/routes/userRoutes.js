const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  createUserByAdmin,
  loginUser,
  logoutUser,
  getSession,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  registerValidation,
  loginValidation,
  updateUserValidation,
  mongoIdParamValidation,
} = require("../middleware/validationMiddleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiterMiddleware");
const loginLockoutMiddleware = require("../middleware/loginLockoutMiddleware");

const router = express.Router();

router.post("/login", loginLimiter, loginValidation, loginLockoutMiddleware, loginUser);
router.post("/register", registerLimiter, registerValidation, createUser);
router.post("/logout", protect, logoutUser);
router.get("/session", protect, getSession);
router.get("/getAllUsers", protect, authorize("Admin"), getUsers);
router.post("/adminCreate", protect, authorize("Admin"), registerValidation, createUserByAdmin);
router.get("/get/:id", protect, mongoIdParamValidation, getUserById);
router.put("/update/:id", protect, mongoIdParamValidation, updateUserValidation, updateUser);
router.delete("/delete/:id", protect, authorize("Admin"), mongoIdParamValidation, deleteUser);

module.exports = router;
