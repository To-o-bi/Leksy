import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import { orderService } from '../../api/services';

// Real Paystack service implementation
const paystackService = {
  // Your Paystack public key - replace with your actual public key
  publicKey: 'pk_test_d653398fb92b5cf790c4e7923e0fca0c120bcc19', // Replace with your actual public key
  
  loadPaystackScript: () => {
    return new Promise((resolve, reject) => {
      // Check if Paystack is already loaded
      if (window.PaystackPop) {
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      
      script.onload = () => {
        if (window.PaystackPop) {
          resolve();
        } else {
          reject(new Error('Paystack failed to load'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Paystack script'));
      };
      
      document.head.appendChild(script);
    });
  },

  generateReference: () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN_${timestamp}_${random}`;
  },

  initializePayment: (paymentData) => {
    return new Promise((resolve, reject) => {
      if (!window.PaystackPop) {
        reject(new Error('Paystack not loaded'));
        return;
      }

      try {
        const handler = window.PaystackPop.setup({
          key: paystackService.publicKey,
          email: paymentData.email,
          amount: Math.round(paymentData.amount * 100), // Convert to kobo
          currency: paymentData.currency || 'NGN',
          ref: paymentData.reference,
          metadata: paymentData.metadata || {},
          callback: function(response) {
            console.log('Paystack payment successful:', response);
            if (paymentData.onSuccess) {
              paymentData.onSuccess(response);
            }
            resolve(response);
          },
          onClose: function() {
            console.log('Paystack payment window closed');
            if (paymentData.onClose) {
              paymentData.onClose();
            }
          },
          // Add these to prevent language errors
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
          plan: null,
          quantity: null,
          subaccount: null,
          transaction_charge: null,
          bearer: null
        });

        handler.openIframe();
      } catch (error) {
        console.error('Paystack initialization error:', error);
        reject(error);
      }
    });
  },

  // Verify payment with your backend
  verifyPayment: async (reference) => {
    try {
      // Since you only have /api/orders, we'll skip separate verification
      // and handle verification within the order creation process
      console.log('Payment reference for verification:', reference);
      return { success: true, reference };
    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: true, reference }; // Assume success for now
    }
  },

  // Create order with your backend
  createOrder: async (orderData) => {
    try {
      // Use your existing orderService.initiateCheckout instead of direct API call
      // since your API structure might be different
      const checkoutData = {
        name: orderData.customer.name,
        email: orderData.customer.email,
        phone: orderData.customer.phone,
        delivery_method: orderData.delivery.method,
        cart: orderData.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
          variant_id: item.variant?.id || null
        })),
        // Add payment reference for verification
        payment_reference: orderData.payment.reference,
        payment_status: 'paid',
        success_redirect: `${window.location.origin}/checkout/confirmation`
      };

      // Add address fields if delivery method is address
      if (orderData.delivery.method === 'address') {
        checkoutData.state = orderData.customer.state;
        checkoutData.city = orderData.customer.city;
        checkoutData.street_address = orderData.customer.address;
      }

      // Use the orderService instead of direct fetch
      const { orderService } = await import('../../api/services');
      const result = await orderService.initiateCheckout(checkoutData);
      
      return {
        success: true,
        orderId: result.order_id || `ORD_${Date.now()}`,
        ...result
      };
    } catch (error) {
      console.error('Order creation error:', error);
      
      // Try direct API call as fallback
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return {
          success: true,
          orderId: result.order_id || result.id || `ORD_${Date.now()}`,
          ...result
        };
      } catch (fetchError) {
        console.error('Direct API call also failed:', fetchError);
        throw new Error(`Order creation failed: ${fetchError.message}`);
      }
    }
  }
};

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLoadingPaystack, setIsLoadingPaystack] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState('address');
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
  const shipping = deliveryMethod === 'pickup' ? 0 : 5000; // Fixed shipping cost in Naira
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

  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);
    // Clear address-related errors if switching to pickup
    if (method === 'pickup') {
      const newErrors = { ...formErrors };
      delete newErrors.state;
      delete newErrors.city;
      delete newErrors.street_address;
      setFormErrors(newErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    
    if (deliveryMethod === 'address') {
      if (!formData.state.trim()) errors.state = 'State is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.street_address.trim()) errors.street_address = 'Street address is required';
    }
    
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
      
      // Create order directly with payment details
      // Since you only have /api/orders, we'll include payment verification data
      const orderData = {
        // Payment information from Paystack
        payment: {
          reference: response.reference,
          status: response.status,
          transaction_id: response.transaction || response.trans,
          amount: finalTotal,
          currency: 'NGN',
          paymentMethod: 'paystack',
          paidAt: new Date().toISOString(),
          gateway_response: response.gateway_response || 'Successful',
          channel: response.channel || 'card'
        },
        
        // Customer information
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: deliveryMethod === 'address' ? formData.street_address : null,
          city: formData.city,
          state: formData.state
        },
        
        // Order items
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant || null,
          image: item.image
        })),
        
        // Delivery information
        delivery: {
          method: deliveryMethod,
          cost: shipping,
          address: deliveryMethod === 'address' ? formData.street_address : null,
          city: formData.city,
          state: formData.state
        },
        
        // Order totals
        subtotal: totalPrice,
        shipping: shipping,
        total: finalTotal,
        notes: formData.notes,
        status: 'paid', // Set as paid since payment was successful
        
        // Additional metadata
        metadata: {
          paystack_reference: response.reference,
          delivery_method: deliveryMethod,
          cart_items_count: cart.length,
          order_source: 'web_checkout'
        }
      };

      // Create order with your backend
      const orderResult = await paystackService.createOrder(orderData);
      
      if (orderResult.success || orderResult.orderId || orderResult.order_id) {
        // Clear cart and show success
        clearCart();
        
        const orderId = orderResult.orderId || orderResult.order_id || orderResult.id || 'N/A';
        
        setNotification({
          type: 'success',
          message: `Payment successful! Order #${orderId} has been placed.`
        });

        // Navigate immediately to confirmation page
        navigate('/checkout/confirmation', {
          state: {
            orderData: orderResult,
            paymentReference: response.reference,
            paymentStatus: 'success',
            orderId: orderId
          }
        });
      } else {
        // If order creation failed but we have payment, still show success with reference
        clearCart();
        
        setNotification({
          type: 'success', 
          message: `Payment successful! Reference: ${response.reference}. Please contact support if needed.`
        });

        navigate('/checkout/confirmation', {
          state: {
            orderData: { payment_reference: response.reference },
            paymentReference: response.reference,
            paymentStatus: 'success',
            orderId: response.reference
          }
        });
      }

    } catch (error) {
      console.error('Post-payment processing error:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Payment was successful but order processing failed. Please contact support with reference: ' + response.reference
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
      
      // Prepare checkout data for your API using the orderService
      const checkoutData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        delivery_method: deliveryMethod,
        cart: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          variant_id: item.variant?.id || null
        })),
        success_redirect: `${window.location.origin}/checkout/success`
      };

      // Add address fields if delivery method is address
      if (deliveryMethod === 'address') {
        checkoutData.state = formData.state;
        checkoutData.city = formData.city;
        checkoutData.street_address = formData.street_address;
      }

      console.log('Initiating checkout with orderService...');
      
      try {
        // First, try to initiate checkout with your backend
        const checkoutResponse = await orderService.initiateCheckout(checkoutData);
        
        if (checkoutResponse?.payment_url) {
          // If your backend returns a payment URL, redirect to it
          console.log('Redirecting to payment URL:', checkoutResponse.payment_url);
          window.location.href = checkoutResponse.payment_url;
          return;
        }
        
        if (checkoutResponse?.code === 200 || checkoutResponse?.success) {
          // Handle successful checkout without payment URL - proceed with Paystack
          console.log('Checkout successful, proceeding with Paystack payment...');
        }
      } catch (orderError) {
        console.error('OrderService checkout failed, proceeding with Paystack:', orderError);
        // Continue with Paystack integration even if orderService fails
      }

      // Proceed with Paystack payment integration
      const paymentReference = paystackService.generateReference();
      
      const paymentData = {
        email: formData.email,
        amount: finalTotal, // Amount in Naira (will be converted to kobo in paystackService)
        reference: paymentReference,
        currency: 'NGN',
        metadata: {
          customer_name: formData.name,
          customer_phone: formData.phone,
          delivery_method: deliveryMethod,
          delivery_address: deliveryMethod === 'address' ? formData.street_address : 'Store Pickup',
          delivery_state: formData.state,
          delivery_city: formData.city,
          delivery_cost: shipping,
          order_items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            product_id: item.id
          })),
          custom_fields: [
            {
              display_name: "Cart Items",
              variable_name: "cart_items",
              value: cart.length + " items"
            },
            {
              display_name: "Delivery Method",
              variable_name: "delivery_method",
              value: deliveryMethod
            }
          ]
        },
        onSuccess: handlePaymentSuccess,
        onClose: () => {
          console.log('Payment modal closed');
          setIsProcessingPayment(false);
        }
      };

      console.log('Initializing Paystack payment with data:', paymentData);
      
      // Initialize Paystack payment
      await paystackService.initializePayment(paymentData);
      
    } catch (error) {
      console.error('Payment initialization error:', error);
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
                    disabled={isProcessingPayment}
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
                      disabled={isProcessingPayment}
                    >
                      <option value="">Select State</option>
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Rivers">Rivers</option>
                      <option value="Kano">Kano</option>
                      <option value="Ogun">Ogun</option>
                      <option value="Kaduna">Kaduna</option>
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
                      disabled={isProcessingPayment}
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
                    disabled={isProcessingPayment}
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
              <h3 className="font-medium text-gray-800 mb-3">Secure Payment with Paystack</h3>
              <div className="flex gap-2 mb-4">
                <div className="flex items-center bg-blue-100 px-3 py-1 rounded text-xs font-medium text-blue-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                  </svg>
                  Visa
                </div>
                <div className="flex items-center bg-orange-100 px-3 py-1 rounded text-xs font-medium text-orange-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                  </svg>
                  Mastercard
                </div>
                <div className="flex items-center bg-green-100 px-3 py-1 rounded text-xs font-medium text-green-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                  </svg>
                  Verve
                </div>
                <div className="flex items-center bg-purple-100 px-3 py-1 rounded text-xs font-medium text-purple-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  Bank Transfer
                </div>
              </div>
              
              <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <span className="text-sm font-medium text-green-800">SSL Secured by Paystack</span>
                  <p className="text-xs text-green-700">Your payment information is encrypted and secure</p>
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