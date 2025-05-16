import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  Filter, 
  ChevronDown, 
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

// Sample data for demonstration
const sampleOrdersData = [
  { id: '#ORD-12345', name: 'John Smith', amount: 249.99, date: '03 May 2025', status: 'Completed' },
  { id: '#ORD-12346', name: 'Sarah Johnson', amount: 129.50, date: '02 May 2025', status: 'Processing' },
  { id: '#ORD-12347', name: 'Michael Brown', amount: 79.99, date: '01 May 2025', status: 'Pending' },
  { id: '#ORD-12348', name: 'Emily Davis', amount: 349.95, date: '30 Apr 2025', status: 'Completed' },
  { id: '#ORD-12349', name: 'Robert Wilson', amount: 99.00, date: '29 Apr 2025', status: 'Cancelled' },
  { id: '#ORD-12350', name: 'Lisa Taylor', amount: 199.99, date: '28 Apr 2025', status: 'Processing' },
  { id: '#ORD-12351', name: 'James Miller', amount: 159.95, date: '27 Apr 2025', status: 'Completed' },
  { id: '#ORD-12352', name: 'Patricia Moore', amount: 89.99, date: '26 Apr 2025', status: 'Pending' },
];

export default function RecentOrders() {
  // State management
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    date: 'All',
    amount: 'All',
    status: 'All'
  });
  
  const ordersPerPage = 5;
  const statusOptions = ['All', 'Completed', 'Processing', 'Pending', 'Cancelled'];
  const dateOptions = ['All', 'Today', 'This Week', 'This Month', 'Last Month'];
  const amountOptions = ['All', 'Under $100', '$100-$200', 'Over $200'];
  
  // Simulate data fetching
  useEffect(() => {
    const fetchOrders = () => {
      setTimeout(() => {
        setOrders(sampleOrdersData);
        setFilteredOrders(sampleOrdersData);
        setIsLoading(false);
      }, 800);
    };
    
    fetchOrders();
  }, []);
  
  // Filter orders based on all filters
  useEffect(() => {
    let result = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date filter
    if (filters.date !== 'All') {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      result = result.filter(order => {
        const orderDate = new Date(order.date);
        
        switch(filters.date) {
          case 'Today':
            return orderDate.toDateString() === today.toDateString();
          case 'This Week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return orderDate >= weekStart;
          case 'This Month':
            return orderDate.getMonth() === today.getMonth() && 
                   orderDate.getFullYear() === today.getFullYear();
          case 'Last Month':
            return orderDate.getMonth() === lastMonth.getMonth() && 
                   orderDate.getFullYear() === lastMonth.getFullYear();
          default:
            return true;
        }
      });
    }
    
    // Apply amount filter
    if (filters.amount !== 'All') {
      result = result.filter(order => {
        switch(filters.amount) {
          case 'Under $100':
            return order.amount < 100;
          case 'Over $200':
            return order.amount > 200;
          case '$100-$200':
            return order.amount >= 100 && order.amount <= 200;
          default:
            return true;
        }
      });
    }
    
    // Apply status filter
    if (filters.status !== 'All') {
      result = result.filter(order => order.status === filters.status);
    }
    
    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, searchTerm, filters]);
  
  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  // Filter functions
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      date: 'All',
      amount: 'All',
      status: 'All'
    });
    setSearchTerm('');
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get status styling based on status value
  const getStatusClass = (status) => {
    switch(status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Processing':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  // Filter dropdown component
  const FilterDropdown = ({ title, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="relative">
        <div 
          className={`flex items-center border ${value !== 'All' ? 'border-pink-500 bg-pink-50' : 'border-gray-300'} rounded-md p-2 cursor-pointer`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm text-gray-600 mr-2">{title}</span>
          <ChevronDown size={16} className="text-gray-500" />
        </div>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 w-40">
            {options.map((option) => (
              <div 
                key={option} 
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${value === option ? 'bg-pink-50 text-pink-600' : ''}`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-white p-3 sm:p-5 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">Recent Orders</h2>
        <button className="text-sm flex items-center text-blue-600 hover:text-blue-700">
          View all <ArrowUpRight size={14} className="ml-1" />
        </button>
      </div>
      
      {/* Search and filter section */}
      <div className="mb-6">
        {/* Search input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search orders by ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        
        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-md p-2">
            <Filter size={16} className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">Filter By</span>
          </div>
          
          <FilterDropdown 
            title="Date" 
            options={dateOptions} 
            value={filters.date} 
            onChange={(value) => handleFilterChange('date', value)} 
          />
          
          <FilterDropdown 
            title="Order Amount" 
            options={amountOptions} 
            value={filters.amount} 
            onChange={(value) => handleFilterChange('amount', value)} 
          />
          
          <FilterDropdown 
            title="Order Status" 
            options={statusOptions} 
            value={filters.status} 
            onChange={(value) => handleFilterChange('status', value)} 
          />
          
          <button 
            className={`flex items-center text-pink-500 text-sm ${Object.values(filters).every(f => f === 'All') && !searchTerm ? 'opacity-50 cursor-not-allowed' : 'hover:text-pink-600'}`}
            onClick={resetFilters}
            disabled={Object.values(filters).every(f => f === 'All') && !searchTerm}
          >
            <span>Reset Filter</span>
          </button>
        </div>
      </div>
      
      {/* Orders table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No orders found matching your filters.</p>
          <button 
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
            onClick={resetFilters}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL AMOUNT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{order.id}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{order.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{formatCurrency(order.amount)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{order.date}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 text-xs text-pink-500 border border-pink-500 rounded-md hover:bg-pink-50 transition-colors">
                            View Details
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm">
            <div className="mb-3 sm:mb-0 text-gray-500">
              Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === page ? 'bg-pink-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 rounded-md ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}