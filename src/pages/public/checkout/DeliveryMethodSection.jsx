import React from 'react';
import { formatPrice } from '../../../api/CheckoutService';

const DeliveryMethodSection = ({ 
  deliveryMethod, 
  onDeliveryMethodChange, 
  busParkFeeDisplay,
  isProcessingOrder 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
            <span className="text-pink-600 font-semibold text-sm">1</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Delivery Method</h2>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Home Delivery */}
          <div 
            onClick={() => !isProcessingOrder && onDeliveryMethodChange('address')} 
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              deliveryMethod === 'address' 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200 hover:border-gray-300'
            } ${isProcessingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center mb-3">
              <input 
                type="radio" 
                name="deliveryMethod" 
                value="address" 
                checked={deliveryMethod === 'address'} 
                readOnly 
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300" 
              />
              <span className="ml-3 text-sm font-medium text-gray-900">Home Delivery</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Send to your address</p>
            <p className="text-sm font-semibold text-pink-600">To be calculated</p>
          </div>

          {/* Bus Park */}
          <div 
            onClick={() => !isProcessingOrder && onDeliveryMethodChange('bus-park')} 
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              deliveryMethod === 'bus-park' 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200 hover:border-gray-300'
            } ${isProcessingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center mb-3">
              <input 
                type="radio" 
                name="deliveryMethod" 
                value="bus-park" 
                checked={deliveryMethod === 'bus-park'} 
                readOnly 
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300" 
              />
              <span className="ml-3 text-sm font-medium text-gray-900">Bus Park</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Send using local bus park</p>
            <p className="text-sm font-semibold text-pink-600">
              {busParkFeeDisplay ? formatPrice(busParkFeeDisplay.delivery_fee) : 'Loading...'}
            </p>
          </div>

          {/* Store Pickup */}
          <div 
            onClick={() => !isProcessingOrder && onDeliveryMethodChange('pickup')} 
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              deliveryMethod === 'pickup' 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200 hover:border-gray-300'
            } ${isProcessingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center mb-3">
              <input 
                type="radio" 
                name="deliveryMethod" 
                value="pickup" 
                checked={deliveryMethod === 'pickup'} 
                readOnly 
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300" 
              />
              <span className="ml-3 text-sm font-medium text-gray-900">Store Pickup</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Pickup from store</p>
            <p className="text-sm font-semibold text-green-600">Free</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMethodSection;