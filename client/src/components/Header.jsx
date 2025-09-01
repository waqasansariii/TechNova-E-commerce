import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function Header({ cartCount, onCartClick, searchQuery, setSearchQuery, handleSearch, user, onLogout, cart, resetSearch, className }) {
  const localCartCount = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    console.log('Logout clicked');
    onLogout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.1 } },
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.header
      className={`bg-gradient-to-r from-purple-700 to-indigo-600 shadow-lg ${className}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col md:flex-row items-center max-w-7xl">
        {/* Logo and Brand */}
        <div className="flex items-center justify-between w-full md:w-auto mb-3 md:mb-0 flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            <motion.img
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d5f0ffcd-5b16-4baf-a902-d6b754949191.png"
              alt="TechNova logo"
              className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full shadow-md"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            />
            <span className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight">TechNova</span>
          </div>
          <motion.button
            className="md:hidden text-white hover:text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-200 rounded p-1"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16"
              />
              <path
                className={`transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 12h16"
              />
              <path
                className={`transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 18h16"
              />
            </svg>
          </motion.button>
        </div>

        {/* Main Content with Fixed Layout */}
        <div className="w-full md:flex md:items-center md:justify-between md:space-x-6 lg:space-x-8 xl:space-x-10 flex-grow">
          {/* Desktop Navigation with Enhanced Spacing */}
          <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6 xl:space-x-8 min-w-[320px] md:min-w-[450px] ml-4 md:ml-0">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'Products' },
              { to: '/deals', label: 'Deals' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
              ...(user && user.isAdmin ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
            ].map(({ to, label }) => (
              <motion.div
                key={to}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex-1 text-center md:flex-none"
              >
                <Link
                  to={to}
                  className="text-white hover:text-yellow-200 transition duration-300 font-semibold text-sm md:text-base lg:text-lg xl:text-xl"
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.nav
                className="flex flex-col md:hidden w-full bg-purple-800 rounded-lg p-4 sm:p-5 mt-2 shadow-lg"
                variants={navVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {[
                  { to: '/', label: 'Home' },
                  { to: '/products', label: 'Products' },
                  { to: '/deals', label: 'Deals' },
                  { to: '/about', label: 'About' },
                  { to: '/contact', label: 'Contact' },
                  ...(user && user.isAdmin ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
                ].map(({ to, label }) => (
                  <motion.div key={to} variants={navItemVariants}>
                    <Link
                      to={to}
                      className="text-white hover:text-yellow-200 transition duration-300 font-semibold text-sm sm:text-base md:text-lg py-1.5 sm:py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 w-full md:w-auto mt-3 md:mt-0">
            <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full shadow-md w-full sm:w-48 md:w-56 lg:w-72 xl:w-80 relative group">
              <motion.input
                type="text"
                placeholder="Search gadgets..."
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-l-full focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full text-gray-900 placeholder-gray-500 text-xs sm:text-sm lg:text-base transition-all duration-300 group-hover:shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                whileFocus={{ scale: 1.02 }}
              />
              {searchQuery && (
                <motion.button
                  type="button"
                  onClick={resetSearch}
                  className="absolute right-10 sm:right-12 lg:right-14 text-gray-500 hover:text-gray-700 p-1"
                  aria-label="Clear search"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
              <motion.button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-r-full transition duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.button>
            </form>
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              {user ? (
                <>
                  <span className="text-white font-medium text-xs sm:text-sm lg:text-base truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                    {user.name}
                  </span>
                  <motion.button
                    onClick={handleLogoutClick}
                    className="text-white hover:text-yellow-200 transition duration-300 font-semibold text-xs sm:text-sm lg:text-base"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link to="/login" className="text-white hover:text-yellow-200 transition duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </Link>
                </motion.div>
              )}
              <motion.button
                onClick={onCartClick}
                className="relative text-white hover:text-yellow-200 transition duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {(localCartCount > 0 || cartCount > 0) && (
                  <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                    {localCartCount || cartCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;