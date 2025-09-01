
const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
// Serve static files from the uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});


const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

// Add a product (admin only)
router.post('/add', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, price, description, category, alt, stock } = req.body;
    let image = req.body.image; // Fallback to URL if provided

    // Override with uploaded file path if file is present
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // Validation
    if (!name || !price || !description || !category || !alt || !stock || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: 'Price must be a valid number' });
    }
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ message: 'Stock must be a valid number' });
    }

    const product = new Product({
      name,
      price: Number(price),
      description,
      category,
      image,
      alt,
      stock: Number(stock),
      rating: 0,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: 'Error creating product', error });
  }
});

// Delete a product (admin only)
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.productId });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error });
  }
});

module.exports = router;