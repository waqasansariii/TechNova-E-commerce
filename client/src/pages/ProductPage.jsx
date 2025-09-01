import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';

function ProductPage({ cart, onAddToCart }) {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from /api/products');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
        const productsWithFullUrls = response.data.map(product => ({
          ...product,
          image: product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_API_URL}${product.image}`,
        }));
        setProducts(productsWithFullUrls);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map(product => product.category))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    if (!user) {
      setAlertMessage('Please login first to add product to cart');
      setTimeout(() => setAlertMessage(null), 3000);
    } else {
      onAddToCart(product);
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
        {alertMessage && (
          <motion.div
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
              alertMessage.includes('Please login') ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {alertMessage.includes('Please login') ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              )}
            </svg>
            <span className="text-sm sm:text-base font-semibold">{alertMessage}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            className="text-center py-12 text-red-500 text-sm sm:text-base"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="mb-8 sm:mb-12" variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">Featured Tech Products</h1>
        <p className="text-gray-500 text-sm sm:text-base md:text-lg text-center mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto">
          Discover the latest in cutting-edge technology with our premium selection
        </p>
      </motion.div>

      <motion.div
        className="max-w-lg sm:max-w-xl md:max-w-2xl mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-1 mb-8 sm:mb-12"
        variants={itemVariants}
      >
        <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between"
            variants={containerVariants}
          >
            <motion.div className="md:w-1/2 mb-4 md:mb-0" variants={itemVariants}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-gray-800">Summer Tech Sale!</h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4">Up to 30% off on selected items</p>
              <motion.button
                className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Shop Now
              </motion.button>
            </motion.div>
            <motion.div className="md:w-1/2" variants={itemVariants}>
              <img
                src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/71207bc9-5e14-4f85-9e7a-f26f5c641cbc.png"
                alt="Tech Sale Banner"
                className="w-full h-32 sm:h-48 md:h-64 object-cover rounded-lg"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4"
        variants={containerVariants}
      >
        <motion.div className="w-full md:w-64" variants={itemVariants}>
          <motion.input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            whileFocus={{ scale: 1.02 }}
          />
        </motion.div>
        <motion.div
          className="flex overflow-x-auto pb-2 space-x-2 w-full md:w-auto"
          variants={containerVariants}
        >
          {categories.map(category => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm sm:text-base ${
                activeCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {user ? (
          <motion.button
            onClick={() => {
              logout();
              setAlertMessage('Logged out successfully!');
              setTimeout(() => setAlertMessage(null), 3000);
            }}
            className="mb-6 bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 transition text-sm sm:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        ) : (
          <Link to="/login">
            <motion.div
              className="mb-6 bg-green-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-600 transition text-sm sm:text-base text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.div>
          </Link>
        )}
      </motion.div>

      {filteredProducts.length === 0 && !error && !loading ? (
        <motion.div
          className="text-center py-12"
          variants={itemVariants}
        >
          <p className="text-gray-500 text-sm sm:text-base">No products found matching your criteria.</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={containerVariants}
        >
          {filteredProducts.map(product => (
            <motion.div key={product._id} variants={itemVariants}>
              <ProductCard
                product={product}
                onAddToCart={() => handleAddToCart(product)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default ProductPage;