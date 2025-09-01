import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthContext.jsx';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ onConfirm, onCancel, cart }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    paymentMethod: 'stripe', // Default to Stripe
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    const requiredFields = ['name', 'email', 'address', 'city', 'state', 'zip'];
    requiredFields.forEach(key => {
      if (!formData[key].trim()) {
        newErrors[key] = 'This field is required';
      }
    });

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.zip && !/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      newErrors.zip = 'Invalid ZIP code format (e.g., 12345 or 12345-6789)';
    }

    if (formData.state && !/^[A-Z]{2}$/.test(formData.state)) {
      newErrors.state = 'State must be a 2-letter code (e.g., CA)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStripeCheckout = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const stripe = await stripePromise;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/checkout/create-checkout-session`,
        { cart, shipping: formData }, // Include shipping
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      const { id } = response.data;
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (error) {
      console.error('Error creating Stripe checkout:', error);
      setErrors({ form: error.response?.data?.message || 'Failed to initiate Stripe payment.' });
      setLoading(false);
    }
  };

  const handleJazzCashCheckout = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/checkout/create-jazzcash-checkout`,
        { shipping: formData }, // Include shipping
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      const { action, formData: jazzFormData } = response.data; // Renamed to avoid shadowing

      // Create form dynamically for JazzCash redirection
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = action;

      Object.keys(jazzFormData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = jazzFormData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Error initiating JazzCash payment:', error);
      setErrors({ form: error.response?.data?.message || 'Failed to initiate JazzCash payment.' });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setErrors({ form: 'Please log in to proceed with checkout.' });
      navigate('/login');
      return;
    }

    if (formData.paymentMethod === 'stripe') {
      await handleStripeCheckout();
    } else if (formData.paymentMethod === 'jazzcash') {
      await handleJazzCashCheckout();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="container mx-auto px-4 sm:px-6 py-8 sm:py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {loading && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-semibold">{successMessage}</span>
          </motion.div>
        )}
        {errors.form && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-semibold">{errors.form}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="max-w-lg sm:max-w-xl md:max-w-2xl mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-1"
        variants={itemVariants}
      >
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center"
            variants={itemVariants}
          >
            Checkout
          </motion.h2>
          <form onSubmit={handleSubmit}>
            <motion.div className="mb-6 sm:mb-8" variants={itemVariants}>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Shipping Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  { label: 'Full Name', name: 'name', type: 'text' },
                  { label: 'Email', name: 'email', type: 'email' },
                  { label: 'Address', name: 'address', type: 'text', colSpan: 'sm:col-span-2' },
                  { label: 'City', name: 'city', type: 'text' },
                  { label: 'State/Province', name: 'state', type: 'text' },
                  { label: 'Zip/Postal Code', name: 'zip', type: 'text' },
                ].map(({ label, name, type, colSpan }) => (
                  <motion.div key={name} className={colSpan || ''} variants={itemVariants}>
                    <label className="block text-gray-700 text-sm sm:text-base font-medium mb-2">{label}</label>
                    <motion.input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <AnimatePresence>
                      {errors[name] && (
                        <motion.p
                          className="text-red-500 text-xs sm:text-sm mt-1"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {errors[name]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div className="mb-6 sm:mb-8" variants={itemVariants}>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Payment Method</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={formData.paymentMethod === 'stripe'}
                    onChange={handleChange}
                    className="form-radio h-5 w-5 text-indigo-600"
                  />
                  <span className="text-gray-700 text-sm sm:text-base">Stripe (Credit/Debit Card)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="jazzcash"
                    checked={formData.paymentMethod === 'jazzcash'}
                    onChange={handleChange}
                    className="form-radio h-5 w-5 text-indigo-600"
                  />
                  <span className="text-gray-700 text-sm sm:text-base">JazzCash</span>
                </label>
              </div>
            </motion.div>
            <motion.div className="flex flex-col sm:flex-row justify-between gap-4" variants={itemVariants}>
              <motion.button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Cart
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading || !cart.length}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base transition ${
                  loading || !cart.length ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                whileHover={{ scale: loading || !cart.length ? 1 : 1.05 }}
                whileTap={{ scale: loading || !cart.length ? 1 : 0.95 }}
              >
                {loading ? 'Processing...' : `Pay with ${formData.paymentMethod === 'stripe' ? 'Stripe' : 'JazzCash'}`}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default CheckoutForm;