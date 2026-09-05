// Centralized error handler — must be registered last in Express
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource ID' });
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode).json({
    message: statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error',
  });
};

// Wrap async route handlers to forward errors to errorHandler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
