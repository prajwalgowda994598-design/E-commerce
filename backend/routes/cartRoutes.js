const express = require('express');
const { body, param } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// @route  GET /api/cart
// @access Private
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name price imageUrl stockQuantity'
    );
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json(cart);
  })
);

// @route  POST /api/cart
// @access Private — add or update item
router.post(
  '/',
  [
    body('productId').isMongoId().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity = quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product', 'name price imageUrl stockQuantity');
    res.json(cart);
  })
);

// @route  PUT /api/cart/:productId
// @access Private — update quantity
router.put(
  '/:productId',
  [
    param('productId').isMongoId().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name price imageUrl stockQuantity');
    res.json(cart);
  })
);

// @route  DELETE /api/cart/:productId
// @access Private — remove single item
router.delete(
  '/:productId',
  [param('productId').isMongoId().withMessage('Valid product ID is required')],
  validate,
  asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();
    await cart.populate('items.product', 'name price imageUrl stockQuantity');
    res.json(cart);
  })
);

// @route  DELETE /api/cart
// @access Private — clear entire cart
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Cart cleared', items: [] });
  })
);

module.exports = router;
