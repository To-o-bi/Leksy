import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const DashboardStats = ({ dashboardData }) => {
  // Format currency with Naira symbol
  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-normal text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {dashboardData.totalUsers.toLocaleString()}
            </p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-green-500 flex items-center">
                <ArrowUp size={14} className="mr-1" />
                8.5%
              </span>
              <span className="text-gray-500 ml-1">Up from yesterday</span>
            </div>
          </div>
          <div className="bg-indigo-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Total Orders Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-normal text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {dashboardData.totalOrders.toLocaleString()}
            </p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-green-500 flex items-center">
                <ArrowUp size={14} className="mr-1" />
                1.3%
              </span>
              <span className="text-gray-500 ml-1">Up from past week</span>
            </div>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Total Sales Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-normal text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {formatCurrency(dashboardData.totalSales)}
            </p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-red-500 flex items-center">
                <ArrowDown size={14} className="mr-1" />
                4.3%
              </span>
              <span className="text-gray-500 ml-1">Down from yesterday</span>
            </div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Total Pending Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-normal text-gray-600">Total Pending</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {dashboardData.totalPending}
            </p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-green-500 flex items-center">
                <ArrowUp size={14} className="mr-1" />
                1.8%
              </span>
              <span className="text-gray-500 ml-1">Up from yesterday</span>
            </div>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;