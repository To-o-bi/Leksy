import React, { useState, useEffect } from 'react';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../hooks/useCart'; 
import { ShoppingCart } from 'lucide-react';

const SkeletonLoader = () => (
    <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
);

const TrendingNow = () => {
    const { calculateBestSellers, salesData, loadingSales, products } = useProducts();
    const { addToCart } = useCart();
    const [trendingProducts, setTrendingProducts] = useState([]);

    useEffect(() => {
        if (salesData.length > 0 && products.length > 0) {
            const trending = calculateBestSellers({ days: 7, limit: 4 });
            setTrendingProducts(trending);
        }
    }, [salesData, products, calculateBestSellers]);

    const formatPrice = (price) => {
        if (!price) return '₦0.00';
        return '₦' + parseFloat(price).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return (
        <section className="bg-white py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Trending Now</h2>
                    <p className="text-gray-600 mt-2">Check out what's hot this week.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loadingSales && trendingProducts.length === 0 ? (
                        Array.from({ length: 4 }).map((_, index) => <SkeletonLoader key={index} />)
                    ) : trendingProducts.length > 0 ? (
                        trendingProducts.map(product => (
                            <div key={product.product_id} className="bg-white rounded-lg shadow-md overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300">
                                <a href={`/product/${product.product_id}`} className="block">
                                    <div className="relative">
                                        <img
                                            src={product.images?.[0] || 'https://placehold.co/400x400/F3F4F6/6B7280?text=Product'}
                                            alt={product.name}
                                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            Sold: {product.quantitySold}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-md font-semibold text-gray-800 truncate" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-lg font-bold text-green-600">{formatPrice(product.price)}</span>
                                            {product.slashed_price && (
                                                <span className="text-sm text-gray-400 line-through">{formatPrice(product.slashed_price)}</span>
                                            )}
                                        </div>
                                    </div>
                                </a>
                                <div className="p-4 pt-0">
                                     <button 
                                        onClick={() => addToCart(product)}
                                        className="w-full bg-gray-800 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                                     >
                                        <ShoppingCart size={16} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                             <p className="text-gray-500">No trending products found for this week.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TrendingNow;


