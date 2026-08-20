const User = require("../models/userModel");
const { HttpStatus } = require("../config/constants");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(HttpStatus.OK).json(users);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found" });
    res.status(HttpStatus.OK).json(user);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(HttpStatus.CREATED).json(userObj);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Invalid email or password" });
    }

    const userObj = user.toObject();
    delete userObj.password;
    res.status(HttpStatus.OK).json({ message: "Login successful", user: userObj });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found" });

    Object.assign(user, req.body);
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    res.status(HttpStatus.OK).json(userObj);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found" });
    res.status(HttpStatus.OK).json({ message: "User deleted" });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
};
