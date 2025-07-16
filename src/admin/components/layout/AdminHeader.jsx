import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext'; 
import { useNotifications } from '../../../contexts/NotificationsContext'; 

const AdminHeader = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { unreadCount, fetchNotifications } = useNotifications();

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.startsWith('/admin/products/edit/')) return 'Edit Product';
    if (path.startsWith('/admin/bookings/')) return 'View Booking';

    const titles = {
      '/admin/dashboard': 'Dashboard',
      '/admin/inbox': 'Inbox',
      '/admin/orders': 'All Orders',
      '/admin/products/stock': 'Product Stock',
      '/admin/products/add': 'Add New Product',
      '/admin/bookings': 'Bookings',
      '/admin/notifications': 'Notifications',
      '/admin/newletter': 'Newsletter Subscribers',
      '/admin/delivery': 'Delivery Fees',
    };
    return titles[path] || 'Dashboard';
  };

  const handleLogout = async () => {
    try {
      await logout(navigate);
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/" className='text-sm text-pink-500 hover:text-pink-600 font-medium'>Go to Website</Link>
          
          <Link 
            to="/admin/notifications" 
            className="relative group p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            onClick={() => fetchNotifications()}
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 flex items-center justify-center">
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse border-2 border-white shadow-lg">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
                <div className="absolute inset-0 h-6 w-6 bg-red-400 rounded-full animate-ping"></div>
              </div>
            )}
            
            <div className="absolute right-0 top-12 bg-gray-800 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'No new notifications'}
              <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 transform rotate-45"></div>
            </div>
          </Link>

          <div className="relative">
            <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center focus:outline-none">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center overflow-hidden mr-2 text-white font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{user?.name || 'Leksy Admin'}</p>
              </div>
            </button>
            
            <div 
              className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 border border-gray-100 transition-all duration-200 ease-out transform ${
                isProfileOpen 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}
            >
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;