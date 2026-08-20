const Cart = require("../models/cartModel");
const { HttpStatus } = require("../config/constants");

const getCarts = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("userId", "firstName lastName email")
      .populate("cartItems.productId", "productName productPrice");
    res.status(HttpStatus.OK).json(carts);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id)
      .populate("userId", "firstName lastName email")
      .populate("cartItems.productId", "productName productPrice");
    if (!cart) return res.status(HttpStatus.NOT_FOUND).json({ message: "Cart not found" });
    res.status(HttpStatus.OK).json(cart);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const createCart = async (req, res) => {
  try {
    const cart = await Cart.create(req.body);
    res.status(HttpStatus.CREATED).json(cart);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cart) return res.status(HttpStatus.NOT_FOUND).json({ message: "Cart not found" });
    res.status(HttpStatus.OK).json(cart);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.params.id);
    if (!cart) return res.status(HttpStatus.NOT_FOUND).json({ message: "Cart not found" });
    res.status(HttpStatus.OK).json({ message: "Cart deleted" });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = { getCarts, getCartById, createCart, updateCart, deleteCart };
