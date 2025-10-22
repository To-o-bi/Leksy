import React from 'react';
import { nigerianStates } from '../../../api/CheckoutService';

const CustomerInformationSection = ({ 
  formData, 
  formErrors, 
  onInputChange, 
  deliveryMethod,
  availableLGAs,
  isLoadingLGAs,
  isProcessingOrder 
}) => {
  return (
    <>
      {/* Customer Information Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-pink-600 font-semibold text-sm">2</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={onInputChange} 
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  formErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                disabled={isProcessingOrder} 
              />
              {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={onInputChange} 
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
                disabled={isProcessingOrder} 
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={onInputChange} 
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  formErrors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="08012345678"
                disabled={isProcessingOrder} 
              />
              {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="additional_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Alternative Phone Number (Optional)
              </label>
              <input 
                type="tel" 
                id="additional_phone" 
                name="additional_phone" 
                value={formData.additional_phone} 
                onChange={onInputChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter another phone number"
                disabled={isProcessingOrder} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Location Section */}
      {(deliveryMethod === 'address' || deliveryMethod === 'bus-park') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-pink-600 font-semibold text-sm">3</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Delivery Location</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select 
                  id="state" 
                  name="state" 
                  value={formData.state} 
                  onChange={onInputChange} 
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    formErrors.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isProcessingOrder}
                >
                  <option value="">Select State</option>
                  {nigerianStates.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City / LGA <span className="text-red-500">*</span>
                </label>
                {(deliveryMethod === 'address' && formData.state === 'Lagos') ? (
                  <select 
                    id="city" 
                    name="city" 
                    value={formData.city} 
                    onChange={onInputChange} 
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      formErrors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isLoadingLGAs || isProcessingOrder}
                  >
                    <option value="">{isLoadingLGAs ? 'Loading...' : 'Select LGA'}</option>
                    {availableLGAs.map(lga => (
                      <option key={lga.lga} value={lga.lga}>{lga.lga}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    id="city" 
                    name="city" 
                    value={formData.city} 
                    onChange={onInputChange} 
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      formErrors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter city/LGA"
                    disabled={isProcessingOrder} 
                  />
                )}
                {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
              </div>

              {deliveryMethod === 'address' && (
                <div className="md:col-span-2">
                  <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="street_address" 
                    name="street_address" 
                    value={formData.street_address} 
                    onChange={onInputChange} 
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      formErrors.street_address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your street address"
                    disabled={isProcessingOrder} 
                  />
                  {formErrors.street_address && <p className="text-red-500 text-sm mt-1">{formErrors.street_address}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional Information Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-pink-600 font-semibold text-sm">
                {(deliveryMethod === 'address' || deliveryMethod === 'bus-park') ? '4' : '3'}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Order Notes (Optional)
            </label>
            <textarea 
              id="notes" 
              name="notes" 
              value={formData.notes} 
              onChange={onInputChange} 
              rows="4" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none" 
              placeholder="Any special instructions or notes about your order..."
              disabled={isProcessingOrder}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerInformationSection;