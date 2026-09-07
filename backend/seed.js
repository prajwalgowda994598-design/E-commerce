require('dotenv').config();
const dns = require('node:dns');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

if (process.env.MONGO_URI?.startsWith('mongodb+srv://')) {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}

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
      name: 'Wireless Bluetooth Headphones',
      description: 'Over-ear wireless headphones with noise cancellation and 30-hour battery life.',
      price: 2499,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      stockQuantity: 25,
      createdBy: admin._id,
    },
    {
      name: 'Smart Fitness Watch',
      description: 'Tracks heart rate, steps, sleep, and workouts with a 7-day battery life.',
      price: 3299,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      stockQuantity: 40,
      createdBy: admin._id,
    },
    {
      name: "Men's Cotton T-Shirt",
      description: 'Breathable 100% cotton crew-neck t-shirt, available in multiple colors.',
      price: 499,
      category: 'Clothing',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      stockQuantity: 100,
      createdBy: admin._id,
    },
    {
      name: 'Stainless Steel Water Bottle',
      description: 'Insulated 1-liter bottle that keeps drinks cold for 24 hours or hot for 12.',
      price: 799,
      category: 'Home & Kitchen',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
      stockQuantity: 60,
      createdBy: admin._id,
    },
    {
      name: 'Laptop Backpack',
      description: 'Water-resistant backpack with padded compartment for laptops up to 15.6 inches.',
      price: 1599,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      stockQuantity: 35,
      createdBy: admin._id,
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic 2.4GHz wireless mouse with adjustable DPI settings.',
      price: 599,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
      stockQuantity: 80,
      createdBy: admin._id,
    },
    {
      name: 'Ceramic Coffee Mug Set',
      description: 'Set of 2 handcrafted ceramic mugs, 350ml each, dishwasher safe.',
      price: 899,
      category: 'Home & Kitchen',
      imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
      stockQuantity: 50,
      createdBy: admin._id,
    },
    {
      name: 'Yoga Mat',
      description: 'Non-slip 6mm thick yoga mat with carrying strap, eco-friendly material.',
      price: 1199,
      category: 'Sports & Fitness',
      imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
      stockQuantity: 45,
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
