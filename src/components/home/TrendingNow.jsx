import React, { useState, useEffect } from 'react';
import { useProducts } from '../../contexts/ProductContext';
import { TrendingUp, AlertCircle } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';


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
            <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Trending Products</h3>
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

const TrendingNow = () => {
    const { 
        calculateBestSellers, 
        salesData, 
        loadingSales, 
        products, 
        loading,
        errorSales,
        refreshSales
    } = useProducts();
    
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        if (!loadingSales && !loading && salesData.length > 0 && products.length > 0) {
            setIsCalculating(true);
            try {
                // Get trending products for the last 7 days (shorter period for "trending")
                const trending = calculateBestSellers({ days: 7, limit: 4 });
                // No badges needed - clean minimal look
                setTrendingProducts(trending);
            } catch (error) {
                // Log error for debugging but don't expose to user
                if (process.env.NODE_ENV === 'development') {
                }
                setTrendingProducts([]);
            } finally {
                setIsCalculating(false);
            }
        } else if (!loadingSales && !loading && (salesData.length === 0 || products.length === 0)) {
            setTrendingProducts([]);
        }
    }, [salesData, products, calculateBestSellers, loadingSales, loading]);

    const isLoading = loadingSales || loading || isCalculating;
    const hasError = errorSales;
    const hasNoData = !isLoading && !hasError && trendingProducts.length === 0;
    
    // Hide the entire section if there are no sales data at all
    const shouldHideSection = !isLoading && !hasError && salesData.length === 0;

    // Don't render anything if we should hide the section
    if (shouldHideSection) {
        return null;
    }

    return (
        <section className="bg-white py-12 md:py-16">
            <div className="container mx-auto px-1 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Trending Now</h2>
                    <div className="flex justify-center items-center mt-3 sm:mt-4">
                        <div className="w-3 h-1 bg-pink-200 rounded"></div>
                        <div className="w-6 sm:w-8 h-1 bg-gradient-to-r from-pink-500 to-pink-500 rounded mx-1"></div>
                        <div className="w-3 h-1 bg-pink-200 rounded"></div>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base mt-3">Discover what everyone's loving right now</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <SkeletonLoader key={`trending-skeleton-${index}`} />
                        ))
                    ) : hasError ? (
                        <ErrorMessage 
                            message={errorSales}
                            onRetry={refreshSales}
                        />
                    ) : (
                        // The calculateBestSellers function already has fallback logic
                        // It will show all-time best sellers if no recent sales found
                        // If trendingProducts is empty here, it means no sales data exists at all
                        // and the section will be hidden by the shouldHideSection check above
                        trendingProducts.map(product => (
                            <ProductCard 
                                key={product.product_id || product.id} 
                                product={product} 
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default TrendingNow;