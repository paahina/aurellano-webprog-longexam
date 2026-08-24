const Cart = require("../models/cartModel");
const { HttpStatus } = require("../config/constants");
const { isAdmin, forbidIfNotOwner, ownerFilter } = require("../middleware/authMiddleware");

const cartPopulate = (query) =>
  query
    .populate("userId", "firstName lastName email")
    .populate(
      "cartItems.productId",
      "productName productPrice productImage productSlug stockQuantity"
    );

const getCarts = async (req, res) => {
  try {
    const carts = await cartPopulate(Cart.find(ownerFilter(req)));
    res.status(HttpStatus.OK).json(carts);
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
