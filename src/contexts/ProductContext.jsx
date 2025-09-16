import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { productService } from '../api';

const ProductContext = createContext();

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};

// Updated categoryVisuals to match your actual category names with custom image sizes
const categoryVisuals = {
    'serum': { 
        image: '/assets/images/categories/serum.png', 
        bgColor: 'bg-pink-100', 
        hoverColor: 'hover:bg-pink-200',
        imageSize: 'w-16 h-16' // default size
    },
    'moisturizer': { 
        image: '/assets/images/categories/moisturizer.png', 
        bgColor: 'bg-amber-50', 
        hoverColor: 'hover:bg-amber-100',
        imageSize: 'w-16 h-16' // default size
    },
    'body-and-bath': { 
        image: '/assets/images/categories/body.png', 
        bgColor: 'bg-pink-100', 
        hoverColor: 'hover:bg-pink-200',
        imageSize: 'w-24 h-24' // slightly bigger
    },
    'sunscreen': { 
        image: '/assets/images/categories/sunscreen.png', 
        bgColor: 'bg-purple-100', 
        hoverColor: 'hover:bg-purple-200',
        imageSize: 'w-16 h-16' // default size
    },
    'toner': { 
        image: '/assets/images/categories/toner.png', 
        bgColor: 'bg-blue-100', 
        hoverColor: 'hover:bg-blue-200',
        imageSize: 'w-16 h-16' // default size
    },
    'cleanser': { 
        image: '/assets/images/categories/cleanser.png', 
        bgColor: 'bg-emerald-100', 
        hoverColor: 'hover:bg-emerald-200',
        imageSize: 'w-16 h-16' // default size
    },
    'eye-cream': { 
        image: '/assets/images/categories/eye.png', 
        bgColor: 'bg-gray-100', 
        hoverColor: 'hover:bg-gray-200',
        imageSize: '!w-20 !h-20' // slightly bigger
    },
    'beauty': { 
        image: '/assets/images/categories/beauty.png', 
        bgColor: 'bg-red-100', 
        hoverColor: 'hover:bg-red-200',
        imageSize: 'w-20 h-20' // slightly bigger
    },
    'mask': { 
        image: '/assets/images/categories/mask.png', 
        bgColor: 'bg-amber-50', 
        hoverColor: 'hover:bg-amber-100',
        imageSize: '!w-20 !h-20' // slightly bigger with !important
    },
    'default': { 
        image: '/placeholder.jpg', 
        bgColor: 'bg-gray-100', 
        hoverColor: 'hover:bg-gray-200',
        imageSize: 'w-16 h-16' // default size
    }
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);
    const [cache, setCache] = useState(new Map());

    const categories = useMemo(() => {
        if (products.length === 0) return [];
        
        const categoryCounts = products.reduce((acc, product) => {
            const categoryName = product.category || 'Uncategorized';
            acc[categoryName] = (acc[categoryName] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(categoryCounts).map(([name, count], index) => {
            // Use toLowerCase() for matching and provide fallback
            const normalizedName = name.toLowerCase();
            const visuals = categoryVisuals[normalizedName] || categoryVisuals.default;
            
            return {
                id: index + 1,
                name,
                productCount: count,
                path: `/shop?category=${encodeURIComponent(name)}`,
                ...visuals
            };
        });
    }, [products]);

    const clearError = useCallback(() => setError(null), []);

    const needsRefresh = useCallback(() => {
        if (!lastFetch) return true;
        const fiveMinutes = 5 * 60 * 1000;
        return Date.now() - lastFetch > fiveMinutes;
    }, [lastFetch]);

    const fetchAllProducts = useCallback(async (options = {}, forceRefresh = false) => {
        if (!forceRefresh && products.length > 0 && !needsRefresh()) {
            return products;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await productService.fetchProducts(options);
            if (response && response.code === 200 && response.products) {
                setProducts(response.products);
                setLastFetch(Date.now());
                return response.products;
            } else {
                throw new Error(response?.message || 'Invalid response format');
            }
        } catch (err) {
            setError(err.message || 'Failed to load products');
            return products.length > 0 ? products : [];
        } finally {
            setLoading(false);
        }
    }, [products, needsRefresh]);

    const getProductById = useCallback(async (productId) => {
        if (!productId || productId === 'undefined') return null;

        if (cache.has(productId)) {
            const cached = cache.get(productId);
            const cacheAge = Date.now() - cached.timestamp;
            const fiveMinutes = 5 * 60 * 1000;
            if (cacheAge < fiveMinutes) return cached.product;
        }
        
        const cachedProduct = products.find(p => p.product_id === productId);
        if (cachedProduct) return cachedProduct;
        
        setLoading(true);
        try {
            const response = await productService.fetchProduct(productId);
            if (response && response.code === 200 && response.product) {
                const product = response.product;
                setCache(prev => new Map(prev).set(productId, { product, timestamp: Date.now() }));
                return product;
            } else {
                throw new Error(response?.message || 'Product not found');
            }
        } catch(err) {
            setError(err.message || 'Failed to load product details');
            return null;
        } finally {
            setLoading(false);
        }
    }, [products, cache]);

    const refreshProducts = useCallback(() => {
        return fetchAllProducts({}, true);
    }, [fetchAllProducts]);

    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

    const contextValue = useMemo(() => ({
        products,
        loading,
        error,
        categories,
        fetchAllProducts,
        getProductById,
        refreshProducts,
        clearError,
        productCount: products.length,
        hasProducts: products.length > 0,
    }), [
        products,
        loading,
        error,
        categories,
        fetchAllProducts,
        getProductById,
        refreshProducts,
        clearError
    ]);

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};