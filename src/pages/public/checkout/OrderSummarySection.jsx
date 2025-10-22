import React from 'react';
import { formatPrice } from '../../../api/CheckoutService';

// Note: Import Link from 'react-router-dom' and Button component in your actual file
const Link = ({ to, children, className }) => <a href={to} className={className}>{children}</a>;
const Button = ({ children, ...props }) => <button {...props}>{children}</button>;

const OrderSummarySection = ({ 
  cart,
  totalPrice,
  shipping,
  finalTotal,
  shippingDetails,
  hasDeliveryDiscount,
  deliveryMethod,
  isCalculatingShipping,
  formData,
  formErrors,
  onInputChange,
  isProcessingOrder,
  onSubmit
}) => {
  const getDeliveryPrice = () => {
    if (isCalculatingShipping) return 'Calculating...';
    if (deliveryMethod === 'pickup') return 'Free';
    if (deliveryMethod === 'address' && !formData.state) return 'Select a state';
    return formatPrice(shipping);
  };

  // Check if user is a first-time purchaser
  const isFirstTimePurchase = shippingDetails?.isFirstTimePurchase === true;

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
        </div>
        
        <div className="p-6">
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.product_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <img 
                    src={item.images?.[0] || '/placeholder.jpg'} 
                    alt={item.name} 
                    className="w-12 h-12 object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Price Breakdown */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              
              {/* Enhanced Delivery Fee with Discount Display */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm items-start">
                  <span className="text-gray-600">Shipping</span>
                  {hasDeliveryDiscount && !isCalculatingShipping && deliveryMethod !== 'pickup' ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(shippingDetails.original_delivery_fee)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-green-600">
                          {formatPrice(shipping)}
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-semibold">
                          -{shippingDetails.discount_percent}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="font-medium text-gray-900">{getDeliveryPrice()}</span>
                  )}
                </div>
                
                {/* First-Time Purchase Bonus Banner */}
                {isFirstTimePurchase && hasDeliveryDiscount && deliveryMethod !== 'pickup' && !isCalculatingShipping && (
                  <div className="bg-gradient-to-r from-pink-50 to-pink-50 border-2 border-pink-200 rounded-lg p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-pink-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-pink-900 mb-1">
                          🎉 First-Time Purchase Bonus!
                        </p>
                        <p className="text-xs text-pink-700">
                          Hurray! You got a special first-time buyer discount on delivery. Welcome to Leksy Cosmetics!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Regular Discount Savings Info (for non-first-time buyers) */}
                {!isFirstTimePurchase && hasDeliveryDiscount && deliveryMethod !== 'pickup' && !isCalculatingShipping && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-2 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-700 font-medium">
                        💰 Delivery Discount Savings:
                      </span>
                      <span className="text-green-700 font-bold">
                        {formatPrice(shippingDetails.original_delivery_fee - shippingDetails.delivery_fee)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-pink-600">
                    {isCalculatingShipping ? 'Calculating...' : formatPrice(finalTotal)}
                  </span>
                </div>
                
                {/* Total Savings Summary */}
                {hasDeliveryDiscount && deliveryMethod !== 'pickup' && !isCalculatingShipping && (
                  <div className={`mt-3 rounded-lg p-3 border ${
                    isFirstTimePurchase 
                      ? 'bg-gradient-to-r from-pink-50 to-pink-50 border-pink-200' 
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      <svg className={`w-4 h-4 flex-shrink-0 ${isFirstTimePurchase ? 'text-pink-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className={`text-xs font-semibold ${isFirstTimePurchase ? 'text-pink-800' : 'text-green-800'}`}>
                        {isFirstTimePurchase 
                          ? `You saved ${formatPrice(shippingDetails.original_delivery_fee - shippingDetails.delivery_fee)} with your first-time bonus!`
                          : `You saved ${formatPrice(shippingDetails.original_delivery_fee - shippingDetails.delivery_fee)} on delivery!`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Security */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-sm font-medium text-gray-700">Secure Payment</div>
            <div className="text-xs text-gray-500 mt-1">Powered by Paystack</div>
          </div>

          {/* Terms and Conditions */}
          <div className="mt-6 space-y-4">
            <div className="text-xs text-gray-500 leading-relaxed">
              Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{' '}
              <Link to="policies/privacy-policy" className="text-pink-600 hover:text-pink-700 underline">
                Privacy Policy
              </Link>.
            </div>
            
            <div className="flex items-start space-x-3">
              <input 
                type="checkbox" 
                id="agreeToTerms" 
                name="agreeToTerms" 
                checked={formData.agreeToTerms} 
                onChange={onInputChange} 
                className="h-4 w-4 mt-0.5 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" 
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-relaxed">
                I have read and agree to the website{' '}
                <Link to="/terms" className="text-pink-600 hover:text-pink-700 underline">
                  terms and conditions
                </Link>
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>
            {formErrors.agreeToTerms && (
              <p className="text-red-500 text-sm">{formErrors.agreeToTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            onClick={onSubmit}
            disabled={isProcessingOrder || isCalculatingShipping} 
            className="w-full py-3 mt-6 text-white bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md font-medium transition-colors duration-200"
          >
            {isProcessingOrder ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Order...
              </div>
            ) : (
              'Complete Order'
            )}
          </Button>

          {/* Back to Cart Link */}
          <div className="mt-4 text-center">
            <Link 
              to="/cart" 
              className="text-sm text-pink-600 hover:text-pink-700 underline transition-colors duration-200"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummarySection;