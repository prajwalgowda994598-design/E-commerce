const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route  POST /api/auth/register
// @access Public
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  })
);

// @route  POST /api/auth/login
// @access Public
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  })
);

// @route  GET /api/auth/me
// @access Private
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
    });
  })
);

module.exports = router;
