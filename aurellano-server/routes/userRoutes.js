const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/getAllUsers", getUsers);
router.post("/login", loginUser);
router.get("/get/:id", getUserById);
router.post("/create", createUser);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);

module.exports = router;
