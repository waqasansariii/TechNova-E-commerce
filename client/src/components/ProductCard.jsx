import { motion } from 'framer-motion';

function ProductCard({ product, onAddToCart }) {
  const {
    image = 'https://via.placeholder.com/150',
    alt = 'Product image',
    name = 'Unnamed Product',
    price = 0,
    description = 'No description available',
    stock = 0,
    rating = 0,
  } = product;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="product-card bg-white rounded-xl shadow-md overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="p-4 sm:p-6">
        <div className="relative group">
          <motion.img
            src={image}
            alt={alt}
            className="w-full h-48 sm:h-60 object-contain mb-4 rounded-lg"
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full">
            {stock > 0 ? 'In Stock' : 'Out of Stock'}
          </div>
        </div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{name}</h3>
          <span className="text-indigo-600 font-bold text-base sm:text-lg">Rs{Number(price).toFixed(2)}</span>
        </div>
        <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-5 line-clamp-3">{description}</p>
        <div className="flex items-center mb-4 sm:mb-5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-gray-600 text-xs sm:text-sm ml-2">{Number(rating).toFixed(1)}</span>
        </div>
        <motion.button
          onClick={onAddToCart}
          className={`w-full py-2 px-4 rounded text-sm sm:text-base transition ${
            stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          disabled={stock === 0}
          whileHover={{ scale: stock > 0 ? 1.05 : 1 }}
          whileTap={{ scale: stock > 0 ? 0.95 : 1 }}
        >
          {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default ProductCard;