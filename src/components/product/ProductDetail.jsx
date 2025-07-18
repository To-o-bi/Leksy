import React, { useState, useContext, useMemo } from 'react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatter } from '../../utils/formatter'; // <-- Use the central formatter
import Notification from '../common/Notification'; // Assuming this component exists

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
    const [notification, setNotification] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);

    const { wishlist, toggleWishlistItem, isInWishlist } = useWishlist();

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
    }, [wishlist, normalizedProduct, isInWishlist]);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    // --- Quantity Control Logic ---
    const incrementQuantity = () => {
        const stock = normalizedProduct.stock;
        if (quantity < stock) {
            setQuantity(q => q + 1);
        } else {
            showNotification('warning', `Oops! Only ${stock} pieces are left.`);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(q => q - 1);
        }
    };

    const handleQuantityInputChange = (e) => {
        const value = parseInt(e.target.value, 10);
        const stock = normalizedProduct.stock;
        if (isNaN(value) || value < 1) {
            setQuantity(1);
        } else if (value > stock) {
            setQuantity(stock);
            showNotification('warning', `Oops! Only ${stock} pieces are left.`);
        } else {
            setQuantity(value);
        }
    };
    // --- End of Quantity Logic ---

    const handleAddToCart = () => {
        if (normalizedProduct.stock < 1) return;
        addToCart(normalizedProduct, quantity);
        showNotification('success', `${quantity} x ${normalizedProduct.name} added to cart!`);
    };

    const handleCheckoutNow = () => {
        if (normalizedProduct.stock < 1) return;
        addToCart(normalizedProduct, quantity);
        navigate('/checkout');
    };

    const handleToggleWishlist = () => {
        toggleWishlistItem(normalizedProduct);
        // Notification message is handled by the context now
    };
    
    if (!normalizedProduct) {
        return <div className="p-8 text-center">Product data not available.</div>;
    }

    return (
        <div className="bg-white">
            {notification && (
                <div className="fixed top-5 right-5 z-50">
                    <Notification 
                        type={notification.type} 
                        message={notification.message} 
                        onClose={() => setNotification(null)} 
                    />
                </div>
            )}
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Images */}
                    <div>
                        <div className="mb-4 relative bg-gray-100 rounded-lg overflow-hidden shadow-sm aspect-square">
                            <img 
                                src={normalizedProduct.images[selectedImage]}
                                alt={normalizedProduct.name} 
                                className="w-full h-full object-cover"
                            />
                            {normalizedProduct.discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-sm">-{normalizedProduct.discount}%</div>
                            )}
                        </div>
                        
                        {normalizedProduct.images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {normalizedProduct.images.map((image, index) => (
                                    <div 
                                        key={index} 
                                        className={`border rounded-md overflow-hidden cursor-pointer transition-all aspect-square ${selectedImage === index ? 'border-pink-500 border-2' : 'border-gray-200 hover:border-gray-400'}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={image} alt={`${normalizedProduct.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Product Information */}
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{normalizedProduct.name}</h1>
                        
                        <div className="flex items-center space-x-3 mb-4">
                            <span className="text-3xl font-bold text-gray-900">{formatter.formatCurrency(normalizedProduct.price)}</span>
                            {normalizedProduct.originalPrice && (
                                <span className="text-xl text-gray-400 line-through">{formatter.formatCurrency(normalizedProduct.originalPrice)}</span>
                            )}
                        </div>

                        <div className="flex items-center mb-6">
                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${normalizedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-sm font-medium">
                                {normalizedProduct.stock > 0 
                                    ? (normalizedProduct.stock <= 5 ? `Only ${normalizedProduct.stock} left in stock` : 'In Stock') 
                                    : 'Out of Stock'}
                            </span>
                        </div>
                        
                        {normalizedProduct.description && (
                            <p className="text-gray-600 mb-6 leading-relaxed">{normalizedProduct.description}</p>
                        )}
                        
                        {normalizedProduct.stock > 0 && (
                            <div className="flex items-center mb-6">
                                <span className="mr-4 text-sm font-medium text-gray-700">Quantity:</span>
                                <div className="flex border border-gray-300 rounded-md">
                                    <button onClick={decrementQuantity} className="px-3 py-1.5 border-r text-lg hover:bg-gray-100 disabled:opacity-50" disabled={quantity <= 1}>-</button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={handleQuantityInputChange}
                                        className="w-12 text-center focus:outline-none"
                                        min="1"
                                        max={normalizedProduct.stock}
                                    />
                                    <button onClick={incrementQuantity} className="px-3 py-1.5 border-l text-lg hover:bg-gray-100 disabled:opacity-50" disabled={quantity >= normalizedProduct.stock}>+</button>
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <button
                                className="bg-pink-500 hover:bg-pink-600 text-white py-3 px-6 rounded-md font-semibold w-full transition disabled:bg-gray-400"
                                onClick={handleAddToCart}
                                disabled={normalizedProduct.stock <= 0}
                            >
                                Add To Cart
                            </button>
                            <button
                                className="bg-gray-800 hover:bg-gray-900 text-white py-3 px-6 rounded-md font-semibold w-full transition disabled:bg-gray-400"
                                onClick={handleCheckoutNow}
                                disabled={normalizedProduct.stock <= 0}
                            >
                                Buy Now
                            </button>
                        </div>
                        <button 
                            className={`w-full flex items-center justify-center rounded-md p-3 border transition-colors ${isProductInWishlist ? 'bg-pink-50 text-pink-500 border-pink-200' : 'bg-white hover:bg-gray-100 border-gray-300'}`}
                            onClick={handleToggleWishlist}
                            aria-label={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill={isProductInWishlist ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            {isProductInWishlist ? 'Added to Wishlist' : 'Add to Wishlist'}
                        </button>
                    
                        {normalizedProduct.benefits.length > 0 && (
                            <div className="pt-6 mt-6 border-t border-gray-200">
                                <h3 className="text-md font-semibold mb-3 text-gray-700">Good For:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {normalizedProduct.benefits.map((benefit, index) => (
                                        <span key={index} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
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
