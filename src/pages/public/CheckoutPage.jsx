import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
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

  useEffect(() => {
    // Redirect to cart if cart is empty
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
    return `₦${parseFloat(price).toLocaleString()}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Process the order (in a real app, this would connect to a payment gateway)
      setNotification({
        type: 'success',
        message: 'Order placed successfully! Redirecting to confirmation page...'
      });
      
      // Simulate order processing
      setTimeout(() => {
        clearCart();
        navigate('/checkout/confirmation');
      }, 2000);
    } else {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

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
                    First name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your first name"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your last name"
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                    formErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Email"
                />
                {formErrors.address && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country / Region
                  </label>
                  <div className="relative">
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary appearance-none ${
                        formErrors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select</option>
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
                    State
                  </label>
                  <div className="relative">
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary appearance-none ${
                        formErrors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select</option>
                      <option value="lagos">Lagos</option>
                      <option value="abuja">Abuja</option>
                      <option value="rivers">Rivers</option>
                      <option value="kano">Kano</option>
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
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Email Address"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Phone number"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="Notes about your order, e.g. Any other details you might want us to know"
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
                <span className="text-primary">{formatPrice(totalPrice + shipping)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Bank Transfer Secured by Paystack</h3>
              <div className="flex gap-2 mb-4">
                <img src="/assets/images/icons/visa.svg" alt="Visa" className="h-8" />
                <img src="/assets/images/icons/verve.svg" alt="Verve" className="h-8" />
                <img src="/assets/images/icons/mastercard.svg" alt="Mastercard" className="h-8" />
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
                  className={`mt-1 mr-2 ${formErrors.agreeToTerms ? 'border-red-500' : ''}`}
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                  I have read and agree to the website{' '}
                  <Link to="/terms" className="text-pink-500 hover:text-pink-600">
                    terms and conditions
                  </Link>{' '}
                  *
                </label>
              </div>
              {formErrors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-500 mb-4">{formErrors.agreeToTerms}</p>
              )}
              
              <Button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-md font-medium"
              >
                Place Order
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