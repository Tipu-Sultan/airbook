import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthContext } from '../context/AuthContext';
import { Menu, Plane, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar() {
  const { token, user, setToken } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    setIsMobileMenuOpen(false);
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/flights', label: 'Flights' },
  ];

  if (token && user) {
    navLinks.push({ to: '/profile', label: 'Profile' });
    if (user.user_type === 'Admin') {
      navLinks.push({ to: '/admin-dashboard', label: 'Admin Dashboard' });
    }
  } else {
    navLinks.push(
      { to: '/login', label: 'Login' },
      { to: '/register', label: 'Register' }
    );
  }

  return (
    <nav className="bg-blue-600 text-white py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold flex items-center gap-2" aria-label="AirBook Home">
          <Plane className="h-6 w-6" />
          AirBook
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="sm:hidden focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md p-1"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md transition duration-200 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {token && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:bg-blue-700 px-4 py-2 rounded-md transition duration-200 font-medium"
            >
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="sm:hidden bg-blue-600 overflow-hidden"
          >
            <div className="flex flex-col items-center space-y-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-white hover:bg-blue-700 px-4 py-2 rounded-md transition duration-200 text-lg font-medium w-full text-center"
                  onClick={toggleMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              {token && (
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-white hover:bg-blue-700 px-4 py-2 rounded-md transition duration-200 text-lg font-medium w-full"
                >
                  Logout
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;