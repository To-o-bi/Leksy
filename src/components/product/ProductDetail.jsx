import React, { useState, useContext } from 'react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { WishlistContext } from '../../contexts/WishlistContext';
import Notification from '../common/Notification';

// HTML entity decoder helper function
const decodeHtmlEntities = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    const entityMap = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
        '&apos;': "'",
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#x60;': '`',
        '&#x3D;': '='
    };
    
    return text.replace(/&[#\w]+;/g, (entity) => {
        return entityMap[entity] || entity;
    });
};

const ProductDetail = ({ product }) => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [notification, setNotification] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);

    const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext) || {};

    const normalizedProduct = React.useMemo(() => {
        if (!product) return null;
        
        return {
            id: product.product_id || product.id || product._id,
            name: decodeHtmlEntities(product.name || product.title || product.product_name || 'Unknown Product'),
            price: parseFloat(product.price) || parseFloat(product.cost) || 0,
            originalPrice: product.slashed_price ? parseFloat(product.slashed_price) : undefined,
            description: decodeHtmlEntities(product.description || product.desc || ''),
            image: product.images?.[0] || product.image || '/placeholder-image.jpg',
            images: product.images || (product.image ? [product.image] : ['/placeholder-image.jpg']),
            category: decodeHtmlEntities(product.category || product.category_name || 'Uncategorized'),
            brand: decodeHtmlEntities(product.brand || product.manufacturer || ''),
            stock: parseInt(product.available_qty) || parseInt(product.stock) || parseInt(product.inventory) || 0,
            rating: parseFloat(product.rating) || 0,
            reviews: product.reviews || [],
            benefits: product.key_benefits || product.benefits || product.features || [],
            isNew: product.isNew || product.is_new || false,
            discount: product.discount || (product.slashed_price && product.price ? 
                Math.round(((product.slashed_price - product.price) / product.slashed_price) * 100) : 0)
        };
    }, [product]);

    const isInWishlist = React.useMemo(() => {
        if (!normalizedProduct?.id || !Array.isArray(wishlist)) return false;
        return wishlist.some(item => 
            (item.id || item.product_id || item._id) === normalizedProduct.id
        );
    }, [wishlist, normalizedProduct?.id]);

    if (!normalizedProduct || !normalizedProduct.id) {
        return (
            <div className="container mx-auto px-4 text-center">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <h3 className="font-bold">Product data not available</h3>
                    <p>Unable to load product information. Please try again.</p>
                </div>
            </div>
        );
    }

    const productImages = normalizedProduct.images?.length > 0 
        ? normalizedProduct.images 
        : [normalizedProduct.image || '/placeholder-image.jpg'];

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= (normalizedProduct.stock || 10)) {
            setQuantity(value);
        }
    };

    const incrementQuantity = () => {
        if (quantity < (normalizedProduct.stock || 10)) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleAddToCart = () => {
        addToCart({
            id: normalizedProduct.id,
            name: normalizedProduct.name,
            price: normalizedProduct.price,
            image: productImages[0],
            quantity,
        });

        setNotification({
            type: 'success',
            message: 'Product added to cart!',
        });

        setTimeout(() => setNotification(null), 3000);
    };

    const handleCheckoutNow = () => {
        addToCart({
            id: normalizedProduct.id,
            name: normalizedProduct.name,
            price: normalizedProduct.price,
            image: productImages[0],
            quantity,
        });
        navigate('/checkout');
    };

    const handleShareProduct = () => {
        if (navigator.share) {
            navigator.share({
                title: normalizedProduct.name,
                text: `Check out this amazing product: ${normalizedProduct.name}`,
                url: window.location.href,
            })
            .then(() => {
                setNotification({ type: 'success', message: 'Product shared successfully!' });
                setTimeout(() => setNotification(null), 3000);
            })
            .catch(() => handleCopyLink());
        } else {
            handleCopyLink();
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        .then(() => {
            setNotification({ type: 'success', message: 'Product link copied to clipboard!' });
            setTimeout(() => setNotification(null), 3000);
        })
        .catch(() => {
            setNotification({ type: 'error', message: 'Failed to copy link. Please try again.' });
            setTimeout(() => setNotification(null), 3000);
        });
    };

    const handleToggleWishlist = () => {
        if (!addToWishlist || !removeFromWishlist) {
            setNotification({ type: 'error', message: 'Wishlist functionality is not available.' });
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        const wishlistItem = {
            id: normalizedProduct.id,
            name: normalizedProduct.name,
            price: normalizedProduct.price,
            image: productImages[0],
        };
        
        if (isInWishlist) {
            removeFromWishlist(normalizedProduct.id);
            setNotification({ type: 'info', message: 'Product removed from wishlist!' });
        } else {
            addToWishlist(wishlistItem);
            setNotification({ type: 'success', message: 'Product added to wishlist!' });
        }
        
        setTimeout(() => setNotification(null), 3000);
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = '/placeholder-image.jpg';
    };

    const changeSelectedImage = (index) => {
        setSelectedImage(index);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const oldPrice = normalizedProduct.originalPrice || 
        (normalizedProduct.discount > 0 ? Math.round(normalizedProduct.price / (1 - normalizedProduct.discount / 100)) : null);

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
                                src={productImages[selectedImage]}
                                alt={normalizedProduct.name} 
                                className="w-full h-96 object-contain"
                                onError={handleImageError}
                            />
                            
                            <div className="absolute top-4 right-4 flex flex-col space-y-2">
                                <button 
                                    className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-200"
                                    onClick={handleShareProduct}
                                    aria-label="Share product"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </button>
                                <button 
                                    className={`rounded-full p-2 shadow-md transition-colors duration-200 ${
                                        isInWishlist ? 'bg-pink-50 text-pink-500' : 'bg-white hover:bg-gray-100'
                                    }`}
                                    onClick={handleToggleWishlist}
                                    aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                    {isInWishlist ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            
                            <div className="absolute top-4 left-4 flex flex-col space-y-2">
                                {normalizedProduct.isNew && (
                                    <div className="bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded-sm">New</div>
                                )}
                                {normalizedProduct.discount > 0 && (
                                    <div className="bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded-sm">-{normalizedProduct.discount}%</div>
                                )}
                            </div>
                        </div>
                        
                        {productImages.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {productImages.map((image, index) => (
                                    <div 
                                        key={index} 
                                        className={`border rounded-md overflow-hidden cursor-pointer transition-all ${
                                            selectedImage === index ? 'border-pink-500 border-2 opacity-100' : 'border-gray-200 opacity-70 hover:opacity-100'
                                        }`}
                                        onClick={() => changeSelectedImage(index)}
                                    >
                                        <img 
                                            src={image} 
                                            alt={`${normalizedProduct.name} ${index + 1}`} 
                                            className="w-full h-16 object-cover"
                                            onError={handleImageError}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Product Information - LAYOUT REFINED HERE */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">{normalizedProduct.name}</h1>
                        
                        <div className="flex items-center space-x-3 mb-4">
                            <span className="text-2xl font-bold text-gray-900">{formatPrice(normalizedProduct.price)}</span>
                            {(oldPrice || normalizedProduct.originalPrice) && (
                                <span className="text-lg text-gray-400 line-through">{formatPrice(oldPrice || normalizedProduct.originalPrice)}</span>
                            )}
                            {normalizedProduct.discount > 0 && (
                                <span className="text-sm font-medium text-red-600">Save {normalizedProduct.discount}%</span>
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
                        
                        <div className="space-y-4 mb-6">
                            {normalizedProduct.description && (
                                <div className="text-gray-600">
                                    <p>{normalizedProduct.description}</p>
                                </div>
                            )}
                            {normalizedProduct.brand && (
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">Brand: </span>
                                    <span>{normalizedProduct.brand}</span>
                                </div>
                            )}
                        </div>
                        
                        {normalizedProduct.stock > 0 && (
                            <div className="flex items-center mb-6">
                                <span className="mr-3 text-sm font-medium">Quantity:</span>
                                <div className="flex border border-gray-300 rounded-md">
                                    <button 
                                        onClick={decrementQuantity}
                                        className="px-3 py-1 border-r border-gray-300 hover:bg-gray-100"
                                        disabled={quantity <= 1}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        min="1"
                                        max={normalizedProduct.stock || 10}
                                        className="w-12 text-center focus:outline-none"
                                    />
                                    <button 
                                        onClick={incrementQuantity}
                                        className="px-3 py-1 border-l border-gray-300 hover:bg-gray-100"
                                        disabled={quantity >= (normalizedProduct.stock || 10)}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                className="bg-pink-500 hover:bg-pink-600 text-white py-3 px-6 rounded-md font-medium w-full transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                onClick={handleAddToCart}
                                disabled={normalizedProduct.stock <= 0}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                Add To Cart
                            </button>
                            <button
                                className="bg-white hover:bg-gray-100 text-gray-800 py-3 px-6 rounded-md font-medium border border-gray-300 w-full transition duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                onClick={handleCheckoutNow}
                                disabled={normalizedProduct.stock <= 0}
                            >
                                Checkout Now
                            </button>
                        </div>
                    
                        <div className="pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-medium mb-4">Key Benefits:</h3>
                            <ul className="space-y-2">
                                {normalizedProduct.benefits && normalizedProduct.benefits.length > 0 ? (
                                    normalizedProduct.benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start">
                                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <span>{decodeHtmlEntities(benefit)}</span>
                                        </li>
                                    ))
                                ) : (
                                    <>
                                        <li className="flex items-start">
                                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <span>High quality product</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <span>Fast delivery</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <span>Customer satisfaction guaranteed</span>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;