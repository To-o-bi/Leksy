import React from 'react';
import { Link, useLocation } from 'react-router-dom';

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
  // For home path, we need exact match, for others check if path starts with nav item path
  const isActive = (path) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  return (
    <nav className="hidden md:block">     
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

export default Navigation;