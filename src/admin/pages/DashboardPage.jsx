import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Filter, ChevronDown, ArrowUpRight } from 'lucide-react';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentOrders from '../components/dashboard/RecentOrders';


const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 4689,
    totalOrders: 80293,
    totalSales: 990000,
    totalPending: 40,
    recentOrders: [
      { id: '00001', name: 'Mayowa Opeyemi', amount: 430000, date: '04 May 2024', status: 'Completed' },
      { id: '00002', name: 'RST ALaba', amount: 570000, date: '04 May 2024', status: 'Pending' },
      { id: '00003', name: 'Segun Ogungbe', amount: 270000, date: '04 May 2024', status: 'Cancelled' },
      { id: '00004', name: 'Yinka Ayefele', amount: 980000, date: '04 May 2024', status: 'Completed' },
      { id: '00005', name: 'Odunlade Adekola', amount: 1900000, date: '03 May 2024', status: 'Cancelled' },
      { id: '00006', name: 'Alfred Murray', amount: 2570000, date: '03 May 2024', status: 'Completed' },
      { id: '00007', name: 'Femi Adebayo', amount: 5570000, date: '02 May 2024', status: 'Completed' }
    ]
  });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-600';
      case 'Pending':
        return 'bg-purple-100 text-purple-600';
      case 'Cancelled':
        return 'bg-red-100 text-red-500';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (value) => {
    return `₦${value.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome Leksy!</h1>
      </div>
      
      {/* Statistics cards */}
      <DashboardStats dashboardData={dashboardData} />
      
      {/* Recent Orders */}
      <RecentOrders />     
      
    </div>
  );
};

export default DashboardPage;