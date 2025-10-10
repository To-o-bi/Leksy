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
  const [lastFetch, setLastFetch] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchActiveDiscounts = useCallback(async (forceRefresh = false) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    const cacheAge = lastFetch ? Date.now() - lastFetch : Infinity;
    const cacheExpired = cacheAge >= 5 * 60 * 1000;
    
    // Check cache using ref to avoid stale closure
    if (!forceRefresh && lastFetch && !cacheExpired) {
      setLoading(false);
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
        
    try {
      const response = await discountService.fetchActiveDiscounts();
      
      if (response && response.code === 200) {
        const activeDiscounts = response.discounts || [];
        setDiscounts(activeDiscounts);
        setLastFetch(Date.now());
        setLoading(false);
        isFetchingRef.current = false;
        return activeDiscounts;
      } else {
        throw new Error(response?.message || 'Failed to fetch discounts');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      isFetchingRef.current = false;
      return [];
    }
  }, [lastFetch]);

  useEffect(() => {
    fetchActiveDiscounts();
  }, []); // Only run once on mount

  const applyDiscountToProduct = useCallback((product) => {
    return discountService.applyDiscountToProduct(product, discounts);
  }, [discounts]);

  const applyDiscountsToProducts = useCallback((products) => {
    return discountService.applyDiscountsToProducts(products, discounts);
  }, [discounts]);

  const calculateDiscount = useCallback((product) => {
    return discountService.calculateDiscountedPrice(product, discounts);
  }, [discounts]);

  const hasActiveDiscount = useCallback((product) => {
    const discountInfo = discountService.calculateDiscountedPrice(product, discounts);
    return discountInfo !== null;
  }, [discounts]);

  const refreshDiscounts = useCallback(() => {
    return fetchActiveDiscounts(true);
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