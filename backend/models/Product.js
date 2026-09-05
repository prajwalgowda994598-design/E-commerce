const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 4000,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      max: [100000000, 'Price is too large'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: 80,
    },
    imageUrl: {
      type: String,
      default: '',
      maxlength: 2048,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
