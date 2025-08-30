import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf, FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!isAuthenticated()) {
      return [
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register' }
      ];
    }

    switch (user?.role) {
      case 'producer':
        return [
          { to: '/producer', label: 'Dashboard' },
          { to: '/producer/apply', label: 'Apply for Certification' },
          { to: '/marketplace', label: 'Marketplace' }
        ];
      case 'certifier':
        return [
          { to: '/certifier', label: 'Dashboard' },
          { to: '/marketplace', label: 'Marketplace' }
        ];
      case 'buyer':
        return [
          { to: '/buyer', label: 'My Purchases' },
          { to: '/marketplace', label: 'Marketplace' }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-darksec shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaLeaf className="text-2xl text-primary" />
            <span className="text-xl font-bold text-white">HydrogenCertify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-gray-300 hover:text-primary transition-colors ${
                  location.pathname === link.to ? 'text-primary' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated() ? (
              <>
                <div className="flex items-center space-x-2 text-gray-300">
                  <FaUser className="text-sm" />
                  <span>{user?.name}</span>
                  <span className="text-xs bg-primary px-2 py-1 rounded-full text-white">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-primary px-4 py-2 rounded-lg text-white hover:bg-sky-600 transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-gray-300 hover:text-primary transition-colors ${
                    location.pathname === link.to ? 'text-primary' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {isAuthenticated() && (
                <>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center space-x-2 text-gray-300 mb-2">
                      <FaUser className="text-sm" />
                      <span>{user?.name}</span>
                      <span className="text-xs bg-primary px-2 py-1 rounded-full text-white">
                        {user?.role}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 