import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CheckoutForm from './pages/CheckoutForm.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import CartPopup from './components/CartPopup.jsx';
import About from './pages/About.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Login from './pages/Login.jsx';
import Contact from './pages/Contact.jsx';
import Deals from './pages/Deals.jsx';
import SearchPage from './pages/SearchPage.jsx';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Player } from '@lottiefiles/react-lottie-player';
import { AuthProvider, useAuth } from './components/AuthContext.jsx';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function AppContent() {
  const { user, login, logout } = useAuth();
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState(null);
  const [showAlert, setShowAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const productRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`, {
          headers: { 'ngrok-skip-browser-warning': 'true' },
        });
        console.log('Fetched products:', productRes.data);
        setProducts(productRes.data);
        setAllProducts(productRes.data);

        const token = localStorage.getItem('token');
        if (token) {
          const userRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
          });
          login(userRes.data, token);
          const cartRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/cart`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
          });
          setCart(cartRes.data);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          logout();
          setCart([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    if (searchQuery.trim()) {
      const filtered = allProducts.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('Filtered products:', filtered);
      setProducts(filtered);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      setProducts(allProducts);
      navigate('/products');
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setProducts(allProducts);
    navigate('/products');
  };

  const addToCart = async (product) => {
    if (!user) {
      setShowAlert('Please login first to add to cart');
      setTimeout(() => setShowAlert(null), 3000);
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/add`,
        { productId: product._id, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
      setCart(res.data);
      setShowAlert('Added to cart successfully!');
      setTimeout(() => setShowAlert(null), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setShowAlert('Failed to add to cart');
      setTimeout(() => setShowAlert(null), 3000);
    }
  };

  const handleLogout = () => {
    console.log('Executing logout');
    logout();
    setCart([]);
    localStorage.removeItem('token');
    navigate('/');
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/api/cart/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      setCart(res.data);
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/cart/update`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
      setCart(res.data);
    } catch (err) {
      console.error('Error updating cart:', err);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setShowAlert('Please login to proceed with checkout');
      setTimeout(() => setShowAlert(null), 3000);
      navigate('/login');
      return;
    }
    setCartOpen(false);
    navigate('/checkout');
  };

  const handleOrderConfirm = (orderData) => {
    setOrder(orderData);
    navigate('/checkout/success');
  };

  const handleContinueShopping = () => {
    setOrder(null);
    setCart([]);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        user={user}
        onLogout={handleLogout}
        cart={cart}
        resetSearch={resetSearch}
        className="sticky top-0 z-50"
      />
      <AnimatePresence>
        {showAlert && (
          <motion.div
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
              showAlert.includes('success') ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Player
              src="https://lottie.host/niB6nvbCj4/niB6nvbCj4.json"
              className="w-10 h-10"
              autoplay
              loop={false}
            />
            <span className="text-sm font-semibold">{showAlert}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={<ProductPage products={products} cart={cart} onAddToCart={addToCart} />}
          />
          <Route
            path="/products"
            element={<ProductPage products={products} cart={cart} onAddToCart={addToCart} />}
          />
          <Route path="/search" element={<SearchPage products={products} cart={cart} onAddToCart={addToCart} />} />
          <Route path="/deals" element={<Deals products={products} onAddToCart={addToCart} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                user.isAdmin ? <AdminDashboard user={user} /> : <Navigate to="/" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/checkout"
            element={
              user ? (
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    onConfirm={handleOrderConfirm}
                    onCancel={() => setCartOpen(true)}
                    cart={cart}
                  />
                </Elements>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/checkout/success"
            element={
              order ? (
                <OrderConfirmation
                  order={order}
                  onContinueShopping={handleContinueShopping}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </main>
      <CartPopup
        cart={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
        onCheckout={handleCheckout}
      />
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <img
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d5f0ffcd-5b16-4baf-a902-d6b754949191.png"
                  alt="TechNova logo"
                  className="mr-2 h-8 w-8 rounded-full"
                />
                TechNova
              </h3>
              <p className="text-gray-300 text-sm">Premium electronics and cutting-edge gadgets</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-gray-300 hover:text-white transition">Home</a></li>
                <li><a href="/products" className="text-gray-300 hover:text-white transition">Products</a></li>
                <li><a href="/deals" className="text-gray-300 hover:text-white transition">Deals</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white transition">About</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition">FAQs</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <address className="not-italic text-gray-300 text-sm">
                <p>123 Tech Street</p>
                <p>Gulberg Street, Pakistan</p>
                <p>Email: wikiansari315@gmail.com</p>
                <p>Phone: +923180414751</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 text-center text-gray-300 text-sm">
            <p>© {new Date().getFullYear()} TechNova. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;