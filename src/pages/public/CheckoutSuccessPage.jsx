import React from 'react';

// --- Helper Components ---

// A single-burst confetti animation that feels celebratory but not overwhelming.
const ConfettiBurst = () => {
  const [pieces, setPieces] = React.useState([]);

  React.useEffect(() => {
    const newPieces = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20 - Math.random() * 50,
      angle: Math.random() * 360,
      color: ['#fecaca', '#f9a8d4', '#f0abfc'][Math.floor(Math.random() * 3)],
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }
        .confetti-piece {
          animation: fall 5s linear forwards;
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full opacity-80 confetti-piece"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}px`,
            backgroundColor: p.color,
            width: '8px',
            height: '8px',
            transform: `rotate(${p.angle}deg)`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

// A simple, reusable button component.
const Button = ({ children, onClick, variant = 'primary' }) => {
  const baseClasses = "px-8 py-3 font-semibold rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    primary: "bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
};


// --- Main Page Component ---

const CheckoutSuccessPage = () => {
  const [orderDetails, setOrderDetails] = React.useState(null);
  const [orderId, setOrderId] = React.useState(null);

  // Helper to format currency
  const formatPrice = (price) => {
    if (isNaN(price)) return '₦0.00';
    return `₦${parseFloat(price).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  React.useEffect(() => {
    // --- Data Fetching Logic ---
    // Get Order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('order_id');
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
    }

    // Get order details from sessionStorage (if available)
    const storedOrderDetails = sessionStorage.getItem('pendingOrderDetails');
    if (storedOrderDetails) {
      try {
        setOrderDetails(JSON.parse(storedOrderDetails));
        sessionStorage.removeItem('pendingOrderDetails');
      } catch (error) {
        console.error("Failed to parse order details from sessionStorage:", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex items-center justify-center p-4 relative">
      <ConfettiBurst />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-content {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>

      <main className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 sm:p-10 text-center fade-in-content">
        
        {/* Header */}
        <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Order Confirmed!</h1>
            <p className="text-gray-600 mt-2">Thank you for your purchase. Your skincare goodies are on the way.</p>
            {orderId && (
                <div className="mt-4 inline-block bg-gray-100 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-700">
                        Order ID: <span className="font-medium text-gray-900">{orderId}</span>
                    </p>
                </div>
            )}
        </div>
        
        {/* Order Details */}
        {orderDetails ? (
          <div className="border-t border-b border-gray-200 py-6 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              {orderDetails.cart_obj?.map((item) => (
                <div key={item.product_id || item.id} className="flex items-center gap-4">
                  <img 
                    src={item.image || 'https://placehold.co/64x64/fce7f3/f472b6?text=LC'} 
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-pink-50"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/64x64/fce7f3/f472b6?text=LC' }}
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{item.product_name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.ordered_quantity || item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-800">
                    {formatPrice((item.product_price || item.price) * (item.ordered_quantity || item.quantity))}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-900">Total Paid:</p>
              <p className="text-xl font-bold text-pink-600">{formatPrice(orderDetails.amount_paid)}</p>
            </div>
          </div>
        ) : (
          <div className="border-t border-b border-gray-200 py-8">
            <p className="text-gray-600">Your order summary is not available here. Please check your email for the full receipt.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => window.location.href = '/shop'}>
              Continue Shopping
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="secondary">
              Back to Home
            </Button>
        </div>
      </main>
    </div>
  );
};

export default CheckoutSuccessPage;

