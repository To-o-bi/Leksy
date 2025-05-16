import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const InventoryStatus = () => {
  const [inventoryData, setInventoryData] = useState({
    lowStock: [],
    outOfStock: [],
    recentlyAdded: [],
    totalProducts: 0,
    stockValue: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate fetching inventory data
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        // In a real application, this would be an API call
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockData = {
          lowStock: [
            { id: 1, name: 'Rose Quartz Facial Roller', sku: 'SK-3422', quantity: 5, threshold: 10, price: 24.99 },
            { id: 2, name: 'Vitamin C Serum', sku: 'SK-1209', quantity: 7, threshold: 15, price: 39.99 },
            { id: 3, name: 'Hyaluronic Acid Moisturizer', sku: 'SK-0893', quantity: 3, threshold: 8, price: 29.99 },
          ],
          outOfStock: [
            { id: 4, name: 'Jade Gua Sha Tool', sku: 'SK-4501', quantity: 0, threshold: 10, price: 18.99 },
            { id: 5, name: 'Matcha Clay Mask', sku: 'SK-2209', quantity: 0, threshold: 12, price: 22.99 },
          ],
          recentlyAdded: [
            { id: 6, name: 'Peptide Eye Cream', sku: 'SK-6281', quantity: 25, date: '2025-04-25', price: 45.99 },
            { id: 7, name: 'SPF 50 Sunscreen', sku: 'SK-7732', quantity: 30, date: '2025-04-22', price: 27.99 },
            { id: 8, name: 'Retinol Night Serum', sku: 'SK-5106', quantity: 18, date: '2025-04-20', price: 54.99 },
          ],
          totalProducts: 128,
          stockValue: 12876.45
        };
        
        setInventoryData(mockData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        setIsLoading(false);
      }
    };
    
    fetchInventoryData();
  }, []);
  
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Inventory Status</h2>
        <Link to="/admin/products" className="text-sm bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md transition-colors duration-300">
          View All Inventory
        </Link>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-pink-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{inventoryData.totalProducts}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Low Stock Items</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{inventoryData.lowStock.length + inventoryData.outOfStock.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Total Stock Value</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">${inventoryData.stockValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
      </div>
      
      {/* Low stock alert section */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-3">Low Stock Alerts</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryData.lowStock.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Low Stock
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button className="text-pink-500 hover:text-pink-700 font-medium">
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
              {inventoryData.outOfStock.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button className="text-pink-500 hover:text-pink-700 font-medium">
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Recently added section */}
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3">Recently Added Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {inventoryData.recentlyAdded.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow duration-300">
              <h4 className="font-medium text-gray-800">{item.name}</h4>
              <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-600">Stock: {item.quantity}</p>
                <p className="text-sm font-medium text-pink-500">{formatPrice(item.price)}</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">Added on {formatDate(item.date)}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                <Link to={`/admin/products/${item.id}`} className="text-sm text-pink-500 hover:text-pink-700">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryStatus;