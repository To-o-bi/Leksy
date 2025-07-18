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
      try {
        const fee = await fetchBusParkDeliveryFee();
        setBusParkFee(fee);
      } catch (error) {
        setBusParkFee(2000);
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
            image: item.images?.[0] || '/placeholder.jpg' // Include image for success page
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
    <div className="container mx-auto px-4 py-8">
      {notification && <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Cart', path: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Delivery Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div onClick={() => setDeliveryMethod('address')} className={`border-2 rounded-lg p-4 cursor-pointer ${deliveryMethod === 'address' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}><div className="flex items-center"><input type="radio" name="deliveryMethod" value="address" checked={deliveryMethod === 'address'} readOnly className="h-4 w-4" /><div className="ml-3"><div className="font-medium">Home Delivery</div></div></div></div>
              <div onClick={() => setDeliveryMethod('bus-park')} className={`border-2 rounded-lg p-4 cursor-pointer ${deliveryMethod === 'bus-park' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}><div className="flex items-center"><input type="radio" name="deliveryMethod" value="bus-park" checked={deliveryMethod === 'bus-park'} readOnly className="h-4 w-4" /><div className="ml-3"><div className="font-medium">Bus Park</div></div></div></div>
              <div onClick={() => setDeliveryMethod('pickup')} className={`border-2 rounded-lg p-4 cursor-pointer ${deliveryMethod === 'pickup' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}><div className="flex items-center"><input type="radio" name="deliveryMethod" value="pickup" checked={deliveryMethod === 'pickup'} readOnly className="h-4 w-4" /><div className="ml-3"><div className="font-medium">Store Pickup</div></div></div></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2"><label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label><input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={`w-full p-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`} disabled={isProcessingOrder} />{formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}</div>
              <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label><input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full p-2 border rounded-md ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`} disabled={isProcessingOrder} />{formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}</div>
              <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label><input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className={`w-full p-2 border rounded-md ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`} disabled={isProcessingOrder} />{formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}</div>
            </div>
          </div>
          {(deliveryMethod === 'address' || deliveryMethod === 'bus-park') && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Delivery Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label><select id="state" name="state" value={formData.state} onChange={handleInputChange} className={`w-full p-2 border rounded-md ${formErrors.state ? 'border-red-500' : 'border-gray-300'}`} disabled={isProcessingOrder}><option value="">Select State</option>{nigerianStates.map(s => <option key={s} value={s}>{s}</option>)}</select>{formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}</div>
                <div><label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City / LGA <span className="text-red-500">*</span></label>{(deliveryMethod === 'address' && formData.state === 'Lagos') ? <select id="city" name="city" value={formData.city} onChange={handleInputChange} className={`w-full p-2 border rounded-md ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`} disabled={isLoadingLGAs || isProcessingOrder}><option value="">{isLoadingLGAs ? 'Loading...' : 'Select LGA'}</option>{availableLGAs.map(lga => <option key={lga.lga} value={lga.lga}>{lga.lga}</option>)}</select> : <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} className={`w-full p-2 border rounded-md ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`} disabled={isProcessingOrder} />}{formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}</div>
                {deliveryMethod === 'address' && <div className="md:col-span-2"><label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-1">Street Address <span className="text-red-500">*</span></label><input type="text" id="street_address" name="street_address" value={formData.street_address} onChange={handleInputChange} className={`w-full p-2 border rounded-md ${formErrors.street_address ? 'border-red-500' : 'border-gray-300'}`} disabled={isProcessingOrder} />{formErrors.street_address && <p className="text-red-500 text-xs mt-1">{formErrors.street_address}</p>}</div>}
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Order</h2>
            
            {/* --- THIS IS THE FIX --- */}
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.product_id} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.images?.[0] || '/placeholder.jpg'} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.jpg' }}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-800 flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            {/* --- END OF FIX --- */}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">{formatPrice(totalPrice)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Shipping</span><span className="font-medium">{getDeliveryPrice()}</span></div>
              <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t"><span className="text-gray-800">Total</span><span className="text-pink-600">{isCalculatingShipping ? '...' : formatPrice(finalTotal)}</span></div>
            </div>
            <div className="mt-6"><div className="flex items-start"><input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} className="h-4 w-4 mt-0.5" /><label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">I agree to the <Link to="/terms" className="text-pink-500">terms and conditions</Link> <span className="text-red-500">*</span></label></div>{formErrors.agreeToTerms && <p className="text-red-500 text-xs mt-1">{formErrors.agreeToTerms}</p>}</div>
            <Button type="submit" disabled={isProcessingOrder || isCalculatingShipping} className="w-full py-3 mt-4 rounded-md font-medium text-white bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400">
              {isProcessingOrder ? 'Processing...' : isCalculatingShipping ? 'Calculating...' : `Pay ${formatPrice(finalTotal)}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
