import React, { useState, useContext, useMemo } from 'react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { WishlistContext } from '../../contexts/WishlistContext';
import Notification from '../common/Notification';

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

    const { wishlist, toggleWishlistItem, isInWishlist } = useContext(WishlistContext);

    const normalizedProduct = useMemo(() => {
        if (!product) return null;
        
        const price = parseFloat(product.price) || 0;
        const originalPrice = product.slashed_price ? parseFloat(product.slashed_price) : null;
        const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

        return {
            product_id: product.product_id,
            name: decodeHtmlEntities(product.name || 'Unknown Product'),
            price: price,
            originalPrice: originalPrice,
            description: decodeHtmlEntities(product.description || ''),
            images: product.images?.length > 0 ? product.images : ['/placeholder.jpg'],
            category: decodeHtmlEntities(product.category || 'Uncategorized'),
            stock: parseInt(product.available_qty) || 0,
            benefits: product.concern_options || [],
            discount: discount
        };
    }, [product]);

    const isProductInWishlist = useMemo(() => {
        if (!normalizedProduct?.product_id || !wishlist) return false;
        return isInWishlist(normalizedProduct.product_id);
    }, [wishlist, normalizedProduct, isInWishlist]);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000); // Increased duration for important messages
    };

    // --- UPDATED LOGIC FOR QUANTITY ---
    const incrementQuantity = () => {
        const stock = normalizedProduct.stock;
        if (quantity < stock) {
            setQuantity(q => q + 1);
        } else {
            showNotification('warning', `Oops! Only ${stock} pieces are left. Secure the last items before it's sold out.`);
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
            setQuantity(stock); // Cap at max stock
            showNotification('warning', `Oops! Only ${stock} pieces are left. Secure the last items before it's sold out.`);
        } else {
            setQuantity(value);
        }
    };
    // --- END OF UPDATED LOGIC ---

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
        showNotification(isProductInWishlist ? 'info' : 'success', isProductInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    };
    
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
        }).format(price);
    };

    if (!normalizedProduct) {
        return <div>Product data not available.</div>;
    }

    return (
        <div className="bg-white">
            {notification && (
                <Notification 
                    type={notification.type} 
                    message={notification.message} 
                    onClose={() => setNotification(null)} 
                />
            )}
            
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div>
                        <div className="mb-4 relative bg-gray-50 rounded-lg overflow-hidden">
                            <img 
                                src={normalizedProduct.images[selectedImage]}
                                alt={normalizedProduct.name} 
                                className="w-full h-96 object-contain"
                            />
                            {normalizedProduct.discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded-sm">-{normalizedProduct.discount}%</div>
                            )}
                        </div>
                        
                        {normalizedProduct.images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {normalizedProduct.images.map((image, index) => (
                                    <div 
                                        key={index} 
                                        className={`border rounded-md overflow-hidden cursor-pointer transition-all ${selectedImage === index ? 'border-pink-500 border-2' : 'border-gray-200'}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={image} alt={`${normalizedProduct.name} ${index + 1}`} className="w-full h-16 object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Product Information */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">{normalizedProduct.name}</h1>
                        
                        <div className="flex items-center space-x-3 mb-4">
                            <span className="text-2xl font-bold text-gray-900">{formatPrice(normalizedProduct.price)}</span>
                            {normalizedProduct.originalPrice && (
                                <span className="text-lg text-gray-400 line-through">{formatPrice(normalizedProduct.originalPrice)}</span>
                            )}
                        </div>

                        <div className="flex items-center mb-6">
                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${normalizedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-sm">
                                {normalizedProduct.stock > 0 
                                    ? (normalizedProduct.stock <= 5 ? `Only ${normalizedProduct.stock} left in stock` : 'In Stock') 
                                    : 'Out of Stock'}
                            </span>
                        </div>
                        
                        {normalizedProduct.description && (
                            <p className="text-gray-600 mb-6">{normalizedProduct.description}</p>
                        )}
                        
                        {normalizedProduct.stock > 0 && (
                            <div className="flex items-center mb-6">
                                <span className="mr-3 text-sm font-medium">Quantity:</span>
                                <div className="flex border border-gray-300 rounded-md">
                                    <button onClick={decrementQuantity} className="px-3 py-1 border-r" disabled={quantity <= 1}>-</button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={handleQuantityInputChange}
                                        className="w-12 text-center focus:outline-none"
                                        min="1"
                                        max={normalizedProduct.stock}
                                    />
                                    <button onClick={incrementQuantity} className="px-3 py-1 border-l">+</button>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                className="bg-pink-500 hover:bg-pink-600 text-white py-3 px-6 rounded-md font-medium w-full transition disabled:bg-gray-400"
                                onClick={handleAddToCart}
                                disabled={normalizedProduct.stock <= 0}
                            >
                                Add To Cart
                            </button>
                            <button
                                className="bg-white hover:bg-gray-100 text-gray-800 py-3 px-6 rounded-md font-medium border border-gray-300 w-full transition disabled:bg-gray-100 disabled:text-gray-400"
                                onClick={handleCheckoutNow}
                                disabled={normalizedProduct.stock <= 0}
                            >
                                Checkout Now
                            </button>
                             <button 
                                className={`rounded-md p-3 shadow-md border transition-colors ${isProductInWishlist ? 'bg-pink-50 text-pink-500 border-pink-200' : 'bg-white hover:bg-gray-100 border-gray-300'}`}
                                onClick={handleToggleWishlist}
                                aria-label={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                {isProductInWishlist ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                )}
                            </button>
                        </div>
                    
                        {normalizedProduct.benefits.length > 0 && (
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-medium mb-4">Good For:</h3>
                                <ul className="flex flex-wrap gap-2">
                                    {normalizedProduct.benefits.map((benefit, index) => (
                                        <li key={index} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                                            {decodeHtmlEntities(benefit)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
