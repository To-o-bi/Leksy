import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import LogoutModal from './LogoutModal';

const AdminSidebar = ({ isOpen, isMobile, onClose }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Navigation configuration - memoized to prevent recreation
  const navItems = useMemo(() => [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: 'M8 15C8 16.1046 7.10457 17 6 17C4.89543 17 4 16.1046 4 15C4 13.8954 4.89543 13 6 13C7.10457 13 8 13.8954 8 15ZM14 15C14 16.1046 13.1046 17 12 17C10.8954 17 10 16.1046 10 15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15ZM18 13C19.1046 13 20 13.8954 20 15C20 16.1046 19.1046 17 18 17C16.8954 17 16 16.1046 16 15C16 13.8954 16.8954 13 18 13ZM14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7Z'
    },
    {
      name: 'Inbox',
      path: '/admin/inbox',
      icon: 'M4 7H20V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7ZM4 7L10.1314 11.0657C11.2729 11.8187 12.7271 11.8187 13.8686 11.0657L20 7',
      stroke: true
    },
    {
      name: 'All Orders',
      path: '/admin/orders',
      icon: 'M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5',
      stroke: true
    },
    {
      name: 'Product Stock',
      path: '/admin/products',
      icon: 'M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21',
      stroke: true
    },
    {
      name: 'Bookings',
      path: '/admin/bookings',
      icon: 'M4.31802 6.31802C2.56066 8.07538 2.56066 10.9246 4.31802 12.682L12 20.364L19.682 12.682C21.4393 10.9246 21.4393 8.07538 19.682 6.31802C17.9246 4.56066 15.0754 4.56066 13.318 6.31802L12 7.63604L10.682 6.31802C8.92462 4.56066 6.07538 4.56066 4.31802 6.31802Z',
      stroke: true
    },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: 'M15 17H20L18.5955 15.5955C18.2157 15.2157 18 14.6976 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6976 5.78428 15.2157 5.40446 15.5955L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9',
      stroke: true
    }
  ], []);

  const otherNavItems = useMemo(() => [
    {
      name: 'Newsletter',
      path: '/admin/newletter',
      icon: 'M3 5H21V15H17C16.4477 15 16 15.4477 16 16V17C16 18.6569 14.6569 20 13 20H11C9.34315 20 8 18.6569 8 17V16C8 15.4477 7.55228 15 7 15H3V5ZM3 10L9 13L15 13L21 10',
      stroke: true
    },
    {
      name: 'Delivery',
      path: '/admin/delivery',
      icon: 'M3 7H16V17H3V7ZM16 11H20L21.5 13V17H16V11ZM7.5 17.5C7.5 18.3284 6.82843 19 6 19C5.17157 19 4.5 18.3284 4.5 17.5C4.5 16.6716 5.17157 16 6 16C6.82843 16 7.5 16.6716 7.5 17.5ZM18.5 17.5C18.5 18.3284 17.8284 19 17 19C16.1716 19 15.5 18.3284 15.5 17.5C15.5 16.6716 16.1716 16 17 16C17.8284 16 18.5 16.6716 18.5 17.5Z',
      stroke: true
    }
  ], []);

  // Icon component to reduce redundancy
  const Icon = ({ path, stroke = false }) => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d={path} 
        fill={stroke ? "none" : "currentColor"}
        stroke={stroke ? "currentColor" : "none"}
        strokeWidth={stroke ? "2" : "0"}
        strokeLinecap={stroke ? "round" : "square"}
        strokeLinejoin={stroke ? "round" : "miter"}
      />
    </svg>
  );

  // Navigation item component
  const NavItem = ({ item }) => (
    <li key={item.path}>
      <NavLink
        to={item.path}
        onClick={isMobile ? onClose : undefined} // Close mobile sidebar on navigation
        className={({ isActive }) => 
          `flex items-center w-full ${isOpen ? 'px-6' : 'px-3 justify-center'} py-3 text-sm font-medium transition-colors ${
            isActive 
              ? 'bg-pink-50 text-pink-500 border-r-4 border-pink-500' 
              : 'text-gray-700 hover:bg-gray-100'
          }`
        }
        title={!isOpen ? item.name : ''}
      >
        {({ isActive }) => (
          <>
            <span className={isActive ? 'text-pink-500' : 'text-gray-500'}>
              <Icon path={item.icon} stroke={item.stroke} />
            </span>
            {isOpen && <span className="ml-3">{item.name}</span>}
          </>
        )}
      </NavLink>
    </li>
  );

  // Handle logout
  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout('User logout', false); // Don't auto-navigate, we'll handle it
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/admin/login', { replace: true }); // Fallback navigation
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const cancelLogout = () => setShowLogoutModal(false);

  // Get user initials
  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <>
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
        ${isOpen ? 'w-64' : 'w-20'} 
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        h-screen flex flex-col bg-white border-r border-gray-200 
        transition-all duration-300 ease-in-out
      `}>
        
        {/* Logo */}
        <div className={`${isOpen ? 'px-6' : 'px-3 flex justify-center'} pt-6 pb-4`}>
          <img 
            src="/assets/images/icons/leksy-logo.png" 
            alt="Leksy Cosmetics Logo" 
            className={`${isOpen ? 'w-28' : 'w-12'} transition-all duration-300`} 
          />
        </div>

        {/* User Info */}
        {isOpen && user && (
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{userInitials}</span>
              </div>
              <div className="ml-3 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.name || 'Admin'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.role || 'Administrator'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 mt-6 overflow-y-auto">
          <ul className="space-y-1">
            {/* Main Navigation */}
            {navItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}

            {/* Section Divider */}
            {isOpen && (
              <li className="pt-6 pb-2">
                <div className="px-6 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Other Sections
                </div>
              </li>
            )}

            {/* Other Navigation */}
            {otherNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`
              flex items-center w-full ${isOpen ? 'px-2' : 'justify-center'} py-3 
              text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 
              rounded-lg transition-colors
              ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={!isOpen ? 'Logout' : ''}
          >
            <span className="text-gray-500 hover:text-red-500">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 16L21 12M21 12L17 8M21 12H9M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {isOpen && <span className="ml-3">Log out</span>}
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        userName={user?.name}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};

export default AdminSidebar;