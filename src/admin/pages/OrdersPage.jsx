import React, { useState } from 'react';

const AllOrders = () => {
  // Sample data based on the screenshot
  const initialOrders = [
    { id: '00001', name: 'Mayowa Opeyemi', amount: '₦430,000', date: '04 May 2024', status: 'Completed' },
    { id: '00002', name: 'RST ALaba', amount: '₦570,000', date: '04 May 2024', status: 'Pending' },
    { id: '00003', name: 'Segun Ogungbe', amount: '₦270,000', date: '04 May 2024', status: 'Cancelled' },
    { id: '00004', name: 'Yinka Ayefele', amount: '₦980,000', date: '04 May 2024', status: 'Completed' },
    { id: '00005', name: 'Odunlade Adekola', amount: '₦1,900,000', date: '03 May 2024', status: 'Cancelled' },
    { id: '00006', name: 'Alfred Murray', amount: '₦2,570,000', date: '03 May 2024', status: 'Completed' },
    { id: '00007', name: 'Femi Adebayo', amount: '₦5,570,000', date: '02 May 2024', status: 'Completed' },
    { id: '00008', name: 'Femi Adebayo', amount: '₦5,570,000', date: '02 May 2024', status: 'Completed' },
    { id: '00009', name: 'Femi Adebayo', amount: '₦1,900,000', date: '02 May 2024', status: 'Completed' },
  ];

  const [orders, setOrders] = useState(initialOrders);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const ordersPerPage = 9;

  // Get status badge styling
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-500';
      case 'Pending':
        return 'bg-purple-100 text-purple-500';
      case 'Cancelled':
        return 'bg-red-100 text-red-500';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  // Reset filters
  const resetFilter = () => {
    setFilterStatus('');
    setOrderBy('');
    setOrders(initialOrders);
  };

  // Apply filters
  const applyFilter = (status) => {
    setFilterStatus(status);
    if (status) {
      const filteredOrders = initialOrders.filter(order => order.status === status);
      setOrders(filteredOrders);
    } else {
      setOrders(initialOrders);
    }
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h1 className="text-2xl font-semibold mb-6">All Orders</h1>
      
      {/* Filters */}
      <div className="flex mb-6">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button className="p-3 bg-gray-50 border-r border-gray-200">
            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4H21V6H3V4ZM5 11H19V13H5V11ZM7 18H17V20H7V18Z" fill="currentColor" />
            </svg>
          </button>
          <div className="px-4 py-2 bg-gray-50">
            <span className="text-sm font-medium">Filter By</span>
          </div>
        </div>
        
        <div className="ml-2 flex-1">
          <div className="flex">
            <div className="relative flex-1 mr-2">
              <select 
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 w-full text-sm pr-10"
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
              >
                <option value="">Date</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            <div className="relative flex-1 mr-2">
              <select 
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 w-full text-sm pr-10"
                value={filterStatus}
                onChange={(e) => applyFilter(e.target.value)}
              >
                <option value="">Order Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            <div className="relative flex-1">
              <select 
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 w-full text-sm pr-10"
              >
                <option>Order Amount</option>
                <option>Highest to Lowest</option>
                <option>Lowest to Highest</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          className="ml-2 px-4 py-2 rounded-lg text-pink-500 hover:bg-pink-50 flex items-center"
          onClick={resetFilter}
        >
          <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Filter
        </button>
      </div>
      
      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 text-sm font-medium text-gray-500">ID</th>
              <th className="pb-3 text-sm font-medium text-gray-500">NAME</th>
              <th className="pb-3 text-sm font-medium text-gray-500">TOTAL AMOUNT</th>
              <th className="pb-3 text-sm font-medium text-gray-500">DATE</th>
              <th className="pb-3 text-sm font-medium text-gray-500">STATUS</th>
              <th className="pb-3 text-sm font-medium text-gray-500">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4 text-sm">{order.id}</td>
                <td className="py-4 text-sm">{order.name}</td>
                <td className="py-4 text-sm font-medium">{order.amount}</td>
                <td className="py-4 text-sm">{order.date}</td>
                <td className="py-4">
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadgeStyle(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4">
                  <button className="text-pink-500 border border-pink-500 rounded-lg px-4 py-2 text-sm hover:bg-pink-50">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, orders.length)} of {orders.length}
        </div>
        <div className="flex">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 mr-1 flex justify-center items-center rounded border border-gray-200 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 flex justify-center items-center rounded border border-gray-200 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllOrders;