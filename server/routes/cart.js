const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product'); // Add Product import
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error });
  }
});

// Add to cart
router.post('/add', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} items in stock` });
    }

    const existingItem = user.cart.find(item => item.product.toString() === productId);
    if (existingItem) {
      if (product.stock < existingItem.quantity + quantity) {
        return res.status(400).json({ message: `Only ${product.stock} items in stock` });
      }
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.json(updatedUser.cart);
  } catch (error) {
    res.status(400).json({ message: 'Error adding to cart', error });
  }
});

// Update cart quantity
router.put('/update', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items in stock` });
    }

    const item = user.cart.find(item => item.product.toString() === productId);
    if (item && quantity > 0) {
      item.quantity = quantity;
      await user.save();
      const updatedUser = await User.findById(req.user.id).populate('cart.product');
      res.json(updatedUser.cart);
    } else {
      res.status(400).json({ message: 'Invalid quantity or item not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating cart', error });
  }
});

// Remove from cart
router.delete('/remove/:productId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.json(updatedUser.cart);
  } catch (error) {
    res.status(400).json({ message: 'Error removing from cart', error });
  }
});

module.exports = router;