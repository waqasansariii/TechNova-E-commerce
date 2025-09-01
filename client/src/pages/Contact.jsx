import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.message) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      setErrors({});
      try {
        // Simulate API call (replace with actual endpoint if available)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccessMessage('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        setErrors({ form: 'Failed to send message. Please try again.' });
      } finally {
        setLoading(false);
      }
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
      <motion.h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 text-center"
        variants={itemVariants}
      >
        Contact Us
      </motion.h1>
      <motion.p
        className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-center max-w-2xl mx-auto"
        variants={itemVariants}
      >
        Have questions or need assistance? Reach out to our team at TechNova.
      </motion.p>
      <motion.div
        className="max-w-lg sm:max-w-xl md:max-w-2xl mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-1"
        variants={itemVariants}
      >
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <motion.h2
            className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-center"
            variants={itemVariants}
          >
            Get in Touch
          </motion.h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <motion.div variants={itemVariants}>
              <label className="block text-gray-700 text-sm sm:text-base font-medium mb-2">Name</label>
              <motion.input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                placeholder="Your Name"
                whileFocus={{ scale: 1.02 }}
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    className="text-red-500 text-xs sm:text-sm mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-gray-700 text-sm sm:text-base font-medium mb-2">Email</label>
              <motion.input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                placeholder="Your Email"
                whileFocus={{ scale: 1.02 }}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    className="text-red-500 text-xs sm:text-sm mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-gray-700 text-sm sm:text-base font-medium mb-2">Message</label>
              <motion.textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                placeholder="Your Message"
                rows="5"
                whileFocus={{ scale: 1.02 }}
              />
              <AnimatePresence>
                {errors.message && (
                  <motion.p
                    className="text-red-500 text-xs sm:text-sm mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base transition ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </motion.button>
          </form>
          <motion.div className="mt-6 sm:mt-8" variants={itemVariants}>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-center">Contact Information</h3>
            <div className="space-y-2 text-gray-600 text-sm sm:text-base">
              <p className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email: wikiansari315@gmail.com
              </p>
              <p className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Phone: +923180414751
              </p>
              <p className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address: 123 Tech Street, Gulberg Lahore, Pakistan
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Contact;