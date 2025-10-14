import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { discountService } from '../api/services';

const DiscountContext = createContext();

export const useDiscounts = () => {
  const context = useContext(DiscountContext);
  if (!context) {
    throw new Error('useDiscounts must be used within a DiscountProvider');
  }
  return context;
};

export const DiscountProvider = ({ children }) => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchRef = useRef(null); // Use ref instead of state for cache tracking
  const isFetchingRef = useRef(false);

  const fetchActiveDiscounts = useCallback(async (forceRefresh = false) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    // Use ref to avoid stale closure
    const cacheAge = lastFetchRef.current ? Date.now() - lastFetchRef.current : Infinity;
    const cacheExpired = cacheAge >= 5 * 60 * 1000;
    
    // Check cache - but ALWAYS refresh if forceRefresh is true
    if (!forceRefresh && lastFetchRef.current && !cacheExpired) {
      setLoading(false);
      return discounts; // Return current discounts
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
        
    try {
      const response = await discountService.fetchActiveDiscounts();
      
      if (response && response.code === 200) {
        const activeDiscounts = response.discounts || [];
        
        // CRITICAL: Always set fresh data, clear any stale state
        setDiscounts(activeDiscounts);
        lastFetchRef.current = Date.now();
        setLoading(false);
        isFetchingRef.current = false;
        return activeDiscounts;
      } else {
        throw new Error(response?.message || 'Failed to fetch discounts');
      }
    } catch (err) {
      console.error('Error fetching discounts:', err);
      setError(err.message);
      setDiscounts([]); // Clear discounts on error
      setLoading(false);
      isFetchingRef.current = false;
      return [];
    }
  }, []); // Remove lastFetch dependency to avoid stale closure

  useEffect(() => {
    fetchActiveDiscounts();
  }, []); // Only run once on mount

  const applyDiscountToProduct = useCallback((product) => {
    if (!product) return product;
    
    // IMPORTANT: Always use current discounts, never cached
    return discountService.applyDiscountToProduct(product, discounts);
  }, [discounts]);

  const applyDiscountsToProducts = useCallback((products) => {
    if (!products || !Array.isArray(products)) return products;
    
    // IMPORTANT: Always use current discounts
    return discountService.applyDiscountsToProducts(products, discounts);
  }, [discounts]);

  const calculateDiscount = useCallback((product) => {
    return discountService.calculateDiscountedPrice(product, discounts);
  }, [discounts]);

  const hasActiveDiscount = useCallback((product) => {
    const discountInfo = discountService.calculateDiscountedPrice(product, discounts);
    return discountInfo !== null;
  }, [discounts]);

  const refreshDiscounts = useCallback(async () => {
    // Force a complete refresh, bypassing cache
    lastFetchRef.current = null; // Reset cache timestamp
    const freshDiscounts = await fetchActiveDiscounts(true);
    return freshDiscounts;
  }, [fetchActiveDiscounts]);

  const contextValue = useMemo(() => ({
    discounts,
    loading,
    error,
    hasDiscounts: discounts.length > 0,
    applyDiscountToProduct,
    applyDiscountsToProducts,
    calculateDiscount,
    hasActiveDiscount,
    refreshDiscounts,
    clearError: () => setError(null)
  }), [
    discounts, 
    loading, 
    error, 
    applyDiscountToProduct, 
    applyDiscountsToProducts, 
    calculateDiscount, 
    hasActiveDiscount, 
    refreshDiscounts
  ]);

  return (
    <DiscountContext.Provider value={contextValue}>
      {children}
    </DiscountContext.Provider>
  );
};