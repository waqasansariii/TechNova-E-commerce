const express = require('express');
const Stripe = require('stripe');
const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Validate shipping object
const validateShipping = (shipping) => {
  const requiredFields = ['name', 'email', 'address', 'city', 'state', 'zip'];
  const missingFields = requiredFields.filter(field => !shipping || !shipping[field]);
  if (missingFields.length > 0) {
    return `Missing required shipping fields: ${missingFields.join(', ')}`;
  }
  return null;
};

// Create Stripe checkout session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const { shipping } = req.body; // Extract shipping
    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user.cart.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate shipping
    const shippingError = validateShipping(shipping);
    if (shippingError) {
      return res.status(400).json({ message: shippingError });
    }

    const lineItems = user.cart.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
        },
        unit_amount: Math.round(item.product.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout/success`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      metadata: { userId: req.user.id.toString(), shipping: JSON.stringify(shipping) }, // Store shipping in metadata
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session', error: error.message });
  }
});

// Create order after checkout (for both Stripe and JazzCash)
router.post('/create-order', authMiddleware, async (req, res) => {
  const { shipping, paymentMethod, transactionId } = req.body;
  try {
    // Validate shipping
    const shippingError = validateShipping(shipping);
    if (shippingError) {
      return res.status(400).json({ message: shippingError });
    }

    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user.cart.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const total = user.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Validate stock
    for (const item of user.cart) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Only ${product?.stock || 0} ${item.product.name} in stock` });
      }
    }

    const order = new Order({
      user: user._id,
      items: user.cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      total,
      shipping,
      paymentMethod,
      transactionId: transactionId || undefined,
      status: 'processing',
    });

    await order.save();

    // Update product stock
    for (const item of user.cart) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    user.cart = [];
    await user.save();

    const populatedOrder = await Order.findById(order._id).populate('items.product').populate('user');
    res.json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Create JazzCash checkout
router.post('/create-jazzcash-checkout', authMiddleware, async (req, res) => {
  try {
    // Validate JazzCash environment variables
    const requiredEnvVars = [
      'JAZZ_MERCHANT_ID',
      'JAZZ_PASSWORD',
      'JAZZ_INTEGRITY_SALT',
      'JAZZ_SANDBOX_URL',
      'JAZZ_RETURN_URL',
    ];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`Missing environment variable: ${envVar}`);
        return res.status(500).json({ message: `Server configuration error: Missing ${envVar}` });
      }
    }

    const { shipping } = req.body;
    // Validate shipping
    const shippingError = validateShipping(shipping);
    if (shippingError) {
      return res.status(400).json({ message: shippingError });
    }

    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user.cart.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total (in PKR, assuming 100 paisa = 1 PKR)
    const total = user.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const amount = Math.round(total * 100).toString(); // JazzCash expects amount in paisa

    // Generate txnRef (e.g., T20250901124700)
    const txnRef = `T${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`;

    // JazzCash payload
    const formData = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: process.env.JAZZ_MERCHANT_ID,
      pp_Password: process.env.JAZZ_PASSWORD,
      pp_TxnRefNo: txnRef,
      pp_Amount: amount,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14),
      pp_BillReference: 'billRef' + Date.now(),
      pp_Description: 'Order payment',
      pp_ReturnURL: process.env.JAZZ_RETURN_URL,
      pp_SecureHash: '',
    };

    // Generate secure hash
    const sortedKeys = Object.keys(formData).sort();
    let hashString = process.env.JAZZ_INTEGRITY_SALT;
    for (const key of sortedKeys) {
      if (key !== 'pp_SecureHash' && formData[key]) {
        hashString += `&${formData[key]}`;
      }
    }
    formData.pp_SecureHash = crypto.createHmac('sha256', process.env.JAZZ_INTEGRITY_SALT)
      .update(hashString)
      .digest('hex');

    // Create order
    const order = new Order({
      user: user._id,
      items: user.cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      total,
      shipping,
      paymentMethod: 'jazzcash',
      transactionId: txnRef,
      status: 'processing',
    });
    await order.save();

    // Update product stock
    for (const item of user.cart) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    user.cart = [];
    await user.save();

    res.json({
      action: process.env.JAZZ_SANDBOX_URL,
      formData,
    });
  } catch (error) {
    console.error('JazzCash checkout error:', error);
    res.status(500).json({ message: 'Failed to initiate JazzCash payment', error: error.message });
  }
});

// JazzCash Return Handler
router.post('/jazz/return', async (req, res) => {
  try {
    const { pp_TxnRefNo, pp_ResponseCode } = req.body;
    console.log('JazzCash return:', req.body); // Debug log
    if (pp_ResponseCode === '000') {
      await Order.findOneAndUpdate(
        { transactionId: pp_TxnRefNo },
        { status: 'completed' }
      );
      res.redirect(`${process.env.CLIENT_URL}/checkout/success?txnRef=${pp_TxnRefNo}`);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/checkout?error=Payment failed`);
    }
  } catch (error) {
    console.error('JazzCash return error:', error);
    res.redirect(`${process.env.CLIENT_URL}/checkout?error=Payment processing error`);
  }
});

// JazzCash IPN Handler
router.post('/jazz/ipn', async (req, res) => {
  try {
    const { pp_TxnRefNo, pp_ResponseCode } = req.body;
    console.log('JazzCash IPN:', req.body); // Debug log
    if (pp_ResponseCode === '000') {
      await Order.findOneAndUpdate(
        { transactionId: pp_TxnRefNo },
        { status: 'completed' }
      );
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('JazzCash IPN error:', error);
    res.status(500).send('Error');
  }
});

module.exports = router;