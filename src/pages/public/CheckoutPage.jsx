import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import paystackService from '../../api/services/paystackService';

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLoadingPaystack, setIsLoadingPaystack] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    email: '',
    country: '',
    state: '',
    phone: '',
    notes: '',
    agreeToTerms: false
  });
  const [formErrors, setFormErrors] = useState({});
  const shipping = 5000; // Fixed shipping cost in Naira
  const finalTotal = totalPrice + shipping;

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Load Paystack script on component mount
  useEffect(() => {
    const loadPaystack = async () => {
      try {
        await paystackService.loadPaystackScript();
        setIsLoadingPaystack(false);
      } catch (error) {
        console.error('Failed to load Paystack:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load payment system. Please refresh the page and try again.'
        });
        setIsLoadingPaystack(false);
      }
    };

    loadPaystack();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.country) errors.country = 'Country is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms and conditions';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handlePaymentSuccess = async (response) => {
    console.log('Payment successful:', response);
    
    try {
      setIsProcessingPayment(true);
      
      // Verify payment with your backend
      const verificationResult = await paystackService.verifyPayment(response.reference);
      
      if (verificationResult.success) {
        // Create order with payment details
        const orderData = {
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            country: formData.country,
            state: formData.state
          },
          items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            variant: item.variant || null,
            image: item.image
          })),
          payment: {
            reference: response.reference,
            amount: finalTotal,
            currency: 'NGN',
            status: 'paid',
            paymentMethod: 'paystack',
            paidAt: new Date().toISOString()
          },
          shipping: {
            cost: shipping,
            address: formData.address,
            country: formData.country,
            state: formData.state
          },
          subtotal: totalPrice,
          total: finalTotal,
          notes: formData.notes,
          status: 'pending'
        };

        // Save order to your backend
        const orderResult = await paystackService.createOrder(orderData);
        
        // Clear cart and show success
        clearCart();
        
        setNotification({
          type: 'success',
          message: `Payment successful! Order #${orderResult.orderId} has been placed. Redirecting...`
        });

        // Redirect to confirmation page with order details
        setTimeout(() => {
          navigate('/checkout/confirmation', {
            state: {
              orderData: orderResult,
              paymentReference: response.reference
            }
          });
        }, 2000);

      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Post-payment processing error:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Payment was successful but order processing failed. Please contact support.'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setNotification({
      type: 'error',
      message: error.message || 'Payment failed. Please try again.'
    });
    setIsProcessingPayment(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields correctly'
      });
      
      // Auto-dismiss error notification
      setTimeout(() => {
        setNotification(null);
      }, 5000);
      return;
    }

    if (isLoadingPaystack) {
      setNotification({
        type: 'error',
        message: 'Payment system is still loading. Please wait a moment and try again.'
      });
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      // Generate unique payment reference
      const paymentReference = paystackService.generateReference();
      
      // Prepare payment data
      const paymentData = {
        email: formData.email,
        amount: finalTotal,
        reference: paymentReference,
        currency: 'NGN',
        metadata: {
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_phone: formData.phone,
          order_items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          shipping_address: formData.address,
          shipping_cost: shipping
        },
        onSuccess: handlePaymentSuccess,
        onClose: () => {
          console.log('Payment modal closed');
          setIsProcessingPayment(false);
        }
      };

      // Initialize Paystack payment
      await paystackService.initializePayment(paymentData);
      
    } catch (error) {
      handlePaymentError(error);
    }
  };

  // Auto-dismiss notifications after 5 seconds
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
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Billing Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your first name"
                    disabled={isProcessingPayment}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your last name"
                    disabled={isProcessingPayment}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                    formErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Your full address"
                  disabled={isProcessingPayment}
                />
                {formErrors.address && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country / Region <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 appearance-none ${
                        formErrors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isProcessingPayment}
                    >
                      <option value="">Select Country</option>
                      <option value="nigeria">Nigeria</option>
                      <option value="ghana">Ghana</option>
                      <option value="kenya">Kenya</option>
                      <option value="southAfrica">South Africa</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {formErrors.country && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.country}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 appearance-none ${
                        formErrors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isProcessingPayment}
                    >
                      <option value="">Select State</option>
                      <option value="lagos">Lagos</option>
                      <option value="abuja">Abuja</option>
                      <option value="rivers">Rivers</option>
                      <option value="kano">Kano</option>
                      <option value="ogun">Ogun</option>
                      <option value="kaduna">Kaduna</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {formErrors.state && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.state}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    disabled={isProcessingPayment}
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
                    disabled={isProcessingPayment}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>
            
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
                  disabled={isProcessingPayment}
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
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">{formatPrice(shipping)}</span>
              </div>
              
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-pink-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Secure Payment with Paystack</h3>
              <div className="flex gap-2 mb-4">
                <img src="/assets/images/icons/visa.svg" alt="Visa" className="h-8" />
                <img src="/assets/images/icons/verve.svg" alt="Verve" className="h-8" />
                <img src="/assets/images/icons/mastercard.svg" alt="Mastercard" className="h-8" />
                <div className="flex items-center bg-green-100 px-2 py-1 rounded">
                  <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-green-700 font-medium">SSL Secured</span>
                </div>
              </div>
              
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
                  disabled={isProcessingPayment}
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
                disabled={isProcessingPayment || isLoadingPaystack}
                className={`w-full py-3 rounded-md font-medium transition-colors ${
                  isProcessingPayment || isLoadingPaystack
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-pink-500 hover:bg-pink-600 text-white'
                }`}
              >
                {isLoadingPaystack ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Payment System...
                  </div>
                ) : isProcessingPayment ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay ${formatPrice(finalTotal)} - Place Order`
                )}
              </Button>
              
              {isLoadingPaystack && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Loading secure payment system...
                </p>
              )}
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