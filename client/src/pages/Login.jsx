import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

function Login() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!isLogin && !formData.name) newErrors.name = 'Name is required';
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      setErrors({});
      try {
        const endpoint = isLogin
          ? `${process.env.REACT_APP_API_URL}/api/auth/login`
          : `${process.env.REACT_APP_API_URL}/api/auth/register`;
        console.log('Sending request to:', endpoint);
        const payload = isLogin
          ? { email: formData.email, password: formData.password }
          : { name: formData.name, email: formData.email, password: formData.password };
        const response = await axios.post(endpoint, payload);
        login(response.data.user, response.data.token);
        navigate('/');
      } catch (error) {
        setErrors({ form: error.response?.data?.message || 'An error occurred' });
      } finally {
        setLoading(false);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const inputVariants = {
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
      <motion.div
        className="max-w-sm sm:max-w-md mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-1"
        variants={inputVariants}
      >
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center"
            variants={inputVariants}
          >
            {isLogin ? 'Login' : 'Register'}
          </motion.h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {!isLogin && (
              <motion.div className="mb-4 sm:mb-6" variants={inputVariants}>
                <label className="block text-gray-700 text-sm sm:text-base font-medium mb-2">Name</label>
                <motion.input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
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
            )}
            <motion.div className="mb-4 sm:mb-6" variants={inputVariants}>
              <label className="block text-gray-700 text-sm sm:text-base font-medium mb-2">Email</label>
              <motion.input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
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
            <motion.div className="mb-4 sm:mb-6" variants={inputVariants}>
              <label className="block text-gray-700 text-sm sm:text-base font-medium mb-2">Password</label>
              <div className="relative">
                <motion.input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  whileFocus={{ scale: 1.02 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    className="text-red-500 text-xs sm:text-sm mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
            <AnimatePresence>
              {errors.form && (
                <motion.p
                  className="text-red-500 text-xs sm:text-sm mb-4 sm:mb-6 text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.form}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base transition ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full mt-4 text-indigo-600 hover:text-indigo-800 text-sm sm:text-base font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Login;
