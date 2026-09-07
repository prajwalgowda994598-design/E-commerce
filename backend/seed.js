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
      name: 'Wireless Bluetooth Headphones',
      description: 'Over-ear wireless headphones with noise cancellation and 30-hour battery life.',
      price: 2499,
      category: 'Electronics',
      imageUrl: 'https://via.placeholder.com/400x400.png?text=Headphones',
      stockQuantity: 25,
      createdBy: admin._id,
    },
    {
      name: 'Smart Fitness Watch',
      description: 'Tracks heart rate, steps, sleep, and workouts with a 7-day battery life.',
      price: 3299,
      category: 'Electronics',
      imageUrl: 'https://via.placeholder.com/400x400.png?text=Smart+Watch',
      stockQuantity: 40,
      createdBy: admin._id,
    },
    {
      name: "Men's Cotton T-Shirt",
      description: 'Breathable 100% cotton crew-neck t-shirt, available in multiple colors.',
      price: 499,
      category: 'Clothing',
      imageUrl: 'https://via.placeholder.com/400x400.png?text=T-Shirt',
      stockQuantity: 100,
      createdBy: admin._id,
    },
    {
      name: 'Stainless Steel Water Bottle',
      description: 'Insulated 1-liter bottle that keeps drinks cold for 24 hours or hot for 12.',
      price: 799,
      category: 'Home & Kitchen',
      imageUrl: 'https://via.placeholder.com/400x400.png?text=Water+Bottle',
      stockQuantity: 60,
      createdBy: admin._id,
    },
    {
      name: 'Laptop Backpack',
      description: 'Water-resistant backpack with padded compartment for laptops up to 15.6 inches.',
      price: 1599,
      category: 'Accessories',
      imageUrl: 'https://via.placeholder.com/400x400.png?text=Backpack',
      stockQuantity: 35,
      createdBy: admin._id,
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic 2.4GHz wireless mouse with adjustable DPI settings.',
      price: 599,
      category: 'Electronics',
      imageUrl: 'https://via.placeholder.com/400x400.png?text=Mouse',
      stockQuantity: 80,
      createdBy: admin._id,
    },
    {
      name: 'Ceramic Coffee Mug Set',
      description: 'Set of 2 handcrafted ceramic mugs, 350ml each, dishwasher safe.',
      price: 899,
      category: 'Home & Kitchen',
      imageUrl: 'https://via.placeholder.com/400x400.png?text=Mug+Set',
      stockQuantity: 50,
      createdBy: admin._id,
    },
    {
      name: 'Yoga Mat',
      description: 'Non-slip 6mm thick yoga mat with carrying strap, eco-friendly material.',
      price: 1199,
      category: 'Sports & Fitness',
      imageUrl: 'https://via.placeholder.com/400x400.png?text=Yoga+Mat',
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
