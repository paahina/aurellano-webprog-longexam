const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  loginUser,
  logoutUser,
  getSession,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginUser);
router.post("/create", createUser);
router.post("/logout", protect, logoutUser);
router.get("/session", protect, getSession);
router.get("/getAllUsers", protect, authorize("Admin"), getUsers);
router.get("/get/:id", protect, getUserById);
router.put("/update/:id", protect, updateUser);
router.delete("/delete/:id", protect, authorize("Admin"), deleteUser);

module.exports = router;
