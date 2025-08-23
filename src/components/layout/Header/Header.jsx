import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { WishlistContext } from '../../../contexts/WishlistContext';
import { useCart } from '../../../hooks/useCart';
import { Link, useLocation } from 'react-router-dom';
import logo from '/assets/images/icons/leksy-logo.png';
import CartDropdown from './CartDropdown';
import WishlistDropdown from './WishlistDropdown';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Get cart from useCart hook
  const { cart, totalItems } = useCart();
  
  // Get wishlist from WishlistContext
  const { wishlist } = useContext(WishlistContext);
  const wishlistCount = wishlist.length;
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setCartOpen(false);
    setWishlistOpen(false);
  }, [location]);
  
  // Check if current path matches nav item path
  const isActive = (path) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Consultation', path: '/consultation' },
    { name: 'Contact us', path: '/contact' },
  ];

  // Toggle cart dropdown
  const toggleCart = (e) => {
    e.preventDefault();
    setCartOpen(!cartOpen);
    if (wishlistOpen) setWishlistOpen(false);
  };

  // Toggle wishlist dropdown
  const toggleWishlist = (e) => {
    e.preventDefault();
    setWishlistOpen(!wishlistOpen);
    if (cartOpen) setCartOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 bg-white ${scrolled ? 'shadow-md' : ''} transition-all duration-300`}>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-4">
        {/* Desktop Header - Only visible on large screens (lg and up) */}
        <div className="hidden lg:flex justify-between items-center py-3">
          {/* Navigation */}
          <Navigation />
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="block">
              <img src={logo} alt="Leksy Cosmetics" className="h-12" />
            </Link>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-6">
            {/* Wishlist Button */}
            <button 
              onClick={toggleWishlist}
              className={`relative ${wishlistOpen || isActive('/wishlist') ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'} transition-colors duration-300`}
              aria-label="Wishlist"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>
            
            {/* Cart Button */}
            <button 
              onClick={toggleCart}
              className={`relative ${cartOpen || isActive('/cart') ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'} transition-colors duration-300`}
              aria-label="Shopping Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile & Tablet Header - Visible on all screens below lg */}
        <div className="flex lg:hidden justify-between items-center py-2 sm:py-3">
          {/* Mobile Menu Button */}
          <button 
            className="text-gray-700 focus:outline-none p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="block">
              <img src={logo} alt="Leksy Cosmetics" className="h-10 sm:h-11 md:h-12" />
            </Link>
          </div>
          
          {/* Mobile Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Wishlist Button (Mobile) */}
            <button 
              onClick={toggleWishlist}
              className={`relative p-1 ${wishlistOpen ? 'text-pink-500' : 'text-gray-600 active:text-pink-500'} touch-manipulation`}
              aria-label="Wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-xs text-white rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs sm:text-sm">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>
            
            {/* Cart Button (Mobile) */}
            <button 
              onClick={toggleCart}
              className={`relative p-1 ${cartOpen ? 'text-pink-500' : 'text-gray-600 active:text-pink-500'} touch-manipulation`}
              aria-label="Shopping Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-xs text-white rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs sm:text-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile & Tablet Navigation Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>
      
      {/* Mobile & Tablet Slide-out Menu */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-64 xs:w-72 sm:w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img src={logo} alt="Leksy Cosmetics" className="h-8 sm:h-9" />
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-500 hover:text-gray-700 p-1 touch-manipulation"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link 
                  to={item.path} 
                  className={`block py-3 px-3 rounded-md transition-colors duration-200 text-base sm:text-lg touch-manipulation ${
                    isActive(item.path) 
                      ? 'bg-pink-50 text-pink-500 font-medium' 
                      : 'text-gray-800 hover:bg-gray-50 hover:text-pink-500 active:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex justify-between items-center">
            <Link
              to="/wishlist"
              className="flex items-center space-x-2 text-gray-700 hover:text-pink-500 active:text-pink-600 py-2 px-2 rounded touch-manipulation"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm sm:text-base">Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</span>
            </Link>
            <Link
              to="/cart"
              className="flex items-center space-x-2 text-gray-700 hover:text-pink-500 active:text-pink-600 py-2 px-2 rounded touch-manipulation"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-sm sm:text-base">Cart{totalItems > 0 ? ` (${totalItems})` : ''}</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Cart Dropdown */}
      <CartDropdown 
        isOpen={cartOpen} 
        type="cart" 
        onClose={() => setCartOpen(false)} 
      />
      
      {/* Wishlist Dropdown */}
      <WishlistDropdown 
        isOpen={wishlistOpen} 
        onClose={() => setWishlistOpen(false)} 
      />
    </header>
  );
};

// Navigation Component
const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Consultation', path: '/consultation' },
    { name: 'Contact us', path: '/contact' },
  ];
  
  // Check if current path matches nav item path
  const isActive = (path) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };
  
  return (
    <nav>
      <ul className="flex space-x-6">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`text-gray-800 hover:text-pink-500 relative pb-2 transition-colors duration-300 ${
                isActive(item.path) ? 'text-pink-500 font-medium' : ''
              }`}
            >
              {item.name}
              {isActive(item.path) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500 rounded-full"></span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Header;