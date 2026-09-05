const express = require('express');
const { body, param, query } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

const shippingValidation = [
  body('shippingAddress.fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('shippingAddress.address').trim().isLength({ min: 5, max: 200 }).withMessage('Address must be 5-200 characters'),
  body('shippingAddress.city').trim().isLength({ min: 2, max: 80 }).withMessage('City must be 2-80 characters'),
  body('shippingAddress.postalCode').trim().matches(/^[A-Za-z0-9 -]{3,20}$/).withMessage('Postal code is invalid'),
  body('shippingAddress.country').trim().isLength({ min: 2, max: 80 }).withMessage('Country must be 2-80 characters'),
  body('shippingAddress.phoneNumber').trim().matches(/^\+?[0-9 ()-]{7,20}$/).withMessage('Phone number is invalid'),
];

const orderIdValidation = param('id').isMongoId().withMessage('Invalid order ID');

// @route  POST /api/orders
// @access Private — create order from cart
router.post(
  '/',
  protect,
  shippingValidation,
  validate,
  asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock and build order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(400).json({ message: 'A product in your cart no longer exists' });
      }
      if (product.stockQuantity < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for "${product.name}"` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Compute total
    const totalPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const reserved = [];
    const releaseReservedStock = async () => {
      await Promise.all(
        reserved.map((item) =>
          Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity } })
        )
      );
    };

    // Reserve stock conditionally so concurrent checkouts cannot oversell.
    try {
      for (const item of orderItems) {
        const result = await Product.updateOne(
          { _id: item.product, stockQuantity: { $gte: item.quantity } },
          { $inc: { stockQuantity: -item.quantity } }
        );
        if (result.modifiedCount !== 1) {
          throw Object.assign(new Error(`Insufficient stock for "${item.name}"`), { statusCode: 409 });
        }
        reserved.push(item);
      }

      const order = await Order.create({
        user: req.user._id,
        orderItems,
        shippingAddress: req.body.shippingAddress,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        paymentStatus: 'unpaid',
      });

      await Cart.findOneAndDelete({ user: req.user._id });
      return res.status(201).json(order);
    } catch (err) {
      await releaseReservedStock();
      throw err;
    }
  })
);

// @route  GET /api/orders/myorders
// @access Private
router.get(
  '/myorders',
  protect,
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 50 })],
  validate,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const filter = { user: req.user._id };
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, page, pages: Math.ceil(total / limit), total });
  })
);

// @route  GET /api/orders/:id
// @access Private (own order) or Admin
router.get(
  '/:id',
  protect,
  orderIdValidation,
  validate,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Only allow the owning user or an admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(order);
  })
);

// @route  GET /api/orders
// @access Admin
router.get(
  '/',
  protect,
  admin,
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 50 })],
  validate,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const [orders, total] = await Promise.all([
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Order.countDocuments(),
    ]);
    res.json({ orders, page, pages: Math.ceil(total / limit), total });
  })
);

// @route  PUT /api/orders/:id/status
// @access Admin
router.put(
  '/:id/status',
  protect,
  admin,
  orderIdValidation,
  [
    body('status')
      .isIn(['pending', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status value'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const allowedTransitions = {
      pending: ['pending', 'shipped', 'cancelled'],
      shipped: ['shipped', 'delivered'],
      delivered: ['delivered'],
      cancelled: ['cancelled'],
    };
    if (!allowedTransitions[order.status].includes(req.body.status)) {
      return res.status(409).json({ message: `Cannot change ${order.status} order to ${req.body.status}` });
    }
    order.status = req.body.status;
    const updated = await order.save();
    res.json(updated);
  })
);

module.exports = router;
