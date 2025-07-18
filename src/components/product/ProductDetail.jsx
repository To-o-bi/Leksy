import React, { useState, useMemo } from 'react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useMessage } from '../../contexts/MessageContext'; // Import the global message hook
import { formatter } from '../../utils/formatter';

// Helper function to decode HTML entities that might come from the API
const decodeHtmlEntities = (text) => {
    if (!text || typeof text !== 'string') return text;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
};

const ProductDetail = ({ product }) => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const { toggleWishlistItem, isInWishlist } = useWishlist();
    const { warning } = useMessage(); // Use the global message hook

    // Memoize the normalized product data for performance and consistency
    const normalizedProduct = useMemo(() => {
        if (!product) return null;
        
        const price = parseFloat(product.price) || 0;
        const originalPrice = product.slashed_price ? parseFloat(product.slashed_price) : null;
        const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

        return {
            ...product,
            product_id: product.product_id || product.id,
            name: decodeHtmlEntities(product.name || 'Unknown Product'),
            price: price,
            originalPrice: originalPrice,
            description: decodeHtmlEntities(product.description || ''),
            images: product.images?.length > 0 ? product.images : ['https://placehold.co/600x600/f7f7f7/ccc?text=Product'],
            category: decodeHtmlEntities(product.category || 'Uncategorized'),
            stock: parseInt(product.available_qty, 10) || 0,
            benefits: product.concern_options || [],
            discount: discount
        };
    }, [product]);

    // Memoize the wishlist status check
    const isProductInWishlist = useMemo(() => {
        if (!normalizedProduct?.product_id) return false;
        return isInWishlist(normalizedProduct.product_id);
    }, [isInWishlist, normalizedProduct]);

    // --- Refined Quantity Control Logic ---
    const incrementQuantity = () => {
        const stock = normalizedProduct.stock;
        // Coerce quantity to a number before incrementing
        const currentQuantity = Number(quantity) || 0;
        if (currentQuantity < stock) {
            setQuantity(currentQuantity + 1);
        } else {
            warning(`Oops! Only ${stock} pieces are left.`);
        }
    };

    const decrementQuantity = () => {
        // Coerce quantity to a number before decrementing
        const currentQuantity = Number(quantity) || 1;
        if (currentQuantity > 1) {
            setQuantity(currentQuantity - 1);
        }
    };

    const handleQuantityInputChange = (e) => {
        const value = e.target.value;
        // Allow only digits or an empty string to be typed
        if (value === '' || /^\d+$/.test(value)) {
            const num = value === '' ? '' : parseInt(value, 10);
            const stock = normalizedProduct.stock;

            if (num > stock) {
                setQuantity(stock);
                warning(`Oops! Only ${stock} pieces are left.`);
            } else {
                setQuantity(num);
            }
        }
    };
    
    const handleQuantityInputBlur = () => {
        // On blur, if the input is empty or invalid, reset it to 1.
        if (quantity === '' || Number(quantity) < 1) {
            setQuantity(1);
        }
    };
    // --- End of Refined Quantity Logic ---

    const handleAddToCart = () => {
        if (normalizedProduct.stock < 1) return;
        // Ensure we add a valid number to the cart, defaulting to 1 if input is invalid.
        const quantityToAdd = Number(quantity) || 1;
        addToCart(normalizedProduct, quantityToAdd);
    };

    const handleCheckoutNow = () => {
        if (normalizedProduct.stock < 1) return;
        const quantityToAdd = Number(quantity) || 1;
        addToCart(normalizedProduct, quantityToAdd);
        navigate('/checkout');
    };

    const handleToggleWishlist = () => {
        toggleWishlistItem(normalizedProduct);
        // The WishlistContext now handles showing the notification
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: normalizedProduct.name,
                text: `Check out this product: ${normalizedProduct.name}`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            // You can add a toast notification here if needed
        }
    };
    
    if (!normalizedProduct) {
        return <div className="p-8 text-center">Product data not available.</div>;
    }

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 relative bg-gray-50 rounded-xl overflow-hidden shadow-lg border border-gray-100" style={{ aspectRatio: '4/3', maxHeight: '400px' }}>
                                <img 
                                    src={normalizedProduct.images[selectedImage]}
                                    alt={normalizedProduct.name} 
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                                {normalizedProduct.discount > 0 && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md">
                                        -{normalizedProduct.discount}%
                                    </div>
                                )}
                            </div>
                            {/* Share Icon positioned beside the image */}
                            <button 
                                className="ml-3 flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md"
                                onClick={handleShare}
                                aria-label="Share product"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-5 w-5" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" 
                                    />
                                </svg>
                            </button>
                        </div>
                        
                        {normalizedProduct.images.length > 1 && (
                            <div className="grid grid-cols-6 gap-1.5">
                                {normalizedProduct.images.slice(0, 5).map((image, index) => (
                                    <div 
                                        key={index} 
                                        className={`relative border-2 rounded-md overflow-hidden cursor-pointer transition-all duration-200 aspect-square ${
                                            selectedImage === index 
                                                ? 'border-pink-500 shadow-md ring-2 ring-pink-200' 
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img 
                                            src={image} 
                                            alt={`${normalizedProduct.name} thumbnail ${index + 1}`} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Product Information */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                {normalizedProduct.name}
                            </h1>
                            
                            <div className="flex items-baseline space-x-3">
                                <span className="text-4xl font-bold text-gray-900">
                                    {formatter.formatCurrency(normalizedProduct.price)}
                                </span>
                                {normalizedProduct.originalPrice && (
                                    <span className="text-xl text-gray-500 line-through">
                                        {formatter.formatCurrency(normalizedProduct.originalPrice)}
                                    </span>
                                )}
                            </div>
                        </div>

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
                        
                        {normalizedProduct.description && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                                <p className="text-gray-700 leading-relaxed text-base">
                                    {normalizedProduct.description}
                                </p>
                            </div>
                        )}
                        
                        {normalizedProduct.stock > 0 && (
                            <div className="flex items-center space-x-4 py-4">
                                <label className="text-sm font-semibold text-gray-900">Quantity:</label>
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button 
                                        onClick={decrementQuantity} 
                                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-300"
                                        disabled={Number(quantity) <= 1}
                                    >
                                        −
                                    </button>
                                    <input
                                        type="text"
                                        value={quantity}
                                        onChange={handleQuantityInputChange}
                                        onBlur={handleQuantityInputBlur}
                                        className="w-16 text-center py-2 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        min="1"
                                        max={normalizedProduct.stock}
                                    />
                                    <button 
                                        onClick={incrementQuantity} 
                                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-300"
                                        disabled={Number(quantity) >= normalizedProduct.stock}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            <button
                                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3.5 px-6 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                onClick={handleAddToCart}
                                disabled={normalizedProduct.stock <= 0}
                            >
                                Add To Cart
                            </button>
                            <button
                                className="flex-1 bg-transparent border-2 border-pink-500 text-pink-500 hover:bg-pink-50 py-3.5 px-6 rounded-lg font-semibold transition-all duration-200 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed hover:shadow-md"
                                onClick={handleCheckoutNow}
                                disabled={normalizedProduct.stock <= 0}
                            >
                                Checkout Now
                            </button>
                            <button 
                                className={`flex items-center justify-center w-14 h-14 rounded-lg border-2 font-medium transition-all duration-200 ${
                                    isProductInWishlist 
                                        ? 'bg-pink-50 text-pink-600 border-pink-200 shadow-sm' 
                                        : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
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
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                    />
                                </svg>
                            </button>
                        </div>
                    
                        {normalizedProduct.benefits.length > 0 && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Good For:</h3>
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