import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion
import ProductCard from '../components/ProductCard';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    topProducts: [],
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    alt: '',
    stock: '',
    imageFile: null,
  });
  const [errors, setErrors] = useState({});
  const [isAdmin, setIsAdmin] = useState(null); // null = loading, false = not admin, true = admin
  const [isLoading, setIsLoading] = useState(true); // Unified loading for data
  const [showAlert, setShowAlert] = useState(false); // State for success alert
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (!token) {
      setErrors({ form: 'Please log in as an admin' });
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Profile:', profileResponse.data);
        setIsAdmin(profileResponse.data.isAdmin);

        if (!profileResponse.data.isAdmin) {
          navigate('/');
          return;
        }

        const [productsResponse, ordersResponse, analyticsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/analytics/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/analytics/sales`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        console.log('Products:', productsResponse.data);
        console.log('Orders:', ordersResponse.data);
        console.log('Analytics:', analyticsResponse.data);

        const productsWithFullUrls = productsResponse.data.map((product) => ({
          ...product,
          image: product.image.startsWith('http')
            ? product.image
            : `${process.env.REACT_APP_API_URL}${product.image}`,
        }));
        setProducts(productsWithFullUrls);
        setOrders(ordersResponse.data);
        setAnalytics(analyticsResponse.data);
      } catch (error) {
        console.error('Fetch error:', error.response?.data || error.message);
        setErrors({ form: error.response?.data?.message || 'Error loading dashboard' });
        setIsLoading(false);
        if (error.response?.status === 401 || error.response?.status === 403) {
          setIsAdmin(false);
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
        console.log('Rendering after data fetch:', {
          productsLength: products.length,
          ordersLength: orders.length,
          analytics,
        });
      }
    };

    fetchData();
  }, [navigate]);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/orders/${orderId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(
        orders.map((order) => (order._id === orderId ? { ...order, status } : order))
      );
    } catch (error) {
      console.error('Update order error:', error.response?.data || error.message);
      setErrors({
        form: error.response?.data?.message || 'Error updating order status',
      });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const requiredFields = ['name', 'price', 'description', 'category', 'alt', 'stock'];
    requiredFields.forEach((key) => {
      if (!newProduct[key].toString().trim()) {
        newErrors[key] = 'This field is required';
      }
    });
    if (newProduct.price && isNaN(newProduct.price)) {
      newErrors.price = 'Price must be a number';
    }
    if (newProduct.stock && isNaN(newProduct.stock)) {
      newErrors.stock = 'Stock must be a number';
    }
    if (!newProduct.image && !newProduct.imageFile) {
      newErrors.image = 'Please provide an image URL or upload a file';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('description', newProduct.description);
      formData.append('category', newProduct.category);
      formData.append('alt', newProduct.alt);
      formData.append('stock', newProduct.stock);
      if (newProduct.imageFile) {
        formData.append('image', newProduct.imageFile);
      } else {
        formData.append('image', newProduct.image);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/products/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const newProductWithFullUrl = {
        ...response.data,
        image: response.data.image.startsWith('http')
          ? response.data.image
          : `${process.env.REACT_APP_API_URL}${response.data.image}`,
      };
      setProducts([...products, newProductWithFullUrl]);
      setNewProduct({
        name: '',
        price: '',
        description: '',
        category: '',
        image: '',
        alt: '',
        stock: '',
        imageFile: null,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setErrors({});
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Add product error:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error adding product. Check network or server.';
      setErrors({ form: errorMessage });
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      console.error('Delete product error:', error.response?.data || error.message);
      setErrors({ form: error.response?.data?.message || 'Error deleting product' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct((prev) => ({
        ...prev,
        imageFile: file,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const handleAddToCart = (product) => {
    console.log(`Added ${product.name} to cart`);
  };

  if (isAdmin === null || isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-600 text-sm sm:text-base mt-4">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  console.log('Rendering Dashboard:', {
    productsLength: products.length,
    ordersLength: orders.length,
    analytics,
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl flex items-center">
              <svg
                className="w-8 h-8 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-lg font-semibold">Product added successfully!</span>
            </div>
          </motion.div>
        )}
        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm sm:text-base font-semibold">{errors.form}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg shadow-lg mb-6"
      >
        <h1 className="text-4xl font-bold text-center">Admin Dashboard</h1>
      </motion.header>

      <motion.img
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d5f0ffcd-5b16-4baf-a902-d6b754949191.png"
        alt="E-commerce dashboard showing product listings, sales analytics, and order management"
        className="mx-auto mb-6 h-48 w-48 rounded-lg sm:h-56 sm:w-56 object-cover shadow-md"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Price</label>
                <input
                  type="text"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  rows="3"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Image</label>
                <div className="mb-2">
                  <label className="block text-sm text-gray-600 mb-1">Enter Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={newProduct.image}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Enter image URL"
                  />
                  {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Upload Image</label>
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                {newProduct.image && (
                  <div className="mt-2">
                    <img
                      src={newProduct.image}
                      alt="Preview"
                      className="h-24 w-24 object-cover rounded sm:h-28 sm:w-28 shadow-md"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Image Alt Text</label>
                <input
                  type="text"
                  name="alt"
                  value={newProduct.alt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                {errors.alt && <p className="text-red-500 text-xs mt-1">{errors.alt}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Stock</label>
                <input
                  type="text"
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
              </div>
            </div>
            {errors.form && <p className="text-red-500 text-xs mb-4">{errors.form}</p>}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors shadow-md"
            >
              Add Product
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sales Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-gray-600">
                Total Revenue: <span className="font-bold text-indigo-600">${analytics.totalRevenue.toFixed(2)}</span>
              </p>
              <p className="text-gray-600">
                Total Orders: <span className="font-bold text-indigo-600">{analytics.totalOrders}</span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Top Products by Sales</h3>
              <ul className="list-disc pl-5 space-y-1">
                {analytics.topProducts.length === 0 ? (
                  <li className="text-gray-600">No top products available</li>
                ) : (
                  analytics.topProducts.map((product) => (
                    <li key={product._id} className="text-gray-600">
                      {product.name}: <span className="font-medium">{product.totalSold} units</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#4a5568" />
                <YAxis stroke="#4a5568" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="totalSold" fill="#4f46e5" barSize={20} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <p className="text-gray-600 text-center col-span-full">No products available</p>
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product._id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  className="relative"
                >
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteProduct(product._id)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-gray-700 font-semibold">Order ID</th>
                  <th className="p-3 text-gray-700 font-semibold">Customer</th>
                  <th className="p-3 text-gray-700 font-semibold">Total</th>
                  <th className="p-3 text-gray-700 font-semibold">Status</th>
                  <th className="p-3 text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr className="border-b">
                    <td colSpan="5" className="p-3 text-gray-600 text-center">
                      No orders available
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-800">{order._id}</td>
                      <td className="p-3 text-gray-800">{order.user.name} ({order.user.email})</td>
                      <td className="p-3 text-gray-800">${order.total.toFixed(2)}</td>
                      <td className="p-3 text-gray-800">{order.status}</td>
                      <td className="p-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className="border rounded-lg p-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AdminDashboard;