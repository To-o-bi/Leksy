import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { productService, salesService } from '../../src/api/services'; 

const ProductContext = createContext();

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};

// Visual configurations for categories
const categoryVisuals = {
    'serum': { image: '/assets/images/categories/serum.png', bgColor: 'bg-pink-100', hoverColor: 'hover:bg-pink-200', imageSize: 'w-16 h-16' },
    'moisturizer': { image: '/assets/images/categories/moisturizer.png', bgColor: 'bg-amber-50', hoverColor: 'hover:bg-amber-100', imageSize: 'w-16 h-16' },
    'perfume': { image: '/assets/images/categories/perfume.png', bgColor: 'bg-amber-50', hoverColor: 'hover:bg-amber-100', imageSize: 'w-16 h-16' },
    'body-and-bath': { image: '/assets/images/categories/body.png', bgColor: 'bg-pink-100', hoverColor: 'hover:bg-pink-200', imageSize: 'w-24 h-24' },
    'sunscreen': { image: '/assets/images/categories/sunscreen.png', bgColor: 'bg-purple-100', hoverColor: 'hover:bg-purple-200', imageSize: 'w-16 h-16' },
    'toner': { image: '/assets/images/categories/toner.png', bgColor: 'bg-blue-100', hoverColor: 'hover:bg-blue-200', imageSize: 'w-16 h-16' },
    'cleanser': { image: '/assets/images/categories/cleanser.png', bgColor: 'bg-emerald-100', hoverColor: 'hover:bg-emerald-200', imageSize: 'w-16 h-16' },
    'eye-cream': { image: '/assets/images/categories/eye.png', bgColor: 'bg-gray-100', hoverColor: 'hover:bg-gray-200', imageSize: '!w-20 !h-20' },
    'beauty': { image: '/assets/images/categories/beauty.png', bgColor: 'bg-red-100', hoverColor: 'hover:bg-red-200', imageSize: 'w-20 h-20' },
    'mask': { image: '/assets/images/categories/mask.png', bgColor: 'bg-amber-50', hoverColor: 'hover:bg-amber-100', imageSize: '!w-20 !h-20' },
    'default': { image: '/placeholder.jpg', bgColor: 'bg-gray-100', hoverColor: 'hover:bg-gray-200', imageSize: 'w-16 h-16' }
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);
    const [cache, setCache] = useState(new Map());

    // State for sales data
    const [salesData, setSalesData] = useState([]);
    const [loadingSales, setLoadingSales] = useState(true);
    const [errorSales, setErrorSales] = useState(null);

    const categories = useMemo(() => {
        if (products.length === 0) return [];
        const categoryCounts = products.reduce((acc, product) => {
            const categoryName = product.category || 'Uncategorized';
            acc[categoryName] = (acc[categoryName] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(categoryCounts).map(([name, count], index) => {
            const normalizedName = name.toLowerCase();
            const visuals = categoryVisuals[normalizedName] || categoryVisuals.default;
            return { id: index + 1, name, productCount: count, path: `/shop?category=${encodeURIComponent(name)}`, ...visuals };
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
            const errorMessage = err.message || 'Failed to load products';
            setError(errorMessage);
            return products.length > 0 ? products : [];
        } finally {
            setLoading(false);
        }
    }, [products, needsRefresh]);

    const fetchSales = useCallback(async () => {
        setLoadingSales(true);
        setErrorSales(null);
        try {
            const response = await salesService.fetchSales();
            
            if (response && response.code === 200) {
                let salesArray = [];
                if (response.sales) {
                    if (Array.isArray(response.sales)) {
                        salesArray = response.sales;
                    } else if (typeof response.sales === 'object') {
                        salesArray = Object.values(response.sales);
                    }
                }
                
                setSalesData(salesArray);
            } else {
                throw new Error(response?.message || 'Invalid sales response format');
            }
        } catch (err) {
            const errorMessage = err.message || 'Failed to load sales data';
            setErrorSales(errorMessage);
            setSalesData([]);
        } finally {
            setLoadingSales(false);
        }
    }, []);

    const getProductById = useCallback(async (productId) => {
        if (!productId || productId === 'undefined') return null;
        
        // Check cache first
        if (cache.has(productId)) {
            const cached = cache.get(productId);
            const cacheAge = Date.now() - cached.timestamp;
            const fiveMinutes = 5 * 60 * 1000;
            if (cacheAge < fiveMinutes) {
                return cached.product;
            }
        }
        
        // Check existing products array
        const cachedProduct = products.find(p => p.product_id === productId);
        if (cachedProduct) {
            return cachedProduct;
        }
        
        // Fetch from API
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
        } catch (err) {
            const errorMessage = err.message || 'Failed to load product details';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, [products, cache]);

    const refreshProducts = useCallback(() => {
        return fetchAllProducts({}, true);
    }, [fetchAllProducts]);

    // Calculate best sellers function
    const calculateBestSellers = useCallback((options = {}) => {
        const { days = 30, limit = 8 } = options;

        if (!salesData || salesData.length === 0) {
            return [];
        }

        if (!products || products.length === 0) {
            return [];
        }

        try {
            const now = new Date();
            const timeLimit = new Date();
            timeLimit.setDate(now.getDate() - days);

            // Filter recent sales
            const recentSales = salesData.filter(sale => {
                const dateStr = sale.created_at || sale.sale_date || sale.date || sale.created_date;
                if (!dateStr) {
                    return false;
                }
                
                const saleDate = new Date(dateStr);
                const isValidDate = !isNaN(saleDate.getTime());
                const isRecent = saleDate >= timeLimit;
                
                return isValidDate && isRecent;
            });

            // Use all sales as fallback if no recent sales
            const salesToProcess = recentSales.length > 0 ? recentSales : salesData;

            // Calculate product sales quantities
            const productSales = salesToProcess.reduce((acc, sale) => {
                try {
                    // Handle direct sale structure
                    if (sale.product_id && sale.sale_quantity) {
                        const productId = sale.product_id;
                        const quantity = parseInt(sale.sale_quantity, 10) || 0;
                        
                        if (productId && quantity > 0) {
                            acc[productId] = (acc[productId] || 0) + quantity;
                            return acc;
                        }
                    }

                    // Handle cart_obj structure
                    let cartItems = [];
                    
                    if (typeof sale.cart_obj === 'string') {
                        try {
                            cartItems = JSON.parse(sale.cart_obj);
                        } catch (parseError) {
                            return acc;
                        }
                    } else if (Array.isArray(sale.cart_obj)) {
                        cartItems = sale.cart_obj;
                    } else if (sale.cart_obj && typeof sale.cart_obj === 'object') {
                        if (sale.cart_obj.items) {
                            cartItems = sale.cart_obj.items;
                        } else if (sale.cart_obj.products) {
                            cartItems = sale.cart_obj.products;
                        } else {
                            cartItems = [sale.cart_obj];
                        }
                    }

                    // Process cart items
                    if (Array.isArray(cartItems) && cartItems.length > 0) {
                        cartItems.forEach(item => {
                            const productId = item.product_id || item.productId || item.id || item.product;
                            const quantity = parseInt(
                                item.ordered_quantity || 
                                item.quantity || 
                                item.qty || 
                                item.amount || 
                                item.count || 
                                1, 
                                10
                            ) || 0;
                            
                            if (productId && quantity > 0) {
                                acc[productId] = (acc[productId] || 0) + quantity;
                            }
                        });
                    }
                } catch (parseError) {
                    // Silent error handling
                }
                return acc;
            }, {});

            // Sort and limit products
            const sortedProducts = Object.entries(productSales)
                .sort(([, a], [, b]) => b - a)
                .slice(0, limit)
                .map(([productId, quantitySold]) => ({
                    product_id: productId,
                    quantitySold
                }));

            // Merge with product details
            const mergedBestSellers = sortedProducts
                .map(soldProduct => {
                    const productDetails = products.find(p => p.product_id === soldProduct.product_id);
                    if (productDetails) {
                        return { ...productDetails, ...soldProduct };
                    }
                    return null;
                })
                .filter(Boolean);
            
            return mergedBestSellers;

        } catch (error) {
            return [];
        }
    }, [salesData, products]);

    // Initialize data on mount
    useEffect(() => {
        fetchAllProducts();
        fetchSales();
    }, [fetchAllProducts, fetchSales]);

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
        // Sales and Best Seller related values
        salesData,
        loadingSales,
        errorSales,
        calculateBestSellers,
        // Additional helper functions
        refreshSales: fetchSales,
        clearSalesError: () => setErrorSales(null)
    }), [
        products, loading, error, categories, fetchAllProducts, getProductById,
        refreshProducts, clearError, salesData, loadingSales, errorSales, 
        calculateBestSellers, fetchSales
    ]);

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};