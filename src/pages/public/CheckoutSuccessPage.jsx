import React, { useState, useEffect } from 'react';

// Confetti Animation Component
const ConfettiAnimation = () => {
  const [confetti, setConfetti] = useState([]);

  const triggerConfetti = () => {
    const colors = ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493', '#FFCCCB', '#F8BBD9'];
    const newConfetti = [];
    
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        speed: Math.random() * 3 + 2,
        drift: Math.random() * 2 - 1,
      });
    }
    setConfetti(newConfetti);

    setTimeout(() => {
      setConfetti([]);
    }, 3000);
  };

  useEffect(() => {
    // Initial confetti
    triggerConfetti();

    // Set up interval to trigger confetti every 20 seconds
    const interval = setInterval(() => {
      triggerConfetti();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
          .confetti-piece {
            animation: fall 3s linear forwards;
          }
        `
      }} />
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 opacity-80 confetti-piece"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: piece.size % 2 === 0 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  );
};

// Floating Skincare Elements
const FloatingElements = () => {
  const skincareIcons = ['🧴', '✨', '💧', '🌸', '🌿', '💎'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {skincareIcons.map((icon, index) => (
        <div
          key={index}
          className="absolute text-2xl opacity-20 animate-bounce"
          style={{
            left: `${10 + index * 15}%`,
            top: `${20 + (index % 2) * 30}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: '3s',
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
};

const Button = ({ children, className, onClick, ...props }) => (
  <button className={className} onClick={onClick} {...props}>
    {children}
  </button>
);

const CheckoutSuccessPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const formatPrice = (price) => {
    if (isNaN(price)) return '₦0.00';
    return `₦${parseFloat(price).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('order_id');
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
    }

    const storedOrderDetails = sessionStorage.getItem('pendingOrderDetails');
    if (storedOrderDetails) {
      try {
        setOrderDetails(JSON.parse(storedOrderDetails));
        sessionStorage.removeItem('pendingOrderDetails');
      } catch (error) {
        console.error("Failed to parse order details from sessionStorage:", error);
      }
    }

    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 relative overflow-hidden">
      {/* Floating Skincare Elements */}
      <FloatingElements />
      
      {/* Confetti Animation */}
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-4 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-inner">
                <svg className="w-8 h-8 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent mb-4">
              Order Confirmed! 🧴
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Thank you for choosing Leksy Cosmetics! ✨
            </p>
            <p className="text-lg text-gray-500 mb-8">
              Your skincare essentials are on their way. A confirmation has been sent to your email.
            </p>
            {orderId && (
              <div className="mt-8 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg inline-block">
                <p className="text-sm text-gray-600">
                  Order ID: <span className="font-mono font-bold text-pink-600 text-lg">{orderId}</span>
                </p>
              </div>
            )}
          </div>

          {orderDetails ? (
            <div className={`bg-white rounded-2xl shadow-xl border-2 border-pink-200 p-8 mb-16 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
                  Your Skincare Collection 🧴
                </h2>
                <div className="flex space-x-1">
                  <span className="text-2xl">✨</span>
                  <span className="text-2xl">💧</span>
                  <span className="text-2xl">🌸</span>
                </div>
              </div>
              
              <div className="space-y-6 mb-8">
                {orderDetails.cart_obj?.map((item, index) => (
                  <div key={index} className="flex items-center gap-6 py-4 px-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200 hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img 
                        src={item.image || '/placeholder.jpg'} 
                        alt={item.product_name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.jpg' }}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.product_name}</h3>
                      <p className="text-sm text-pink-600 font-medium">Quantity: {item.ordered_quantity || item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-pink-600">
                        {formatPrice((item.product_price || item.price) * (item.ordered_quantity || item.quantity))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-pink-200 pt-8 mt-8">
                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl text-white">
                  <span className="text-2xl font-bold">Total Paid:</span>
                  <span className="text-3xl font-bold">{formatPrice(orderDetails.amount_paid)}</span>
                </div>
              </div>

              {orderDetails.customerInfo && (
                <div className="mt-8 pt-6 border-t border-pink-200">
                  <h3 className="text-xl font-bold text-pink-600 mb-4 flex items-center">
                    <span className="mr-2">👤</span>
                    Customer Details
                  </h3>
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg">
                    <p className="text-base text-gray-700 mb-3"><strong>Name:</strong> {orderDetails.customerInfo.name}</p>
                    <p className="text-base text-gray-700"><strong>Email:</strong> {orderDetails.customerInfo.email}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-12 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl mb-16 border-2 border-pink-200">
              <div className="text-6xl mb-6">💌</div>
              <p className="text-gray-600 text-xl">Order summary is not available. Please check your email for the full details.</p>
            </div>
          )}

          <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Button
              onClick={() => window.location.href = '/shop'}
              className="bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white px-10 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
            >
              Continue Shopping 🛍️
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 px-10 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
            >
              Back to Home 🏠
            </Button>
          </div>

          {/* Thank you message */}
          <div className={`text-center transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-gradient-to-r from-pink-400 to-pink-600 text-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-3xl font-bold mb-4">Thank You for Choosing Leksy Cosmetics! 💕</h3>
              <p className="text-pink-100 text-lg mb-6">
                Your skincare journey continues with us. Follow us on social media for tips, tutorials, and exclusive offers!
              </p>
              <div className="flex justify-center space-x-6">
                <span className="text-3xl cursor-pointer hover:scale-110 transition-transform">📱</span>
                <span className="text-3xl cursor-pointer hover:scale-110 transition-transform">💌</span>
                <span className="text-3xl cursor-pointer hover:scale-110 transition-transform">✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;