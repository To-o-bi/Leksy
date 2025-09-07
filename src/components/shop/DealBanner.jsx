// src/components/shop/DealBanner.js

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Tag, Sparkles } from 'lucide-react';

const DealBanner = ({ bestDealProduct, onShopNow }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        if (!bestDealProduct?.deal_end_date) return;

        const calculateTimeLeft = () => {
            const dealEndTime = new Date(bestDealProduct.deal_end_date).getTime();
            const now = new Date().getTime();
            const difference = dealEndTime - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [bestDealProduct]);

    if (!bestDealProduct || !bestDealProduct.deal_price || !bestDealProduct.deal_end_date) {
        return null;
    }

    const savings = bestDealProduct.price - bestDealProduct.deal_price;
    const savingsPercentage = Math.round((savings / bestDealProduct.price) * 100);
    const isExpiringSoon = timeLeft.days === 0 && timeLeft.hours < 24;

    const handleShopNow = () => {
        if (onShopNow) {
            onShopNow(bestDealProduct.product_id);
        }
    };

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl shadow-2xl mx-4 my-8">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 -left-16 w-24 h-24 bg-white opacity-10 rounded-full animate-bounce delay-1000"></div>
                <div className="absolute bottom-10 right-1/4 w-16 h-16 bg-white opacity-10 rounded-full animate-ping delay-2000"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 lg:p-12">
                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left mb-8 lg:mb-0 lg:mr-12">
                    <div className="flex items-center justify-center lg:justify-start mb-4">
                        <Sparkles className="w-6 h-6 text-yellow-300 mr-2" />
                        <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wide">
                            Best Deal
                        </span>
                    </div>

                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                        Flash Sale
                    </h2>

                    <p className="text-xl lg:text-2xl text-pink-100 mb-6">
                        {bestDealProduct.name}
                    </p>

                    {/* Price Section */}
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                        <span className="text-3xl lg:text-4xl font-bold text-white">
                            ₦{bestDealProduct.deal_price?.toLocaleString()}
                        </span>
                        <span className="text-xl lg:text-2xl text-pink-200 line-through">
                            ₦{bestDealProduct.price?.toLocaleString()}
                        </span>
                        <div className="bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-sm">
                            {savingsPercentage}% OFF
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="flex items-center justify-center lg:justify-start gap-6 mb-8">
                        <div className="flex items-center text-white">
                            <Clock className="w-5 h-5 mr-2" />
                            <span className="font-semibold">Ends in:</span>
                        </div>
                        <div className="flex gap-2">
                            {Object.entries(timeLeft).map(([unit, value]) => (
                                <div key={unit} className="text-center">
                                    <div className={`bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px] ${
                                        isExpiringSoon ? 'animate-pulse bg-red-500' : ''
                                    }`}>
                                        <div className="text-2xl font-bold text-white">
                                            {value.toString().padStart(2, '0')}
                                        </div>
                                        <div className="text-xs uppercase text-pink-200">
                                            {unit}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleShopNow}
                        className="group bg-white text-purple-600 font-bold px-8 py-4 rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center lg:justify-start gap-2"
                    >
                        <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />
                        Shop Now
                    </button>
                </div>

                {/* Right Content - Product Image */}
                <div className="flex-shrink-0 relative">
                    <div className="relative bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl p-8 transform hover:scale-105 transition-transform duration-300">
                        {/* Product Image */}
                        <div className="w-64 h-64 lg:w-80 lg:h-80 relative overflow-hidden rounded-2xl bg-white shadow-2xl">
                            <img
                                src={bestDealProduct.images?.[0] || '/api/placeholder/320/320'}
                                alt={bestDealProduct.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                }}
                            />
                            
                            {/* Floating discount badge */}
                            <div className="absolute -top-3 -right-3 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg animate-bounce">
                                -{savingsPercentage}%
                            </div>
                        </div>

                        {/* Product info overlay */}
                        <div className="absolute -bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
                            <div className="text-center">
                                <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                                    {bestDealProduct.name}
                                </h3>
                                <div className="flex items-center justify-center gap-2">
                                    <Tag className="w-4 h-4 text-purple-500" />
                                    <span className="text-purple-600 text-sm font-medium">
                                        Save ₦{savings.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom highlight strip */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400"></div>
        </div>
    );
};

export default DealBanner;