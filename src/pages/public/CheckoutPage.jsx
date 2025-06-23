import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import { 
  formatPrice, 
  validateCheckoutForm, 
  initiateCheckout, 
  storeOrderDetails, 
  nigerianStates, 
  calculateShipping, 
  getSuccessRedirectUrl 
} from '../../api/CheckoutService';

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('address');
  
  // Form state matches API requirements
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    street_address: '',
    notes: '',
    agreeToTerms: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const shipping = calculateShipping(deliveryMethod);
  const finalTotal = totalPrice + shipping;
  const SUCCESS_REDIRECT_URL = getSuccessRedirectUrl();

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);
    if (method === 'pickup') {
      const newErrors = { ...formErrors };
      delete newErrors.state;
      delete newErrors.city;
      delete newErrors.street_address;
      setFormErrors(newErrors);
    }
  };

  const validateForm = () => {
    const errors = validateCheckoutForm(formData, deliveryMethod);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields correctly'
      });
      return;
    }

    try {
      setIsProcessingOrder(true);
      
      const result = await initiateCheckout(formData, deliveryMethod, cart, SUCCESS_REDIRECT_URL);
      
      if (result.code === 200 && result.authorization_url) {
        // Store order details in memory for the success page
        storeOrderDetails(formData, deliveryMethod, cart, totalPrice, shipping, finalTotal);

        setNotification({
          type: 'success',
          message: 'Redirecting to payment gateway...'
        });

        // Clear cart before redirecting to payment
        clearCart();

        // Small delay to show the success message
        setTimeout(() => {
          window.location.href = result.authorization_url;
        }, 1000);
        
      } else {
        throw new Error(result.message || 'Failed to initiate checkout');
      }

    } catch (error) {
      console.error('Checkout initiation error:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to initiate checkout. Please try again.'
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="container mx-auto px-4 py-8">
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      <Breadcrumb 
        items={[
          { label: 'Home', path: '/' },
          { label: 'Cart', path: '/cart' },
          { label: 'Checkout', path: '/checkout' }
        ]} 
      />
      
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Billing Information Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Delivery Method Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Delivery Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    deliveryMethod === 'address' 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleDeliveryMethodChange('address')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="address"
                      checked={deliveryMethod === 'address'}
                      onChange={() => handleDeliveryMethodChange('address')}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Home Delivery
                      </div>
                      <div className="text-sm text-gray-500">
                        Delivery to your address ({formatPrice(5000)})
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    deliveryMethod === 'pickup' 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleDeliveryMethodChange('pickup')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="pickup"
                      checked={deliveryMethod === 'pickup'}
                      onChange={() => handleDeliveryMethodChange('pickup')}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Store Pickup
                      </div>
                      <div className="text-sm text-gray-500">
                        Pick up from our store (Free)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your full name"
                    disabled={isProcessingOrder}
                    required
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                    disabled={isProcessingOrder}
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+234 8012345678"
                    disabled={isProcessingOrder}
                    required
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address - Only show if delivery method is address */}
            {deliveryMethod === 'address' && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Delivery Address</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                        formErrors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isProcessingOrder}
                      required
                    >
                      <option value="">Select State</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {formErrors.state && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.state}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                        formErrors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Your city"
                      disabled={isProcessingOrder}
                      required
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="street_address"
                    name="street_address"
                    value={formData.street_address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                      formErrors.street_address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your full address"
                    disabled={isProcessingOrder}
                    required
                  />
                  {formErrors.street_address && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.street_address}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Additional Info</h2>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Notes about your order, e.g. special delivery instructions"
                  disabled={isProcessingOrder}
                ></textarea>
              </div>
            </div>
          </form>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={`${item.id}-${item.variant?.id || 'default'}`} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm font-medium text-gray-800">
                      {item.name} {item.quantity > 1 && `x${item.quantity}`}
                    </div>
                    {item.variant && (
                      <div className="text-xs text-gray-500">
                        {item.variant.name}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {deliveryMethod === 'pickup' ? 'Pickup:' : 'Shipping:'}
                </span>
                <span className="font-medium">
                  {deliveryMethod === 'pickup' ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-pink-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{' '}
                <Link to="/privacy-policy" className="text-pink-500 hover:text-pink-600">
                  privacy policy
                </Link>.
              </p>
              
              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className={`mt-1 mr-2 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded ${
                    formErrors.agreeToTerms ? 'border-red-500' : ''
                  }`}
                  disabled={isProcessingOrder}
                  required
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                  I have read and agree to the website{' '}
                  <Link to="/terms" className="text-pink-500 hover:text-pink-600">
                    terms and conditions
                  </Link>{' '}
                  <span className="text-red-500">*</span>
                </label>
              </div>
              {formErrors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-500 mb-4">{formErrors.agreeToTerms}</p>
              )}
              
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isProcessingOrder}
                className={`w-full py-3 rounded-md font-medium transition-colors ${
                  isProcessingOrder
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-pink-500 hover:bg-pink-600 text-white'
                }`}
              >
                {isProcessingOrder ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Initiating Payment...
                  </div>
                ) : (
                  `Proceed to Payment - ${formatPrice(finalTotal)}`
                )}
              </Button>
            </div>
            
            <Link 
              to="/cart" 
              className="flex items-center justify-center text-pink-500 hover:text-pink-600"
            >
              <span className="mr-1">«</span> Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;