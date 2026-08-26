const User = require("../models/userModel");
const Supplier = require("../models/supplierModel");
const { HttpStatus } = require("../config/constants");
const { generateToken } = require("../utils/jwt");
const { JWT_EXPIRES_IN } = require("../config/config");
const { blacklistToken } = require("../middleware/tokenBlacklist");
const { isAdmin, forbidIfNotOwner } = require("../middleware/authMiddleware");
const { buildUserSort } = require("../utils/listSort");
const { parsePagination, paginatedResponse } = require("../utils/pagination");

const toPublicUser = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

const getUsers = async (req, res) => {
  try {
    const sortOption = buildUserSort(req.query.sort);
    const { requested, page, limit, skip } = parsePagination(req.query);

    if (requested) {
      const [total, users] = await Promise.all([
        User.countDocuments(),
        User.find()
          .select("-password")
          .populate("supplierId", "supplierName supplierDescription")
          .sort(sortOption)
          .skip(skip)
          .limit(limit),
      ]);
      return res.status(HttpStatus.OK).json(paginatedResponse({ data: users, total, page, limit }));
    }

    const users = await User.find()
      .select("-password")
      .populate("supplierId", "supplierName supplierDescription")
      .sort(sortOption);
    res.status(HttpStatus.OK).json(users);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("supplierId", "supplierName supplierDescription");
    if (!user) return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found" });
    if (forbidIfNotOwner(user._id, req, res)) return;
    res.status(HttpStatus.OK).json(user);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      userRole = "customer",
      supplierName,
      supplierDescription,
    } = req.body;

    if (userRole !== "customer" && userRole !== "supplier") {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "Invalid user role" });
    }

    const supplierFieldsNeeded = userRole === "supplier";
    if (supplierFieldsNeeded && (!supplierName || !supplierDescription)) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "Supplier name and description are required for supplier accounts" });
    }

    let supplier = null;
    if (userRole === "supplier") {
      supplier = await Supplier.create({
        supplierName,
        supplierDescription,
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      userRole,
      supplierId: supplier ? supplier._id : undefined,
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

const createUserByAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      userRole = "customer",
      isActive = true,
      supplierName,
      supplierDescription,
    } = req.body;

    if (!["customer", "supplier", "Admin"].includes(userRole)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "Invalid user role" });
    }

    if (!password || String(password).length < 6) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (userRole === "supplier" && (!supplierName || !supplierDescription)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Supplier name and description are required for supplier accounts",
      });
    }

    let supplier = null;
    if (userRole === "supplier") {
      supplier = await Supplier.create({
        supplierName,
        supplierDescription,
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      userRole,
      supplierId: supplier ? supplier._id : undefined,
      isActive: userRole === "Admin" ? true : Boolean(isActive),
    });

    const populated = await User.findById(user._id)
      .select("-password")
      .populate("supplierId", "supplierName supplierDescription");

    res.status(HttpStatus.CREATED).json(populated);
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

    const {
      currentPassword,
      password,
      firstName,
      lastName,
      email,
      userRole,
      isActive,
      supplierName,
      supplierDescription,
    } = req.body;

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
    const previousRole = user.userRole;
    if (isAdmin(req) && userRole !== undefined && user.userRole !== "Admin") {
      user.userRole = userRole;
    }

    if (isAdmin(req) && userRole !== undefined && previousRole !== "Admin") {
      if (userRole === "supplier") {
        if (!supplierName || !supplierDescription) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            message: "Supplier name and description are required when setting user as supplier",
          });
        }

        if (user.supplierId) {
          await Supplier.findByIdAndUpdate(
            user.supplierId,
            { supplierName, supplierDescription },
            { new: true, runValidators: true }
          );
        } else {
          const supplier = await Supplier.create({ supplierName, supplierDescription });
          user.supplierId = supplier._id;
        }
      } else if (userRole === "customer") {
        user.supplierId = undefined;
      }
    }

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
  createUserByAdmin,
  loginUser,
  logoutUser,
  getSession,
  updateUser,
  deleteUser,
};
