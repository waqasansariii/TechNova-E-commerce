const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // Added price field
  }],
  total: { type: Number, required: true },
  shipping: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String },
  status: { type: String, default: 'processing' },
  createdAt: { type: Date, default: Date.now }, // Renamed from date
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);