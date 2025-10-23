import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Breadcrumb from '../../components/common/Breadcrumb';
import Notification from '../../components/common/Notification';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DeliveryMethodSection from './checkout/DeliveryMethodSection';
import CustomerInformationSection from './PolicyPages/CustomerInformationSection';
import OrderSummarySection from './checkout/OrderSummarySection';
import BusParkModal from './checkout/BusParkModal';
import {
  validateCheckoutForm,
  initiateCheckout,
  fetchLGADeliveryFees,
  fetchBusParkDeliveryFee,
  getSuccessRedirectUrl,
  fetchDeliveryFeeForState,
  fetchDeliveryFeeForLGA
} from '../../api/CheckoutService';

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart, validateCart } = useCart();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('address');
  
  // Shipping state - stores the complete fee object from backend (already discounted)
  // ✨ UPDATED: Now includes isFirstTimePurchase field
  const [shippingDetails, setShippingDetails] = useState({
    delivery_fee: 0,
    original_delivery_fee: 0,
    discount_percent: 0,
    isFirstTimePurchase: false
  });
  
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [availableLGAs, setAvailableLGAs] = useState([]);
  const [isLoadingLGAs, setIsLoadingLGAs] = useState(false);
  
  const [showBusParkModal, setShowBusParkModal] = useState(false);
  const [pendingDeliveryMethod, setPendingDeliveryMethod] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    additional_phone: '',
    state: '',
    city: '',
    street_address: '',
    notes: '',
    agreeToTerms: false
  });

  // Use the discounted delivery fee from backend
  const shipping = shippingDetails.delivery_fee;
  const finalTotal = totalPrice + shipping;
  const SUCCESS_REDIRECT_URL = getSuccessRedirectUrl();
  const hasDeliveryDiscount = shippingDetails.discount_percent > 0;

  const [formErrors, setFormErrors] = useState({});

  // Fetch bus park fee on mount with current total for discount calculation
  const [busParkFeeDisplay, setBusParkFeeDisplay] = useState(null);
  useEffect(() => {
    const loadBusParkFee = async () => {
      const fee = await fetchBusParkDeliveryFee(totalPrice);
      setBusParkFeeDisplay(fee);
    };
    loadBusParkFee();
  }, [totalPrice]);

  useEffect(() => {
    const performInitialValidation = async () => {
      if (cart.length > 0) {
        const result = await validateCart();
        if (result.wasModified) {
          setNotification({ 
            type: 'info', 
            message: 'Your cart was updated due to stock changes. Please review before proceeding.' 
          });
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

  const calculateShipping = useCallback(async () => {
    setIsCalculatingShipping(true);
    let feeData = {
      delivery_fee: 0,
      original_delivery_fee: 0,
      discount_percent: 0,
      isFirstTimePurchase: false
    };
    
    try {
      if (deliveryMethod === 'bus-park') {
        feeData = await fetchBusParkDeliveryFee(totalPrice);
      } else if (deliveryMethod === 'address' && formData.state) {
        if (formData.state === 'Lagos' && formData.city) {
          feeData = await fetchDeliveryFeeForLGA(formData.city, totalPrice);
        } else if (formData.state !== 'Lagos') {
          feeData = await fetchDeliveryFeeForState(formData.state, totalPrice);
        }
      } else if (deliveryMethod === 'pickup') {
        feeData = { 
          delivery_fee: 0, 
          original_delivery_fee: 0, 
          discount_percent: 0,
          isFirstTimePurchase: false 
        };
      }
    } catch (error) {
      feeData = { 
        delivery_fee: 0, 
        original_delivery_fee: 0, 
        discount_percent: 0,
        isFirstTimePurchase: false
      };
    }

    setShippingDetails(feeData);
    setIsCalculatingShipping(false);
  }, [deliveryMethod, formData.state, formData.city, totalPrice, cart]);

  useEffect(() => {
    calculateShipping();
  }, [calculateShipping]);

  // Load LGAs for Lagos with delivery fee info (including discounts)
  useEffect(() => {
    const loadLGAs = async () => {
      if (formData.state === 'Lagos' && deliveryMethod === 'address') {
        setIsLoadingLGAs(true);
        try {
          const lgas = await fetchLGADeliveryFees(formData.state, totalPrice);
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
  }, [formData.state, deliveryMethod, totalPrice]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDeliveryMethodChange = (method) => {
    if (method === 'bus-park') {
      setPendingDeliveryMethod(method);
      setShowBusParkModal(true);
    } else {
      setDeliveryMethod(method);
    }
  };

  const handleBusParkModalConfirm = () => {
    setDeliveryMethod(pendingDeliveryMethod);
    setShowBusParkModal(false);
    setPendingDeliveryMethod(null);
  };

  const handleBusParkModalCancel = () => {
    setShowBusParkModal(false);
    setPendingDeliveryMethod(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);

    if (deliveryMethod === 'bus-park') {
      setShowBusParkModal(true);
      return;
    }

    await processCheckout();
  };

  const processCheckout = async () => {
    setIsProcessingOrder(true);

    const validationResult = await validateCart();
    if (validationResult.wasModified) {
      setNotification({ 
        type: 'error', 
        message: 'Your cart changed due to stock updates. Please review your cart again.' 
      });
      setIsProcessingOrder(false);
      setTimeout(() => navigate('/cart'), 4000);
      return;
    }

    const errors = validateCheckoutForm(formData, deliveryMethod);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setNotification({ 
        type: 'error', 
        message: 'Please fill in all required fields correctly.' 
      });
      setIsProcessingOrder(false);
      return;
    }

    try {
      const result = await initiateCheckout(
        formData, 
        deliveryMethod, 
        cart, 
        SUCCESS_REDIRECT_URL
      );

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
      setNotification({ 
        type: 'error', 
        message: error.message || 'An unexpected error occurred.' 
      });
      setIsProcessingOrder(false);
    }
  };

  const handleBusParkCheckout = () => {
    setShowBusParkModal(false);
    processCheckout();
  };

  const getDiscountBannerMessage = () => {
    if (!hasDeliveryDiscount || deliveryMethod === 'pickup') return null;
    
    if (shippingDetails.isFirstTimePurchase) {
      return {
        icon: '🎉',
        text: `First-Time Buyer Bonus: ${shippingDetails.discount_percent}% OFF Delivery Fees!`,
        gradient: 'from-pink-50 to-pink-50',
        border: 'border-pink-200',
        textColor: 'text-pink-800'
      };
    }
    
    return {
      icon: '🎉',
      text: `Special Offer: ${shippingDetails.discount_percent}% OFF Delivery Fees!`,
      gradient: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      textColor: 'text-green-800'
    };
  };

  const discountBanner = getDiscountBannerMessage();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Full-screen loading overlay */}
      {isProcessingOrder && (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
          <LoadingSpinner size="large" text="Processing your order and connecting to payment gateway..." />
        </div>
      )}

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

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order information below</p>

          {discountBanner && (
            <div className="mt-4 mx-auto max-w-2xl">
              <div className={`bg-gradient-to-r ${discountBanner.gradient} border-2 ${discountBanner.border} rounded-lg p-4`}>
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span className={`${discountBanner.textColor} font-semibold`}>
                    {discountBanner.icon} {discountBanner.text}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <DeliveryMethodSection 
              deliveryMethod={deliveryMethod}
              onDeliveryMethodChange={handleDeliveryMethodChange}
              busParkFeeDisplay={busParkFeeDisplay}
              isProcessingOrder={isProcessingOrder}
            />

            <CustomerInformationSection 
              formData={formData}
              formErrors={formErrors}
              onInputChange={handleInputChange}
              deliveryMethod={deliveryMethod}
              availableLGAs={availableLGAs}
              isLoadingLGAs={isLoadingLGAs}
              isProcessingOrder={isProcessingOrder}
            />
          </div>

          <OrderSummarySection 
            cart={cart}
            totalPrice={totalPrice}
            shipping={shipping}
            finalTotal={finalTotal}
            shippingDetails={shippingDetails}
            hasDeliveryDiscount={hasDeliveryDiscount}
            deliveryMethod={deliveryMethod}
            isCalculatingShipping={isCalculatingShipping}
            formData={formData}
            formErrors={formErrors}
            onInputChange={handleInputChange}
            isProcessingOrder={isProcessingOrder}
            onSubmit={handleSubmit}
          />
        </form>

        <BusParkModal 
          isOpen={showBusParkModal}
          onCancel={handleBusParkModalCancel}
          onConfirm={pendingDeliveryMethod ? handleBusParkModalConfirm : handleBusParkCheckout}
          isPendingSelection={!!pendingDeliveryMethod}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;