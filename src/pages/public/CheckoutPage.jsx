import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import {
  formatPrice,
  validateCheckoutForm,
  initiateCheckout,
  nigerianStates,
  fetchLGADeliveryFees,
  fetchBusParkDeliveryFee,
  getSuccessRedirectUrl,
  fetchDeliveryFeeForState
} from '../../api/CheckoutService'; // Adjust path if needed

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart, validateCart } = useCart();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('address');
  const [shipping, setShipping] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [availableLGAs, setAvailableLGAs] = useState([]);
  const [isLoadingLGAs, setIsLoadingLGAs] = useState(false);
  const [busParkFee, setBusParkFee] = useState(null);
  const [isFetchingBusParkFee, setIsFetchingBusParkFee] = useState(true);

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
  const finalTotal = totalPrice + shipping;
  const SUCCESS_REDIRECT_URL = getSuccessRedirectUrl();

  useEffect(() => {
    const performInitialValidation = async () => {
      if (cart.length > 0) {
        const result = await validateCart();
        if (result.wasModified) {
          setNotification({ type: 'info', message: 'Your cart was updated due to stock changes. Please review before proceeding.' });
        }
      }
    };
    performInitialValidation();
  }, []);

  useEffect(() => {
    if (cart.length === 0 && !isProcessingOrder) {
      navigate('/cart');
    }
  }, [cart, navigate, isProcessingOrder]);

  useEffect(() => {
    const getBusParkFee = async () => {
      setIsFetchingBusParkFee(true);
      try {
        const fee = await fetchBusParkDeliveryFee();
        setBusParkFee(fee);
      } catch (error) {
        console.error("Failed to fetch bus park fee:", error);
        setBusParkFee(null); // Set to null on error
      } finally {
        setIsFetchingBusParkFee(false);
      }
    };
    getBusParkFee();
  }, []);

  const calculateShipping = useCallback(async () => {
    setIsCalculatingShipping(true);
    let cost = 0;
    if (deliveryMethod === 'bus-park') {
      cost = busParkFee || 0;
    } else if (deliveryMethod === 'address' && formData.state) {
      if (formData.state === 'Lagos' && formData.city) {
        const selectedLGA = availableLGAs.find(lga => lga.lga === formData.city);
        cost = selectedLGA ? selectedLGA.delivery_fee : 0;
      } else if (formData.state !== 'Lagos') {
        cost = await fetchDeliveryFeeForState(formData.state);
      }
    }
    setShipping(cost);
    setIsCalculatingShipping(false);
  }, [deliveryMethod, formData.state, formData.city, availableLGAs, busParkFee]);

  useEffect(() => {
    calculateShipping();
  }, [calculateShipping]);

  useEffect(() => {
    const loadLGAs = async () => {
      if (formData.state === 'Lagos' && deliveryMethod === 'address') {
        setIsLoadingLGAs(true);
        try {
          const lgas = await fetchLGADeliveryFees(formData.state);
          setAvailableLGAs(lgas);
        } catch (error) {
          setAvailableLGAs([]);
        } finally {
          setIsLoadingLGAs(false);
        }
      } else {
        setAvailableLGAs([]);
      }
    };
    loadLGAs();
  }, [formData.state, deliveryMethod]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);
    setIsProcessingOrder(true);

    const validationResult = await validateCart();
    if (validationResult.wasModified) {
      setNotification({ type: 'error', message: 'Your cart changed due to stock updates. Please review your cart again.' });
      setIsProcessingOrder(false);
      setTimeout(() => navigate('/cart'), 4000);
      return;
    }

    const errors = validateCheckoutForm(formData, deliveryMethod);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setNotification({ type: 'error', message: 'Please fill in all required fields correctly.' });
      setIsProcessingOrder(false);
      return;
    }

    try {
      const cartForAPI = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      const result = await initiateCheckout(formData, deliveryMethod, cartForAPI, SUCCESS_REDIRECT_URL);

      if (result.code === 200 && result.authorization_url) {
        const detailsForSuccessPage = {
          cart_obj: cart.map(item => ({
            product_name: item.name,
            ordered_quantity: item.quantity,
            product_price: item.price,
            image: item.images?.[0] || '/placeholder.jpg'
          })),
          customerInfo: formData,
          amount_paid: finalTotal,
        };

        sessionStorage.setItem('pendingOrderDetails', JSON.stringify(detailsForSuccessPage));
        
        setNotification({ type: 'success', message: 'Redirecting to payment...' });
        setTimeout(() => {
          clearCart();
          window.location.href = result.authorization_url;
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to initiate checkout.');
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'An unexpected error occurred.' });
      setIsProcessingOrder(false);
    }
  };

  const getDeliveryPrice = () => {
    if (isCalculatingShipping) return 'Calculating...';
    if (deliveryMethod === 'pickup') return 'Free';
    if (deliveryMethod === 'address' && !formData.state) return 'Select a state';
    return formatPrice(shipping);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {notification && (
          <div className="mb-6">
            <Notification 
              type={notification.type} 
              message={notification.message} 
              onClose={() => setNotification(null)} 
            />
          </div>
        )}
        
        <div className="mb-8">
          <Breadcrumb 
            items={[
              { label: 'Home', path: '/' }, 
              { label: 'Cart', path: '/cart' }, 
              { label: 'Checkout' }
            ]} 
          />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order information below</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Method Section */}
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
                    onClick={() => setDeliveryMethod('address')} 
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      deliveryMethod === 'address' 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
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
                    onClick={() => setDeliveryMethod('bus-park')} 
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      deliveryMethod === 'bus-park' 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
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
                      {isFetchingBusParkFee ? 'Loading...' : (busParkFee !== null ? formatPrice(busParkFee) : 'Unavailable')}
                    </p>
                  </div>

                  {/* Store Pickup */}
                  <div 
                    onClick={() => setDeliveryMethod('pickup')} 
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      deliveryMethod === 'pickup' 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
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
                      onChange={handleInputChange} 
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
                      onChange={handleInputChange} 
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
                      onChange={handleInputChange} 
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                        formErrors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="08012345678"
                      disabled={isProcessingOrder} 
                    />
                    {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
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
                        onChange={handleInputChange} 
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
                          onChange={handleInputChange} 
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
                          onChange={handleInputChange} 
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
                          onChange={handleInputChange} 
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
                    onChange={handleInputChange} 
                    rows="4" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none" 
                    placeholder="Any special instructions or notes about your order..."
                    disabled={isProcessingOrder}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
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
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-gray-900">{getDeliveryPrice()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-base font-semibold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-pink-600">
                          {isCalculatingShipping ? 'Calculating...' : formatPrice(finalTotal)}
                        </span>
                      </div>
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
                      onChange={handleInputChange} 
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
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;