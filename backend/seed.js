require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');

  // Clear existing data
  await Order.deleteMany();
  await Cart.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();
  console.log('Cleared existing data.');

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@shop.com',
    password: 'admin123',
    isAdmin: true,
  });

  // Create regular user
  await User.create({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    isAdmin: false,
  });

  console.log('Users created.');

  // Sample products
  const products = [
    {
      name: 'Wireless Noise-Cancelling Headphones',
      description:
        'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and foldable design. Perfect for travel and focus work.',
      price: 149.99,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      stockQuantity: 45,
      createdBy: admin._id,
    },
    {
      name: 'Mechanical Keyboard — TKL',
      description:
        'Tenkeyless mechanical keyboard with Cherry MX Red switches, RGB backlighting, and aircraft-grade aluminum frame.',
      price: 89.99,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500',
      stockQuantity: 30,
      createdBy: admin._id,
    },
    {
      name: 'Running Shoes — Men\'s',
      description:
        'Lightweight running shoes with responsive foam midsole, breathable knit upper, and durable rubber outsole. Available in multiple sizes.',
      price: 79.99,
      category: 'Footwear',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      stockQuantity: 60,
      createdBy: admin._id,
    },
    {
      name: 'Minimalist Leather Wallet',
      description:
        'Slim bifold wallet crafted from full-grain leather. Holds up to 6 cards and cash. RFID blocking.',
      price: 34.99,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
      stockQuantity: 100,
      createdBy: admin._id,
    },
    {
      name: 'Stainless Steel Water Bottle',
      description:
        'Double-wall vacuum insulated bottle keeps drinks cold 24 hrs or hot 12 hrs. 32 oz, BPA-free, leak-proof lid.',
      price: 24.99,
      category: 'Home & Kitchen',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
      stockQuantity: 200,
      createdBy: admin._id,
    },
    {
      name: 'Yoga Mat — Non-Slip 6mm',
      description:
        'Eco-friendly TPE yoga mat with alignment lines. Excellent grip, easy to clean, includes carrying strap.',
      price: 39.99,
      category: 'Sports & Fitness',
      imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
      stockQuantity: 75,
      createdBy: admin._id,
    },
    {
      name: 'Ceramic Pour-Over Coffee Set',
      description:
        'Handcrafted ceramic dripper with matching server. Brews a clean, flavorful cup. Set includes paper filters.',
      price: 49.99,
      category: 'Home & Kitchen',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
      stockQuantity: 40,
      createdBy: admin._id,
    },
    {
      name: 'Polarized Sunglasses',
      description:
        'UV400 polarized lenses in a classic aviator frame. Lightweight titanium arms, comes with hard case.',
      price: 59.99,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      stockQuantity: 55,
      createdBy: admin._id,
    },
  ];

  await Product.insertMany(products);
  console.log(`${products.length} products created.`);

  console.log('\n✅  Seed complete!');
  console.log('   Admin  →  admin@shop.com  /  admin123');
  console.log('   User   →  jane@example.com  /  password123');

  await mongoose.disconnect();
  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
