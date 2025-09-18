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
            setError(err.message || 'Failed to load products');
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
            console.log('%c[ProductContext] Sales API Response:', 'color: #2196F3; font-weight: bold;', response);
            
            if (response && response.code === 200) {
                // Handle both array and object formats from your API
                let salesArray = [];
                if (response.sales) {
                    if (Array.isArray(response.sales)) {
                        salesArray = response.sales;
                    } else if (typeof response.sales === 'object') {
                        // If sales is an object, convert to array
                        salesArray = Object.values(response.sales);
                    }
                }
                
                console.log('%c[ProductContext] Processed Sales Data:', 'color: #4CAF50; font-weight: bold;', salesArray);
                setSalesData(salesArray);
            } else {
                throw new Error(response?.message || 'Invalid sales response format');
            }
        } catch (err) {
            console.error('%c[ProductContext] Sales Fetch Error:', 'color: #F44336; font-weight: bold;', err);
            setErrorSales(err.message || 'Failed to load sales data');
            setSalesData([]);
        } finally {
            setLoadingSales(false);
        }
    }, []);

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
        } catch (err) {
            setError(err.message || 'Failed to load product details');
            return null;
        } finally {
            setLoading(false);
        }
    }, [products, cache]);

    const refreshProducts = useCallback(() => {
        return fetchAllProducts({}, true);
    }, [fetchAllProducts]);

    // Enhanced calculateBestSellers function with better error handling
    const calculateBestSellers = useCallback((options = {}) => {
        const { days = 30, limit = 8 } = options;

        console.log('%c[ProductContext] calculateBestSellers called:', 'color: #FF9800; font-weight: bold;', {
            salesDataLength: salesData.length,
            productsLength: products.length,
            options
        });

        if (!salesData || salesData.length === 0) {
            console.warn('%c[ProductContext] No sales data available', 'color: #FF5722;');
            return [];
        }

        if (!products || products.length === 0) {
            console.warn('%c[ProductContext] No products data available', 'color: #FF5722;');
            return [];
        }

        try {
            const now = new Date();
            const timeLimit = new Date();
            timeLimit.setDate(now.getDate() - days);

            console.log('%c[ProductContext] Date filtering:', 'color: #9C27B0; font-weight: bold;', {
                now: now.toISOString(),
                timeLimit: timeLimit.toISOString(),
                daysBack: days
            });

            // Filter recent sales with better date handling
            const recentSales = salesData.filter(sale => {
                // Try different date field names that might exist in your API
                const dateStr = sale.created_at || sale.sale_date || sale.date || sale.created_date;
                if (!dateStr) {
                    console.warn('%c[ProductContext] Sale missing date field:', 'color: #FF5722;', sale);
                    return false;
                }
                
                const saleDate = new Date(dateStr);
                const isValidDate = !isNaN(saleDate.getTime());
                const isRecent = saleDate >= timeLimit;
                
                if (!isValidDate) {
                    console.warn('%c[ProductContext] Invalid date in sale:', 'color: #FF5722;', dateStr, sale);
                }
                
                return isValidDate && isRecent;
            });

            console.log('%c[ProductContext] Recent sales filtered:', 'color: #9C27B0; font-weight: bold;', {
                totalSales: salesData.length,
                recentSales: recentSales.length,
                timeLimit: timeLimit.toISOString(),
                sampleSaleDates: salesData.slice(0, 3).map(sale => ({
                    id: sale.id,
                    created_at: sale.created_at,
                    sale_date: sale.sale_date,
                    date: sale.date
                }))
            });

            // If no recent sales found, use all sales as fallback for testing
            const salesToProcess = recentSales.length > 0 ? recentSales : salesData;
            if (recentSales.length === 0 && salesData.length > 0) {
                console.log('%c[ProductContext] No recent sales found, using all sales as fallback', 'color: #FF9800;');
            }

            // Log sample cart objects after salesToProcess is defined
            console.log('%c[ProductContext] Sample cart objects:', 'color: #9C27B0; font-weight: bold;', 
                salesToProcess.slice(0, 2).map(sale => ({
                    id: sale.id,
                    cart_obj: sale.cart_obj,
                    cart_obj_type: typeof sale.cart_obj
                }))
            );

            // Calculate product sales quantities
            const productSales = salesToProcess.reduce((acc, sale) => {
                try {
                    console.log('%c[ProductContext] Processing sale:', 'color: #3F51B5;', {
                        id: sale.id,
                        product_id: sale.product_id,
                        sale_quantity: sale.sale_quantity,
                        cart_obj: sale.cart_obj,
                        cart_obj_type: typeof sale.cart_obj
                    });

                    // Handle direct sale structure (no cart_obj)
                    if (sale.product_id && sale.sale_quantity) {
                        const productId = sale.product_id;
                        const quantity = parseInt(sale.sale_quantity, 10) || 0;
                        
                        if (productId && quantity > 0) {
                            acc[productId] = (acc[productId] || 0) + quantity;
                            console.log('%c[ProductContext] Added direct sale:', 'color: #4CAF50;', { productId, quantity, total: acc[productId] });
                            return acc;
                        }
                    }

                    // Fallback to cart_obj parsing if direct fields don't exist
                    let cartItems = [];
                    
                    if (typeof sale.cart_obj === 'string') {
                        try {
                            cartItems = JSON.parse(sale.cart_obj);
                        } catch (parseError) {
                            console.warn('%c[ProductContext] JSON parse failed for cart_obj:', 'color: #FF5722;', parseError, sale.cart_obj);
                            return acc;
                        }
                    } else if (Array.isArray(sale.cart_obj)) {
                        cartItems = sale.cart_obj;
                    } else if (sale.cart_obj && typeof sale.cart_obj === 'object') {
                        // If it's an object, try different possible structures
                        if (sale.cart_obj.items) {
                            cartItems = sale.cart_obj.items;
                        } else if (sale.cart_obj.products) {
                            cartItems = sale.cart_obj.products;
                        } else {
                            // Treat the object itself as a single cart item
                            cartItems = [sale.cart_obj];
                        }
                    }

                    console.log('%c[ProductContext] Parsed cart items:', 'color: #9C27B0;', cartItems);

                    // Process cart items (if any exist)
                    if (Array.isArray(cartItems) && cartItems.length > 0) {
                        cartItems.forEach((item, index) => {
                            console.log('%c[ProductContext] Processing cart item:', 'color: #607D8B;', { index, item });
                            
                            // Try different possible field names for product ID
                            const productId = item.product_id || item.productId || item.id || item.product;
                            
                            // Try different possible field names for quantity
                            const quantity = parseInt(
                                item.ordered_quantity || 
                                item.quantity || 
                                item.qty || 
                                item.amount || 
                                item.count || 
                                1, 
                                10
                            ) || 0;
                            
                            console.log('%c[ProductContext] Extracted:', 'color: #795548;', { productId, quantity });
                            
                            if (productId && quantity > 0) {
                                acc[productId] = (acc[productId] || 0) + quantity;
                                console.log('%c[ProductContext] Added to sales:', 'color: #4CAF50;', { productId, quantity, total: acc[productId] });
                            } else {
                                console.warn('%c[ProductContext] Invalid item data:', 'color: #FF5722;', { productId, quantity, item });
                            }
                        });
                    } else {
                        console.warn('%c[ProductContext] No product_id or cart items found in sale:', 'color: #FF5722;', sale);
                    }
                } catch (parseError) {
                    console.warn('%c[ProductContext] Error processing sale:', 'color: #FF5722;', parseError, sale);
                }
                return acc;
            }, {});

            console.log('%c[ProductContext] Product sales calculated:', 'color: #673AB7; font-weight: bold;', productSales);

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
                    } else {
                        console.warn('%c[ProductContext] Product not found:', 'color: #FF5722;', soldProduct.product_id);
                        return null;
                    }
                })
                .filter(Boolean);

            console.log('%c[ProductContext] Final best sellers:', 'color: #4CAF50; font-weight: bold;', mergedBestSellers);
            return mergedBestSellers;

        } catch (error) {
            console.error('%c[ProductContext] Error in calculateBestSellers:', 'color: #F44336; font-weight: bold;', error);
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