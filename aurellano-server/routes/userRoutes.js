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
} = require("../middleware/validationMiddleware");
const { loginLimiter } = require("../middleware/rateLimiterMiddleware");

const router = express.Router();

router.post("/login", loginLimiter, loginValidation, loginUser);
router.post("/register", registerValidation, createUser);
router.post("/logout", protect, logoutUser);
router.get("/session", protect, getSession);
router.get("/getAllUsers", protect, authorize("Admin"), getUsers);
router.post("/adminCreate", protect, authorize("Admin"), registerValidation, createUserByAdmin);
router.get("/get/:id", protect, getUserById);
router.put("/update/:id", protect, updateUserValidation, updateUser);
router.delete("/delete/:id", protect, authorize("Admin"), deleteUser);

module.exports = router;
