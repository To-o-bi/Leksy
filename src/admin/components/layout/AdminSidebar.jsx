import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const AdminSidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const currentPath = location.pathname;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle logout functionality
  const handleLogout = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to logout, ${user?.name || 'Admin'}? You will be redirected to the login page.`
    );
    
    if (confirmed) {
      setIsLoggingOut(true);
      try {
        await logout(navigate); // Will redirect to /login
      } catch (error) {
        console.error('Logout failed:', error);
        // Still redirect to login even if logout fails
        navigate('/login', { replace: true });
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  // Navigation items configuration
  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 15C8 16.1046 7.10457 17 6 17C4.89543 17 4 16.1046 4 15C4 13.8954 4.89543 13 6 13C7.10457 13 8 13.8954 8 15Z" fill="currentColor" />
          <path d="M14 15C14 16.1046 13.1046 17 12 17C10.8954 17 10 16.1046 10 15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15Z" fill="currentColor" />
          <path d="M18 13C19.1046 13 20 13.8954 20 15C20 16.1046 19.1046 17 18 17C16.8954 17 16 16.1046 16 15C16 13.8954 16.8954 13 18 13Z" fill="currentColor" />
          <path d="M14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7Z" fill="currentColor" />
        </svg>
      )
    },
    {
      name: 'Inbox',
      path: '/admin/inbox',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 7H20V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 7L10.1314 11.0657C11.2729 11.8187 12.7271 11.8187 13.8686 11.0657L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      name: 'All Orders',
      path: '/admin/orders',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      name: 'Product Stock',
      path: '/admin/products/stock',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      name: 'Bookings',
      path: '/admin/bookings',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.31802 6.31802C2.56066 8.07538 2.56066 10.9246 4.31802 12.682L12 20.364L19.682 12.682C21.4393 10.9246 21.4393 8.07538 19.682 6.31802C17.9246 4.56066 15.0754 4.56066 13.318 6.31802L12 7.63604L10.682 6.31802C8.92462 4.56066 6.07538 4.56066 4.31802 6.31802Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  const otherNavItems = [
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 17H20L18.5955 15.5955C18.2157 15.2157 18 14.6976 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6976 5.78428 15.2157 5.40446 15.5955L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  return (
    <div className={`h-screen flex flex-col bg-white border-r border-gray-200 ${isOpen ? 'w-64' : 'w-20'} transition-width duration-300`}>
      {/* Logo */}
      <div className={`${isOpen ? 'px-6' : 'px-3'} pt-6`}>
        <img src="/assets/images/icons/leksy-logo.png" alt="Logo" className={isOpen ? 'w-28' : 'w-14'} />
      </div>

      {/* User Info (when expanded) */}
      {isOpen && user && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {user.name || 'Admin'}
              </div>
              <div className="text-xs text-gray-500">
                {user.role || 'Administrator'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 mt-6">
        <ul className="space-y-1">
          {/* Main Nav Items */}
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center w-full px-6 py-3 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-pink-50 text-pink-500 rounded-r-full' 
                      : 'text-gray-700 hover:bg-gray-100 rounded-r-full'
                  }`
                }
              >
                <span className={currentPath === item.path ? 'text-pink-500' : 'text-gray-500'}>
                  {item.icon}
                </span>
                {isOpen && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}

          {/* Other Sections divider */}
          {isOpen && (
            <li className="pt-6 pb-2">
              <div className="px-6 text-xs font-medium uppercase tracking-wider text-gray-500">
                OTHER SECTIONS
              </div>
            </li>
          )}

          {/* Other Nav Items */}
          {otherNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center w-full px-6 py-3 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-pink-50 text-pink-500 rounded-r-full' 
                      : 'text-gray-700 hover:bg-gray-100 rounded-r-full'
                  }`
                }
              >
                <span className={currentPath === item.path ? 'text-pink-500' : 'text-gray-500'}>
                  {item.icon}
                </span>
                {isOpen && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button at Bottom */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center w-full px-2 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors ${
            isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={isOpen ? '' : 'Logout'}
        >
          <span className="text-gray-500 hover:text-red-500">
            {isLoggingOut ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 16L21 12M21 12L17 8M21 12H9M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          {isOpen && (
            <span className="ml-3">
              {isLoggingOut ? 'Logging out...' : 'Log-out'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;