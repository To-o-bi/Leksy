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
  const [searchOpen, setSearchOpen] = useState(false);
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
  
  // Close mobile menu and search when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
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
    <header className={`sticky top-0 z-50 bg-white py-2 ${scrolled ? 'shadow-md' : ''} transition-all duration-300`}>
      <div className="container mx-auto px-4 py-3">
        {/* Desktop Header - Only visible on large screens (lg and up) */}
        <div className="hidden lg:flex justify-between items-center">
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
            <SearchBar />
            
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
        <div className="flex lg:hidden justify-between items-center">
          {/* Mobile Menu Button */}
          <button 
            className="text-gray-700 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="block">
              <img src={logo} alt="Leksy Cosmetics" className="h-10" />
            </Link>
          </div>
          
          {/* Mobile Actions */}
          <div className="flex items-center space-x-3">
            {/* Search icon for small mobile screens, full search bar for tablets */}
            <div className="hidden sm:block md:block lg:hidden">
              <TabletSearchBar />
            </div>
            <button
              className="sm:hidden text-gray-600 hover:text-pink-500"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Toggle search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Wishlist Button (Mobile) */}
            <button 
              onClick={toggleWishlist}
              className={`relative ${wishlistOpen ? 'text-pink-500' : 'text-gray-600'}`}
              aria-label="Wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>
            
            {/* Cart Button (Mobile) */}
            <button 
              onClick={toggleCart}
              className={`relative ${cartOpen ? 'text-pink-500' : 'text-gray-600'}`}
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
        
        {/* Mobile Search Bar (Conditional) - Only for smallest screens */}
        {searchOpen && (
          <div className="mt-3 pb-2 sm:hidden">
            <MobileSearchBar onClose={() => setSearchOpen(false)} />
          </div>
        )}
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
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img src={logo} alt="Leksy Cosmetics" className="h-8" />
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link 
                  to={item.path} 
                  className={`block py-2 px-3 rounded-md transition-colors duration-200 ${
                    isActive(item.path) 
                      ? 'bg-pink-50 text-pink-500 font-medium' 
                      : 'text-gray-800 hover:bg-gray-50 hover:text-pink-500'
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
          <div className="flex justify-between">
            <Link
              to="/wishlist"
              className="flex items-center space-x-2 text-gray-700 hover:text-pink-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</span>
            </Link>
            <Link
              to="/cart"
              className="flex items-center space-x-2 text-gray-700 hover:text-pink-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Cart{totalItems > 0 ? ` (${totalItems})` : ''}</span>
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

// SearchBar Component - For desktop view
const SearchBar = () => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search logic
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        placeholder="Search products..."
        className="py-1 pl-3 pr-8 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 w-48"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button 
        type="submit" 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
};

// Tablet SearchBar Component - For tablet view
const TabletSearchBar = () => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search logic
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        placeholder="Search products..."
        className="py-1 pl-3 pr-8 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 w-40"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button 
        type="submit" 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
};

// Mobile SearchBar Component - Full-width for mobile view when expanded
const MobileSearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search logic
    onClose();
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative flex">
      <input
        type="text"
        placeholder="Search products..."
        className="py-2 pl-4 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 w-full"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <button 
        type="submit" 
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
};

export default Header;