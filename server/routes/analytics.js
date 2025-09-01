const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get sales analytics (admin only)
router.get('/sales', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orders = await Order.find().populate('items.product');
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product._id.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.product.name,
            totalSold: 0,
          };
        }
        productSales[productId].totalSold += item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    res.json({
      totalRevenue,
      totalOrders,
      topProducts,
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ message: 'Error fetching sales analytics', error });
  }
});

// Get orders for analytics (admin only)
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orders = await Order.find().populate('user').populate('items.product');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders for analytics:', error);
    res.status(500).json({ message: 'Error fetching orders', error });
  }
});

module.exports = router;