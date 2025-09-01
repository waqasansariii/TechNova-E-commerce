import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductPage from './ProductPage.jsx';

function SearchPage({ products, cart, onAddToCart }) {
  const { search } = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(search).get('q') || '';

  return (
    <motion.div
      className="container mx-auto px-4 sm:px-6 py-8 sm:py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          {query ? `Search Results for "${query}"` : 'All Products'}
        </h1>
        <motion.button
          onClick={() => navigate('/products')}
          className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300 text-sm sm:text-base"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Products
        </motion.button>
      </div>
      {products.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading products or no products found matching your search.</p>
        </motion.div>
      ) : (
        <ProductPage products={products} cart={cart} onAddToCart={onAddToCart} />
      )}
    </motion.div>
  );
}

export default SearchPage;