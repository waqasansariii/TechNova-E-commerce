import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../components/AuthContext.jsx';

function Deals({ products }) {
  const { user } = useAuth();
  const [alertMessage, setAlertMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Assuming async loading

  // Transform relative image paths to absolute URLs
  const dealProducts = products
    .filter(product => product.price < 500) // Filter products under $500
    .map(product => ({
      ...product,
      image: product.image?.startsWith('http') ? product.image : `${process.env.REACT_APP_API_URL}${product.image || ''}`,
    }));

  // Handle add to cart with login check
  const handleAddToCart = (product) => {
    if (!user) {
      setAlertMessage('Please login first to add product to cart');
      setTimeout(() => setAlertMessage(null), 3000);
    } else {
      // Assuming onAddToCart is passed to ProductCard for logged-in users
      setAlertMessage('Product added to cart!');
      setTimeout(() => setAlertMessage(null), 3000);
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
      {isLoading && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
      <motion.h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-4 text-center"
        variants={itemVariants}
      >
        Special Deals
      </motion.h1>
      <motion.p
        className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-center max-w-2xl mx-auto"
        variants={itemVariants}
      >
        Grab the best deals on our premium tech products!
      </motion.p>
      <motion.div
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 sm:p-8 mb-8 sm:mb-12 text-white text-center"
        variants={itemVariants}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Limited Time Offers!</h2>
        <p className="text-indigo-100 text-sm sm:text-base">Save big on selected tech items under $500!</p>
      </motion.div>
      {dealProducts.length === 0 ? (
        <motion.div
          className="text-center py-12"
          variants={itemVariants}
        >
          <p className="text-gray-600 text-sm sm:text-base">No deals available at the moment.</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={containerVariants}
        >
          {dealProducts.map(product => (
            <motion.div key={product._id} variants={itemVariants}>
              <ProductCard product={product} onAddToCart={() => handleAddToCart(product)} />
            </motion.div>
          ))}
        </motion.div>
      )}
      <motion.div
        className="mt-8 sm:mt-12 bg-white rounded-xl shadow-md p-6 sm:p-8 text-center"
        variants={itemVariants}
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Don’t Miss Out!</h2>
        <p className="text-gray-600 text-sm sm:text-base mb-4">
          Subscribe to our newsletter for the latest deals and updates.
        </p>
        <motion.button
          className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Subscribe Now
        </motion.button>
      </motion.div>
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
              alertMessage.includes('success') ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-semibold">{alertMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Deals;