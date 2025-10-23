import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const SalesSummary = ({ dateRange = 'week' }) => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [comparisonType, setComparisonType] = useState('revenue');
  
  // Simulate fetching chart data based on date range
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // In a real application, this would be an API call
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock data based on selected date range
        let mockData = [];
        
        if (dateRange === 'week') {
          mockData = [
            { name: 'Mon', revenue: 1200, orders: 12, visitors: 324 },
            { name: 'Tue', revenue: 1900, orders: 18, visitors: 290 },
            { name: 'Wed', revenue: 1500, orders: 15, visitors: 410 },
            { name: 'Thu', revenue: 2400, orders: 24, visitors: 380 },
            { name: 'Fri', revenue: 2800, orders: 28, visitors: 590 },
            { name: 'Sat', revenue: 3100, orders: 30, visitors: 470 },
            { name: 'Sun', revenue: 1800, orders: 20, visitors: 280 }
          ];
        } else if (dateRange === 'month') {
          // Generate daily data for a month
          const days = 30;
          mockData = Array.from({ length: days }, (_, i) => {
            const day = i + 1;
            return {
              name: `${day}`,
              revenue: Math.floor(Math.random() * 3000) + 800,
              orders: Math.floor(Math.random() * 30) + 5,
              visitors: Math.floor(Math.random() * 500) + 200
            };
          });
        } else if (dateRange === 'year') {
          // Monthly data for a year
          mockData = [
            { name: 'Jan', revenue: 18500, orders: 185, visitors: 4320 },
            { name: 'Feb', revenue: 16200, orders: 162, visitors: 3890 },
            { name: 'Mar', revenue: 21300, orders: 213, visitors: 5410 },
            { name: 'Apr', revenue: 24600, orders: 246, visitors: 6380 },
            { name: 'May', revenue: 28000, orders: 280, visitors: 7100 },
            { name: 'Jun', revenue: 31000, orders: 310, visitors: 7470 },
            { name: 'Jul', revenue: 29500, orders: 295, visitors: 7280 },
            { name: 'Aug', revenue: 27800, orders: 278, visitors: 6980 },
            { name: 'Sep', revenue: 25400, orders: 254, visitors: 6540 },
            { name: 'Oct', revenue: 29800, orders: 298, visitors: 7320 },
            { name: 'Nov', revenue: 33500, orders: 335, visitors: 8410 },
            { name: 'Dec', revenue: 38200, orders: 382, visitors: 9320 }
          ];
        }
        
        setChartData(mockData);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    
    setIsLoading(true);
    fetchChartData();
  }, [dateRange]);
  
  // Format data for the current comparison type
  const formatYAxisTick = (value) => {
    if (comparisonType === 'revenue') {
      return `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`;
    }
    return value;
  };
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  
  // Get chart color based on comparison type
  const getChartColor = () => {
    switch (comparisonType) {
      case 'revenue':
        return '#ec4899'; // pink-500
      case 'orders':
        return '#3b82f6'; // blue-500
      case 'visitors':
        return '#10b981'; // emerald-500
      default:
        return '#ec4899';
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Sales Summary</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
          <select
            value={comparisonType}
            onChange={(e) => setComparisonType(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 p-2"
          >
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
            <option value="visitors">Visitors</option>
          </select>
          
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 p-2"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tickFormatter={formatYAxisTick}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                formatter={(value) => {
                  if (comparisonType === 'revenue') {
                    return [`$${value.toLocaleString()}`, 'Revenue'];
                  }
                  return [value, comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)];
                }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line 
                type="monotone" 
                dataKey={comparisonType} 
                stroke={getChartColor()}
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                name={comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tickFormatter={formatYAxisTick}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                formatter={(value) => {
                  if (comparisonType === 'revenue') {
                    return [`$${value.toLocaleString()}`, 'Revenue'];
                  }
                  return [value, comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)];
                }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar 
                dataKey={comparisonType} 
                fill={getChartColor()}
                radius={[4, 4, 0, 0]}
                name={comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-semibold text-gray-800">
                ${chartData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-xl font-semibold text-gray-800">
                {chartData.reduce((sum, item) => sum + item.orders, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Visitors</p>
              <p className="text-xl font-semibold text-gray-800">
                {chartData.reduce((sum, item) => sum + item.visitors, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSummary;