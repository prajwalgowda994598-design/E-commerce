const express = require('express');
const { body, query } = require('express-validator');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

const productValidation = [
  body('name').trim().isLength({ min: 2, max: 160 }).withMessage('Product name must be 2-160 characters'),
  body('description').trim().isLength({ min: 1, max: 4000 }).withMessage('Description must be 1-4000 characters'),
  body('price').isFloat({ min: 0, max: 100000000 }).withMessage('Price must be a valid non-negative number'),
  body('category').trim().isLength({ min: 1, max: 80 }).withMessage('Category must be 1-80 characters'),
  body('imageUrl').optional({ values: 'falsy' }).isURL().withMessage('Image URL must be valid'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// @route  GET /api/products
// @access Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = {};

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category.trim();
    }

    // Search by keyword (text index)
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  })
);

// @route  GET /api/products/categories
// @access Public
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category');
    res.json(categories);
  })
);

// @route  GET /api/products/:id
// @access Public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  })
);

// @route  POST /api/products
// @access Admin
router.post(
  '/',
  protect,
  admin,
  productValidation,
  validate,
  asyncHandler(async (req, res) => {
    const { name, description, price, category, imageUrl, stockQuantity } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl: imageUrl || '',
      stockQuantity,
      createdBy: req.user._id,
    });
    res.status(201).json(product);
  })
);

// @route  PUT /api/products/:id
// @access Admin
router.put(
  '/:id',
  protect,
  admin,
  productValidation,
  validate,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, category, imageUrl, stockQuantity } = req.body;
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
    product.stockQuantity = stockQuantity;

    const updated = await product.save();
    res.json(updated);
  })
);

// @route  DELETE /api/products/:id
// @access Admin
router.delete(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  })
);

module.exports = router;
