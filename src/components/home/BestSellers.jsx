import React, { useState, useEffect } from 'react';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../hooks/useCart'; 
import { ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';

const SkeletonLoader = () => (
    <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
);

const ErrorMessage = ({ message, onRetry }) => (
    <div className="col-span-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Best Sellers</h3>
            <p className="text-red-600 mb-4">{message}</p>
            {onRetry && (
                <button 
                    onClick={onRetry}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    </div>
);

const BestSellers = () => {
    const { 
        calculateBestSellers, 
        salesData, 
        loadingSales, 
        products, 
        loading,
        errorSales,
        refreshSales
    } = useProducts();
    
    const { addToCart } = useCart();
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        console.log('%c[BestSellers] useEffect triggered:', 'color: #673AB7; font-weight: bold;', { 
            salesDataAvailable: salesData.length > 0,
            productsAvailable: products.length > 0,
            loadingSales,
            loading
        });

        if (!loadingSales && !loading && salesData.length > 0 && products.length > 0) {
            setIsCalculating(true);
            try {
                const bestSellers = calculateBestSellers({ days: 30, limit: 4 });
                console.log('%c[BestSellers] Calculated Best Sellers:', 'color: #E91E63; font-weight: bold;', bestSellers);
                setBestSellingProducts(bestSellers);
            } catch (error) {
                console.error('%c[BestSellers] Error calculating best sellers:', 'color: #F44336; font-weight: bold;', error);
                setBestSellingProducts([]);
            } finally {
                setIsCalculating(false);
            }
        } else if (!loadingSales && !loading && (salesData.length === 0 || products.length === 0)) {
            // Clear best sellers if no data available
            setBestSellingProducts([]);
        }
    }, [salesData, products, calculateBestSellers, loadingSales, loading]);

    const formatPrice = (price) => {
        if (!price) return '₦0.00';
        return '₦' + parseFloat(price).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const isLoading = loadingSales || loading || isCalculating;
    const hasError = errorSales;
    const hasNoData = !isLoading && !hasError && bestSellingProducts.length === 0;

    return (
        <section className="bg-gray-50 py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingUp className="h-8 w-8 text-pink-600" />
                        <h2 className="text-3xl font-bold text-gray-800">Our Best Sellers</h2>
                    </div>
                    <p className="text-gray-600">Top picks from our valued customers this month.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        // Show skeleton loaders while loading
                        Array.from({ length: 4 }).map((_, index) => (
                            <SkeletonLoader key={`skeleton-${index}`} />
                        ))
                    ) : hasError ? (
                        // Show error message
                        <ErrorMessage 
                            message={errorSales}
                            onRetry={refreshSales}
                        />
                    ) : hasNoData ? (
                        // Show no data message
                        <div className="col-span-full text-center py-12">
                            <div className="bg-white rounded-lg shadow-sm p-8">
                                <TrendingUp className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No Best Sellers Yet</h3>
                                <p className="text-gray-500">
                                    We haven't identified any best-selling products for this period. 
                                    Check back soon as sales data updates!
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Show best selling products
                        bestSellingProducts.map(product => (
                            <div 
                                key={product.product_id} 
                                className="bg-white rounded-lg shadow-md overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300"
                            >
                                <a href={`/product/${product.product_id}`} className="block">
                                    <div className="relative">
                                        <img
                                            src={product.images?.[0] || 'https://placehold.co/400x400/F3F4F6/6B7280?text=Product'}
                                            alt={product.name}
                                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                            🔥 {product.quantitySold} sold
                                        </div>
                                        {product.slashed_price && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                SALE
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-md font-semibold text-gray-800 truncate" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-lg font-bold text-pink-600">
                                                {formatPrice(product.price)}
                                            </span>
                                            {product.slashed_price && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    {formatPrice(product.slashed_price)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </a>
                                <div className="p-4 pt-0">
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-full bg-pink-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!product.available_qty || product.available_qty <= 0}
                                    >
                                        <ShoppingCart size={16} />
                                        {!product.available_qty || product.available_qty <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
                        <strong>Debug Info:</strong> 
                        Sales: {salesData.length}, 
                        Products: {products.length}, 
                        Best Sellers: {bestSellingProducts.length},
                        Loading Sales: {loadingSales ? 'Yes' : 'No'},
                        Loading Products: {loading ? 'Yes' : 'No'}
                    </div>
                )}
            </div>
        </section>
    );
};

export default BestSellers;