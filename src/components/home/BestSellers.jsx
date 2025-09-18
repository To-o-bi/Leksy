import React, { useState, useEffect } from 'react';
import { useProducts } from '../../contexts/ProductContext';
import { ShoppingCart } from 'lucide-react'; // Example icon

// Loader component for showing loading state
const SkeletonLoader = () => (
    <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
);

const BestSellers = () => {
    const { bestSellers, calculateBestSellers, salesData, loadingSales, products } = useProducts();
    const [timePeriod, setTimePeriod] = useState(30); // Default to last 30 days
    const [productLimit, setProductLimit] = useState(8); // Default to show 8 products

    useEffect(() => {
        // Calculate best sellers when sales data or products are loaded/updated, or when filters change
        if (salesData.length > 0 && products.length > 0) {
            calculateBestSellers({ days: timePeriod, limit: productLimit });
        }
    }, [salesData, products, timePeriod, productLimit, calculateBestSellers]);

    const handleTimePeriodChange = (days) => {
        setTimePeriod(days);
    };

    const formatPrice = (price) => {
        if (!price) return '₦0.00';
        return '₦' + parseFloat(price).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return (
        <section className="bg-gray-50 py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Our Best Sellers</h2>
                    <p className="text-gray-600 mt-2">Top picks from our valued customers.</p>
                </div>

                {/* Filter buttons */}
                <div className="flex justify-center gap-2 mb-10">
                    <button
                        onClick={() => handleTimePeriodChange(7)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${timePeriod === 7 ? 'bg-pink-500 text-white shadow' : 'bg-white text-gray-700 hover:bg-pink-50'}`}
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => handleTimePeriodChange(30)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${timePeriod === 30 ? 'bg-pink-500 text-white shadow' : 'bg-white text-gray-700 hover:bg-pink-50'}`}
                    >
                        Last 30 Days
                    </button>
                    <button
                        onClick={() => handleTimePeriodChange(90)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${timePeriod === 90 ? 'bg-pink-500 text-white shadow' : 'bg-white text-gray-700 hover:bg-pink-50'}`}
                    >
                        Last 90 Days
                    </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loadingSales && bestSellers.length === 0 ? (
                        Array.from({ length: productLimit }).map((_, index) => <SkeletonLoader key={index} />)
                    ) : bestSellers.length > 0 ? (
                        bestSellers.map(product => (
                            <div key={product.product_id} className="bg-white rounded-lg shadow-md overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300">
                                <a href={`/product/${product.product_id}`} className="block">
                                    <div className="relative">
                                        <img
                                            src={product.images?.[0] || 'https://placehold.co/400x400/F3F4F6/6B7280?text=Product'}
                                            alt={product.name}
                                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            Sold: {product.quantitySold}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-md font-semibold text-gray-800 truncate" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-lg font-bold text-pink-600">{formatPrice(product.price)}</span>
                                            {product.slashed_price && (
                                                <span className="text-sm text-gray-400 line-through">{formatPrice(product.slashed_price)}</span>
                                            )}
                                        </div>
                                    </div>
                                </a>
                                <div className="p-4 pt-0">
                                     <button className="w-full bg-gray-800 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors">
                                        <ShoppingCart size={16} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                             <p className="text-gray-500">No best-selling products found for this period.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BestSellers;
