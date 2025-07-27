import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationsContext';
import LogoutModal from './LogoutModal';

const AdminSidebar = ({ isOpen, isMobile, onClose, onOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { unreadCount } = useNotifications();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Refs for touch handling
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  // Enhanced Swipe Gesture Logic
  useEffect(() => {
    if (!isMobile) return;

    const SWIPE_THRESHOLD = 50;
    const EDGE_THRESHOLD = 50;
    const MAX_TIME = 500;
    const MAX_VERTICAL_DISTANCE = 150;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = Math.abs(touch.clientY - touchStartY.current);
      
      // Only prevent default for significant horizontal movement
      if (Math.abs(deltaX) > 20 && Math.abs(deltaX) > deltaY) {
        // Horizontal swipe detected
      }
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      const touchEndTime = Date.now();
      
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = Math.abs(touchEndY - touchStartY.current);
      const swipeTime = touchEndTime - touchStartTime.current;

      // Reset touch values
      touchStartX.current = 0;
      touchStartY.current = 0;
      touchStartTime.current = 0;

      // Validate swipe
      const isValidHorizontalSwipe = 
        Math.abs(deltaX) >= SWIPE_THRESHOLD &&
        deltaY <= MAX_VERTICAL_DISTANCE &&
        swipeTime <= MAX_TIME;

      if (!isValidHorizontalSwipe) {
        return;
      }

      const isRightSwipe = deltaX > 0;
      const isLeftSwipe = deltaX < 0;
      const startedFromEdge = touchStartX.current <= EDGE_THRESHOLD;

      // Open sidebar: right swipe from left edge when closed
      if (!isOpen && isRightSwipe && startedFromEdge) {
        onOpen();
        return;
      }

      // Close sidebar: left swipe when open
      if (isOpen && isLeftSwipe) {
        onClose();
        return;
      }
    };

    // Use capture phase and passive: false for better control
    const options = { passive: false, capture: true };
    
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, options);
      document.removeEventListener('touchmove', handleTouchMove, { passive: true });
      document.removeEventListener('touchend', handleTouchEnd, options);
    };
  }, [isOpen, isMobile, onOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (isMobile && isOpen && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setIsHovered(false);
  };

  const handleLogout = () => setShowLogoutModal(true);
  
  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(navigate);
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };
  
  const cancelLogout = () => setShowLogoutModal(false);
  
  const handleLinkClick = () => {
    if (isMobile) onClose();
  };
  
  const isExpanded = isOpen || (!isMobile && isHovered);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: ( <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 15C8 16.1046 7.10457 17 6 17C4.89543 17 4 16.1046 4 15C4 13.8954 4.89543 13 6 13C7.10457 13 8 13.8954 8 15Z" fill="currentColor" /><path d="M14 15C14 16.1046 13.1046 17 12 17C10.8954 17 10 16.1046 10 15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15Z" fill="currentColor" /><path d="M18 13C19.1046 13 20 13.8954 20 15C20 16.1046 19.1046 17 18 17C16.8954 17 16 16.1046 16 15C16 13.8954 16.8954 13 18 13Z" fill="currentColor" /><path d="M14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7Z" fill="currentColor" /></svg> )},
    { name: 'Inbox', path: '/admin/inbox', icon: ( <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7H20V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 7L10.1314 11.0657C11.2729 11.8187 12.7271 11.8187 13.8686 11.0657L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> )},
    { name: 'All Orders', path: '/admin/orders', icon: ( <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> )},
    { name: 'Product Stock', path: '/admin/products/stock', icon: ( <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> )},
    { name: 'Bookings', path: '/admin/bookings', icon: ( <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.31802 6.31802C2.56066 8.07538 2.56066 10.9246 4.31802 12.682L12 20.364L19.682 12.682C21.4393 10.9246 21.4393 8.07538 19.682 6.31802C17.9246 4.56066 15.0754 4.56066 13.318 6.31802L12 7.63604L10.682 6.31802C8.92462 4.56066 6.07538 4.56066 4.31802 6.31802Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> )},
    { name: 'Notifications', path: '/admin/notifications', icon: ( <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 17H20L18.5955 15.5955C18.2157 15.2157 18 14.6976 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6976 5.78428 15.2157 5.40446 15.5955L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> )},
  ];

  const otherNavItems = [
    { name: 'Newsletter', path: '/admin/newletter', icon: ( <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5H21V15H17C16.4477 15 16 15.4477 16 16V17C16 18.6569 14.6569 20 13 20H11C9.34315 20 8 18.6569 8 17V16C8 15.4477 7.55228 15 7 15H3V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 10L9 13L15 13L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> )},
    { name: 'Delivery', path: '/admin/delivery', icon: ( <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7H16V17H3V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 11H20L21.5 13V17H16V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7.5" cy="17.5" r="1.5" fill="currentColor"/><circle cx="18.5" cy="17.5" r="1.5" fill="currentColor"/></svg> )},
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 z-50 h-screen flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isExpanded || (isOpen && isMobile) ? 'translate-x-0 w-64' : '-translate-x-full lg:w-20'
        }`}
      >
        <div className={`flex items-center pt-6 pb-6 ${isExpanded ? 'justify-between px-6' : 'justify-center'}`}>
          <img src="/assets/images/icons/leksy-logo.png" alt="Logo" className={`transition-all duration-300 ${isExpanded ? 'w-28' : 'w-14'}`} />
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 lg:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) => `flex items-center w-full py-3 transition-colors duration-200 ${isExpanded ? 'px-6' : 'px-4 justify-center'} ${isActive ? 'bg-pink-50 text-pink-500' : 'text-gray-700 hover:bg-gray-100'}`}
                  title={!isExpanded ? item.name : ''}
                >
                  <span className={location.pathname.startsWith(item.path) ? 'text-pink-500' : 'text-gray-500'}>{item.icon}</span>
                  <div className={`flex items-center justify-between w-full ml-3 whitespace-nowrap transition-all duration-200 ${isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    <span>{item.name}</span>
                    {item.name === 'Notifications' && unreadCount > 0 && (
                      <span className="bg-pink-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </NavLink>
              </li>
            ))}

            <li className={`transition-all duration-300 ${isExpanded ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0 overflow-hidden'}`}>
              <div className="pt-6 pb-2">
                <div className="px-6 text-xs font-medium uppercase tracking-wider text-gray-500">Other Sections</div>
              </div>
            </li>

            {otherNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) => `flex items-center w-full py-3 transition-colors duration-200 ${isExpanded ? 'px-6' : 'px-4 justify-center'} ${isActive ? 'bg-pink-50 text-pink-500' : 'text-gray-700 hover:bg-gray-100'}`}
                  title={!isExpanded ? item.name : ''}
                >
                  <span className={location.pathname.startsWith(item.path) ? 'text-pink-500' : 'text-gray-500'}>{item.icon}</span>
                  <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                    {item.name}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center w-full py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors ${isExpanded ? 'px-6' : 'px-4 justify-center'} ${isLoggingOut ? 'opacity-50' : ''}`}
            title={!isExpanded ? 'Logout' : ''}
          >
            <span><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 16L21 12M21 12L17 8M21 12H9M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
              Log-out
            </span>
          </button>
        </div>
      </div>
      
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