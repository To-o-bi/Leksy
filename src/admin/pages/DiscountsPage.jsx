import React, { useState } from 'react';
import ProductDiscounts from './ProductDiscounts';
import DeliveryDiscount from './DeliveryDiscount';

const DiscountsPage = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discount Management</h1>
            <p className="text-sm text-gray-600 mt-1">Create and manage discount campaigns for your store</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200 mt-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'products'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🏷️ Product Discounts
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'delivery'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🚚 Delivery Discount
          </button>
        </div>
      </div>

      {/* Product Discounts Tab */}
      {activeTab === 'products' && <ProductDiscounts />}

      {/* Delivery Discount Tab */}
      {activeTab === 'delivery' && <DeliveryDiscount />}
    </div>
  );
};

export default DiscountsPage;