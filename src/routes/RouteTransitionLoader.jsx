import React, { useState, useEffect, useContext, createContext } from 'react';
import { useLocation } from 'react-router-dom';

// Context for managing route transitions
const RouteTransitionContext = createContext({
  isTransitioning: false,
  startTransition: () => {},
  endTransition: () => {}
});

export const useRouteTransition = () => useContext(RouteTransitionContext);

export const RouteTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();
  
  const startTransition = () => {
    setIsTransitioning(true);
  };
  
  const endTransition = () => {
    setIsTransitioning(false);
  };

  // Auto-end transition after a maximum time to prevent stuck states
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 2000); // Max 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  // End transition when route changes (backup)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <RouteTransitionContext.Provider value={{ isTransitioning, startTransition, endTransition }}>
      {children}
      {isTransitioning && <RouteTransitionOverlay />}
    </RouteTransitionContext.Provider>
  );
};

const RouteTransitionOverlay = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Main spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-pink-500 mx-auto"></div>
          
          {/* Inner pulse effect */}
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-pink-300 mx-auto opacity-30"></div>
        </div>
        
        <p className="text-gray-600 mt-4 font-medium">Loading product...</p>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-1 mt-3">
          <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

// Hook for ProductCard or any component that needs to trigger transitions
export const useProductNavigation = () => {
  const { startTransition } = useRouteTransition();
  
  const navigateToProduct = (navigate, productId, product = null) => {
    startTransition();
    
    // Small delay to show the loading state
    setTimeout(() => {
      navigate(`/product/${productId}`, {
        state: product ? { product } : undefined
      });
    }, 300);
  };
  
  return { navigateToProduct };
};