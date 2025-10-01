import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useMessage } from '../../contexts/MessageContext';
import { formatter } from '../../utils/formatter';

/**
 * Decodes HTML entities that might come from the API
 * @param {string} text - Text containing HTML entities
 * @returns {string} Decoded text
 */
const decodeHtmlEntities = (text) => {
    if (!text || typeof text !== 'string') return text;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
};

/**
 * ProductDetail component for displaying product information and purchase options
 * @param {Object} product - Product data object
 */
const ProductDetail = ({ product, loading = false }) => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [componentReady, setComponentReady] = useState(false);

    const { toggleWishlistItem, isInWishlist } = useWishlist();
    const { warning } = useMessage();

    const normalizedProduct = useMemo(() => {
        if (!product) return null;
        
        const price = parseFloat(product.price) || 0;
        const category = (product.category || '').toLowerCase();
        
        // Get concern_options and handle various formats
        let rawBenefits = product.concern_options || [];
        
        // If it's a string, try to parse it
        if (typeof rawBenefits === 'string') {
            // Handle "others" string case
            if (rawBenefits.toLowerCase().trim() === 'others' || rawBenefits.trim() === '') {
                rawBenefits = [];
            } else {
                try {
                    rawBenefits = JSON.parse(rawBenefits);
                } catch (e) {
                    rawBenefits = rawBenefits.split(',').map(b => b.trim()).filter(Boolean);
                }
            }
        }
        
        // Filter out "others" from the array
        let benefits = Array.isArray(rawBenefits) 
            ? rawBenefits.filter(b => b && b.toLowerCase() !== 'others')
            : [];
        
        // Add category-specific benefits if no valid concerns exist
        if (benefits.length === 0) {
            if (category === 'perfume') {
                benefits = ['Luxurious Fragrance'];
            } else if (category === 'beauty') {
                benefits = ['Enhances Natural Beauty'];
            }
        }

        return {
            ...product,
            product_id: product.product_id || product.id,
            name: decodeHtmlEntities(product.name || 'Unknown Product'),
            price: price,
            description: decodeHtmlEntities(product.description || ''),
            images: product.images?.length > 0 ? product.images : ['https://placehold.co/600x600/f7f7f7/ccc?text=Product'],
            category: decodeHtmlEntities(product.category || 'Uncategorized'),
            stock: parseInt(product.available_qty, 10) || 0,
            benefits: benefits,
        };
    }, [product]);

    // Effect to handle component readiness and transition end
    useEffect(() => {
        if (normalizedProduct && !loading) {
            // Small delay to ensure DOM is fully rendered
            const timer = setTimeout(() => {
                setComponentReady(true);
            }, 200);
            
            return () => clearTimeout(timer);
        }
    }, [normalizedProduct, loading]);

    // Handle images loading for better UX
    useEffect(() => {
        if (normalizedProduct?.images?.length > 0 && componentReady) {
            const imagePromises = normalizedProduct.images.map(imageSrc => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = resolve; // Still resolve on error
                    img.src = imageSrc;
                });
            });

            Promise.all(imagePromises).then(() => {
                // All images loaded - component is truly ready
            });
        }
    }, [normalizedProduct, componentReady]);

    // Memoize the wishlist status check
    const isProductInWishlist = useMemo(() => {
        if (!normalizedProduct?.product_id) return false;
        return isInWishlist(normalizedProduct.product_id);
    }, [isInWishlist, normalizedProduct]);

    /**
     * Increment quantity with stock validation
     */
    const incrementQuantity = () => {
        const stock = normalizedProduct.stock;
        const currentQuantity = Number(quantity) || 0;
        if (currentQuantity < stock) {
            setQuantity(currentQuantity + 1);
        } else {
            warning(`Only ${stock} pieces available in stock.`);
        }
    };

    /**
     * Decrement quantity with minimum validation
     */
    const decrementQuantity = () => {
        const currentQuantity = Number(quantity) || 1;
        if (currentQuantity > 1) {
            setQuantity(currentQuantity - 1);
        }
    };

    /**
     * Handle direct quantity input changes
     * @param {Event} e - Input change event
     */
    const handleQuantityInputChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            const num = value === '' ? '' : parseInt(value, 10);
            const stock = normalizedProduct.stock;

            if (num > stock) {
                setQuantity(stock);
                warning(`Only ${stock} pieces available in stock.`);
            } else {
                setQuantity(num);
            }
        }
    };
    
    /**
     * Handle quantity input blur event
     */
    const handleQuantityInputBlur = () => {
        if (quantity === '' || Number(quantity) < 1) {
            setQuantity(1);
        }
    };

    /**
     * Add product to cart with current quantity
     */
    const handleAddToCart = () => {
        if (normalizedProduct.stock < 1) return;
        const quantityToAdd = Number(quantity) || 1;
        addToCart(normalizedProduct, quantityToAdd);
    };

    /**
     * Add to cart and navigate to checkout
     */
    const handleCheckoutNow = () => {
        if (normalizedProduct.stock < 1) return;
        const quantityToAdd = Number(quantity) || 1;
        addToCart(normalizedProduct, quantityToAdd);
        navigate('/checkout');
    };

    /**
     * Toggle wishlist status
     */
    const handleToggleWishlist = () => {
        toggleWishlistItem(normalizedProduct);
    };

    /**
     * Handle product sharing
     */
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: normalizedProduct.name,
                    text: `Check out this product: ${normalizedProduct.name}`,
                    url: window.location.href
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                // Could add a toast notification here for clipboard success
            }
        } catch (error) {
            // Silently handle share/clipboard errors
            console.warn('Share failed:', error);
        }
    };
    
    if (loading || !normalizedProduct) {
        return (
            <div className="bg-white min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button Skeleton */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6">
                        {/* Image Skeleton */}
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 bg-gray-200 rounded-xl animate-pulse" style={{ minHeight: '400px' }}></div>
                                <div className="ml-3 w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-6 gap-1.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-200 rounded-md animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Content Skeleton */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="flex items-baseline space-x-3">
                                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="w-14 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Handle back navigation
     */
    const handleGoBack = () => {
        // Try to go back in history first
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            // Fallback to shop page
            navigate('/shop');
        }
    };

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
                        aria-label="Go back to previous page"
                    >
                        <svg 
                            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium">Back to Shop</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 relative bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100" style={{ minHeight: '300px', maxHeight: '600px' }}>
                                <img 
                                    src={normalizedProduct.images[selectedImage]}
                                    alt={normalizedProduct.name} 
                                    className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                            {/* Share Button */}
                            <button 
                                className="ml-3 flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                                onClick={handleShare}
                                aria-label="Share product"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-5 w-5" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" 
                                    />
                                </svg>
                            </button>
                        </div>
                        
                        {normalizedProduct.images.length > 1 && (
                            <div className="grid grid-cols-6 gap-1.5">
                                {normalizedProduct.images.slice(0, 5).map((image, index) => (
                                    <button 
                                        key={index} 
                                        className={`relative border-2 rounded-md overflow-hidden transition-all duration-200 aspect-square focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 ${
                                            selectedImage === index 
                                                ? 'border-pink-500 shadow-md ring-2 ring-pink-200' 
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                        onClick={() => setSelectedImage(index)}
                                        aria-label={`View image ${index + 1} of ${normalizedProduct.name}`}
                                    >
                                        <img 
                                            src={image} 
                                            alt={`${normalizedProduct.name} view ${index + 1}`} 
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Product Information */}
                    <div className="space-y-6">
                        {/* Product Name and Category */}
                        <div className="space-y-2">
                            <div className="text-sm text-pink-600 font-medium uppercase tracking-wide">
                                {normalizedProduct.category}
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                {normalizedProduct.name}
                            </h1>
                        </div>
                        
                        {/* Pricing */}
                        <div className="flex items-baseline space-x-3">
                            <span className="text-3xl sm:text-4xl font-semibold text-pink-600">
                                {formatter.formatCurrency(normalizedProduct.price)}
                            </span>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                                normalizedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className={`text-sm font-medium ${
                                normalizedProduct.stock > 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                                {normalizedProduct.stock > 0 
                                    ? (normalizedProduct.stock <= 5 ? `Only ${normalizedProduct.stock} left in stock` : 'In Stock') 
                                    : 'Out of Stock'}
                            </span>
                        </div>
                        
                        {/* Description */}
                        {normalizedProduct.description && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                                <div className="text-gray-700 leading-relaxed text-base prose prose-sm max-w-none">
                                    <p>{normalizedProduct.description}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Quantity Selector */}
                        {normalizedProduct.stock > 0 && (
                            <div className="flex items-center space-x-4 py-4">
                                <label htmlFor="quantity-input" className="text-sm font-semibold text-gray-900">
                                    Quantity:
                                </label>
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button 
                                        onClick={decrementQuantity} 
                                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-300 focus:outline-none focus:bg-gray-100"
                                        disabled={Number(quantity) <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <input
                                        id="quantity-input"
                                        type="text"
                                        value={quantity}
                                        onChange={handleQuantityInputChange}
                                        onBlur={handleQuantityInputBlur}
                                        className="w-16 text-center py-2 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        min="1"
                                        max={normalizedProduct.stock}
                                        aria-label="Product quantity"
                                    />
                                    <button 
                                        onClick={incrementQuantity} 
                                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-300 focus:outline-none focus:bg-gray-100"
                                        disabled={Number(quantity) >= normalizedProduct.stock}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3.5 px-6 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                                onClick={handleAddToCart}
                                disabled={normalizedProduct.stock <= 0}
                            >
                                Add To Cart
                            </button>
                            <button
                                className="flex-1 bg-transparent border-2 border-pink-500 text-pink-500 hover:bg-pink-50 py-3.5 px-6 rounded-lg font-semibold transition-all duration-200 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                                onClick={handleCheckoutNow}
                                disabled={normalizedProduct.stock <= 0}
                            >
                                Buy Now
                            </button>
                            <button 
                                className={`flex items-center justify-center w-14 h-14 rounded-lg border-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    isProductInWishlist 
                                        ? 'bg-pink-50 text-pink-600 border-pink-200 shadow-sm focus:ring-pink-500' 
                                        : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 focus:ring-gray-500'
                                }`}
                                onClick={handleToggleWishlist}
                                aria-label={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-5 w-5" 
                                    fill={isProductInWishlist ? 'currentColor' : 'none'} 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                    />
                                </svg>
                            </button>
                        </div>
                    
                        {/* Benefits/Tags */}
                        {normalizedProduct.benefits.length > 0 && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfect For:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {normalizedProduct.benefits.map((benefit, index) => (
                                        <span 
                                            key={index} 
                                            className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors"
                                        >
                                            {decodeHtmlEntities(benefit)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;