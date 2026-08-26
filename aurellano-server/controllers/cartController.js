const Cart = require("../models/cartModel");
const { HttpStatus } = require("../config/constants");
const { isAdmin, forbidIfNotOwner, ownerFilter } = require("../middleware/authMiddleware");
const { validateCartItems } = require("../utils/stock");
const { parsePagination, paginatedResponse } = require("../utils/pagination");

const cartPopulate = (query) =>
  query
    .populate("userId", "firstName lastName email")
    .populate({
      path: "cartItems.productId",
      select: "productName productPrice productImage productSlug stockQuantity supplierId",
      populate: { path: "supplierId", select: "supplierName" },
    });

const getCarts = async (req, res) => {
  try {
    const carts = await cartPopulate(Cart.find(ownerFilter(req)));
    const { requested, page, limit, skip } = parsePagination(req.query);

    if (!requested) {
      return res.status(HttpStatus.OK).json(carts);
    }

    const cart = carts[0] || null;
    if (!cart) {
      return res.status(HttpStatus.OK).json({
        ...paginatedResponse({ data: [], total: 0, page, limit }),
        cartId: null,
        cartTotal: 0,
        hasBlockedItems: false,
      });
    }

    const allItems = cart.cartItems || [];
    const total = allItems.length;
    const data = allItems.slice(skip, skip + limit);
    const cartTotal = allItems.reduce((sum, item) => {
      const price = item.productId?.productPrice || 0;
      return sum + price * (item.quantity || 0);
    }, 0);
    const hasBlockedItems = allItems.some((item) => {
      const stock = item.productId?.stockQuantity ?? 0;
      const quantity = item.quantity ?? 0;
      return stock <= 0 || quantity > stock;
    });

    return res.status(HttpStatus.OK).json({
      ...paginatedResponse({ data, total, page, limit }),
      cartId: cart._id,
      cartTotal,
      hasBlockedItems,
    });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getCartById = async (req, res) => {
  try {
    const cart = await cartPopulate(Cart.findById(req.params.id));
    if (!cart) return res.status(HttpStatus.NOT_FOUND).json({ message: "Cart not found" });
    if (forbidIfNotOwner(cart.userId._id || cart.userId, req, res)) return;
    res.status(HttpStatus.OK).json(cart);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const createCart = async (req, res) => {
  try {
    if (req.body.cartItems?.length) {
      await validateCartItems(req.body.cartItems);
    }
    const payload = { ...req.body, userId: isAdmin(req) && req.body.userId ? req.body.userId : req.user.id };
    const cart = await Cart.create(payload);
    res.status(HttpStatus.CREATED).json(cart);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(HttpStatus.NOT_FOUND).json({ message: "Cart not found" });
    if (forbidIfNotOwner(cart.userId, req, res)) return;

    const payload = { ...req.body };
    if (!isAdmin(req)) delete payload.userId;

    if (payload.cartItems?.length) {
      await validateCartItems(payload.cartItems);
    }

    const updated = await cartPopulate(
      Cart.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    );
    res.status(HttpStatus.OK).json(updated);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(HttpStatus.NOT_FOUND).json({ message: "Cart not found" });
    if (forbidIfNotOwner(cart.userId, req, res)) return;
    await cart.deleteOne();
    res.status(HttpStatus.OK).json({ message: "Cart deleted" });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = { getCarts, getCartById, createCart, updateCart, deleteCart };
