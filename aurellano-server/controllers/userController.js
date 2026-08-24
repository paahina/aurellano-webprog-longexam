const User = require("../models/userModel");
const { HttpStatus } = require("../config/constants");
const { generateToken } = require("../utils/jwt");
const { JWT_EXPIRES_IN } = require("../config/config");
const { blacklistToken } = require("../middleware/tokenBlacklist");
const { isAdmin, forbidIfNotOwner } = require("../middleware/authMiddleware");

const toPublicUser = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

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
    if (forbidIfNotOwner(user._id, req, res)) return;
    res.status(HttpStatus.OK).json(user);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      userRole: "customer",
      isActive: true,
    });
    const token = generateToken(user);
    res.status(HttpStatus.CREATED).json({
      message: "Account created",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

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

    if (user.isActive === false) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Account is inactive" });
    }

    const token = generateToken(user, rememberMe ? "7d" : JWT_EXPIRES_IN);
    res.status(HttpStatus.OK).json({
      message: "Login successful",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    blacklistToken(req.token);
    res.status(HttpStatus.OK).json({ message: "Logout successful" });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Session is no longer valid" });
    }
    if (user.isActive === false) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Account is inactive" });
    }

    res.status(HttpStatus.OK).json({ user });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found" });
    if (forbidIfNotOwner(user._id, req, res)) return;

    const { currentPassword, password, firstName, lastName, email, userRole, isActive } = req.body;

    if (password) {
      if (!isAdmin(req)) {
        if (!currentPassword) {
          return res.status(HttpStatus.BAD_REQUEST).json({ message: "Current password is required" });
        }
        const matches = await user.comparePassword(currentPassword);
        if (!matches) {
          return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Current password is incorrect" });
        }
      }
      user.password = password;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (isAdmin(req) && userRole !== undefined) user.userRole = userRole;

    if (isActive !== undefined) {
      if (!isAdmin(req)) {
        return res.status(HttpStatus.FORBIDDEN).json({ message: "You cannot change account status" });
      }
      if (user.userRole === "Admin") {
        return res.status(HttpStatus.FORBIDDEN).json({ message: "Admin accounts cannot be deactivated" });
      }
      user.isActive = isActive;
    }

    await user.save();
    res.status(HttpStatus.OK).json(toPublicUser(user));
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
  logoutUser,
  getSession,
  updateUser,
  deleteUser,
};
