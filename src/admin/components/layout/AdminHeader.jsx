import React from 'react';
import { useLocation } from 'react-router-dom';

const AdminHeader = ({ toggleSidebar }) => {
  const location = useLocation();

  // Get the page title based on the current route
  const getPageTitle = () => {
    // Extract the last part of the path
    const path = location.pathname.split('/').pop() || 'dashboard';

    switch (path) {
      case 'dashboard':
        return 'Dashboard';
      case 'inbox':
        return 'Inbox';
      case 'orders':
        return 'All Orders';
      case 'product-stock':
        return 'Product Stock';
      case 'bookings':
        return 'Bookings';
      case 'notifications':
        return 'Notifications';
      case 'customers':
        return 'Customers';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1> */}
        </div>

        <div className="flex items-center space-x-4">
          <a href="/" className='text-pink-500'>Go to Website</a>
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-64 bg-gray-50 rounded-lg py-2 pl-10 pr-4 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Notifications */}
          <button className="relative text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 h-5 w-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              5
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
              <img src="/assets/images/avatars/avatar-1.jpg" alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium">Leksy Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;