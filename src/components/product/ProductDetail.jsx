import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useDiscounts } from '../../contexts/DiscountContext';
import { useMessage } from '../../contexts/MessageContext';
import { formatter } from '../../utils/formatter';

const decodeHtmlEntities = (text) => {
    if (!text || typeof text !== 'string') return text;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
};

const ProductDetail = ({ product, loading = false }) => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [componentReady, setComponentReady] = useState(false);

    const { toggleWishlistItem, isInWishlist } = useWishlist();
    const { applyDiscountToProduct, loading: discountsLoading } = useDiscounts();
    const { warning } = useMessage();

    const normalizedProduct = useMemo(() => {
        if (!product) return null;
        
        const price = parseFloat(product.price) || 0;
        const category = (product.category || '').toLowerCase();
        
        let rawBenefits = product.concern_options || [];
        
        if (typeof rawBenefits === 'string') {
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
        
        let benefits = Array.isArray(rawBenefits) 
            ? rawBenefits.filter(b => b && b.toLowerCase() !== 'others')
            : [];
        
        if (benefits.length === 0) {
            if (category === 'perfume') {
                benefits = ['Luxurious Fragrance'];
            } else if (category === 'beauty') {
                benefits = ['Enhances Natural Beauty'];
            }
        }

        const baseProduct = {
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

        return applyDiscountToProduct(baseProduct);
    }, [product, applyDiscountToProduct]);

    useEffect(() => {
        if (normalizedProduct && !loading && !discountsLoading) {
            const timer = setTimeout(() => {
                setComponentReady(true);
            }, 200);
            
            return () => clearTimeout(timer);
        }
    }, [normalizedProduct, loading, discountsLoading]);

    useEffect(() => {
        if (normalizedProduct?.images?.length > 0 && componentReady) {
            const imagePromises = normalizedProduct.images.map(imageSrc => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = imageSrc;
                });
            });

            Promise.all(imagePromises).then(() => {});
        }
    }, [normalizedProduct, componentReady]);

    const isProductInWishlist = useMemo(() => {
        if (!normalizedProduct?.product_id) return false;
        return isInWishlist(normalizedProduct.product_id);
    }, [isInWishlist, normalizedProduct]);

    const incrementQuantity = () => {
        const stock = normalizedProduct.stock;
        const currentQuantity = Number(quantity) || 0;
        if (currentQuantity < stock) {
            setQuantity(currentQuantity + 1);
        } else {
            warning(`Only ${stock} pieces available in stock.`);
        }
    };

    const decrementQuantity = () => {
        const currentQuantity = Number(quantity) || 1;
        if (currentQuantity > 1) {
            setQuantity(currentQuantity - 1);
        }
    };

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
    
    const handleQuantityInputBlur = () => {
        if (quantity === '' || Number(quantity) < 1) {
            setQuantity(1);
        }
    };

    const handleAddToCart = () => {
        if (normalizedProduct.stock < 1) return;
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
    };

    const handleShare = async () => {
        const productUrl = window.location.href;
        const shareData = {
            title: normalizedProduct.name,
            text: `Check out this product: ${normalizedProduct.name}`,
            url: productUrl
        };

        try {
            if (navigator.share) {
                if (navigator.canShare) {
                    if (navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                        return;
                    }
                } else {
                    await navigator.share(shareData);
                    return;
                }
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(productUrl);
                warning('Product link copied to clipboard!');
                return;
            }

            const textArea = document.createElement('textarea');
            textArea.value = productUrl;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    warning('Product link copied to clipboard!');
                } else {
                    warning('Unable to copy link. Please copy manually.');
                }
            } catch (err) {
                warning('Unable to copy link. Please copy manually.');
            }
            
            document.body.removeChild(textArea);
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            
            if (error.name === 'NotAllowedError') {
                warning('Sharing is only available on secure connections (HTTPS).');
                return;
            }

            warning('Unable to share at this time. Please try copying the URL manually.');
        }
    };
    
    if (loading || !normalizedProduct || discountsLoading) {
        return (
            <div className="bg-white min-h-screen">
                <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
                    <div className="mb-4 sm:mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 bg-gray-200 rounded-lg sm:rounded-xl animate-pulse aspect-square sm:aspect-auto" style={{ minHeight: '250px' }}></div>
                                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-200 rounded-md animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-4 sm:space-y-6">
                            <div className="space-y-2">
                                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-3/4 h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="flex items-baseline space-x-3">
                                <div className="w-24 h-7 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="flex gap-2 sm:gap-3">
                                <div className="flex-1 h-11 sm:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="flex-1 h-11 sm:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="w-11 sm:w-14 h-11 sm:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/shop');
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-8">
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-lg transition-all duration-200 group touch-manipulation border border-gray-200 shadow-sm hover:shadow-md"
                        aria-label="Go back to previous page"
                    >
                        <svg 
                            className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:-translate-x-1 transition-transform duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium text-sm sm:text-base">Back to Shop</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="lg:hidden">
                            <div className="relative bg-white rounded-lg overflow-hidden shadow-md border border-gray-100">
                                {normalizedProduct.hasDiscount && (
                                    <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        <span>{normalizedProduct.discountPercent}% OFF</span>
                                    </div>
                                )}
                                
                                <img 
                                    src={normalizedProduct.images[selectedImage]}
                                    alt={normalizedProduct.name} 
                                    className="w-full h-auto object-contain transition-transform duration-300"
                                    loading="lazy"
                                />
                                
                                <button 
                                    className="absolute top-2 right-2 flex items-center justify-center w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 touch-manipulation z-10"
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
                                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                                        />
                                    </svg>
                                </button>
                            </div>
                            
                            {normalizedProduct.images.length > 1 && (
                                <div className="grid grid-cols-5 gap-2 mt-3">
                                    {normalizedProduct.images.slice(0, 5).map((image, index) => (
                                        <button 
                                            key={index} 
                                            className={`relative border-2 rounded-md overflow-hidden transition-all duration-200 aspect-square focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 touch-manipulation ${
                                                selectedImage === index 
                                                    ? 'border-pink-500 shadow-md ring-2 ring-pink-200' 
                                                    : 'border-gray-200 hover:border-gray-300'
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
                        
                        <div className="hidden lg:block">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 relative bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
                                    {normalizedProduct.hasDiscount && (
                                        <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 to-red-600 text-white text-base font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            <span>{normalizedProduct.discountPercent}% OFF</span>
                                        </div>
                                    )}
                                    
                                    <img 
                                        src={normalizedProduct.images[selectedImage]}
                                        alt={normalizedProduct.name} 
                                        className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                                <button 
                                    className="flex items-center justify-center w-11 h-11 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 touch-manipulation flex-shrink-0"
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
                                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                                        />
                                    </svg>
                                </button>
                            </div>
                            
                            {normalizedProduct.images.length > 1 && (
                                <div className="grid grid-cols-6 gap-2 mt-4">
                                    {normalizedProduct.images.slice(0, 5).map((image, index) => (
                                        <button 
                                            key={index} 
                                            className={`relative border-2 rounded-md overflow-hidden transition-all duration-200 aspect-square focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 touch-manipulation ${
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
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                        <div className="space-y-1 sm:space-y-2">
                            <div className="text-xs sm:text-sm text-pink-600 font-medium uppercase tracking-wide">
                                {normalizedProduct.category}
                            </div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">
                                {normalizedProduct.name}
                            </h1>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex items-baseline space-x-2 sm:space-x-3">
                                {normalizedProduct.hasDiscount ? (
                                    <>
                                        <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-pink-600">
                                            {formatter.formatCurrency(normalizedProduct.discountedPrice)}
                                        </span>
                                        <span className="text-lg sm:text-xl lg:text-2xl text-gray-500 line-through">
                                            {formatter.formatCurrency(normalizedProduct.originalPrice)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-pink-600">
                                        {formatter.formatCurrency(normalizedProduct.price)}
                                    </span>
                                )}
                            </div>
                            
                            {normalizedProduct.hasDiscount && (
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save {formatter.formatCurrency(normalizedProduct.savings)}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        ({normalizedProduct.discountPercent}% off)
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                                normalizedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className={`text-xs sm:text-sm font-medium ${
                                normalizedProduct.stock > 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                                {normalizedProduct.stock > 0 
                                    ? (normalizedProduct.stock <= 5 ? `Only ${normalizedProduct.stock} left in stock` : 'In Stock') 
                                    : 'Out of Stock'}
                            </span>
                        </div>
                        
                        {normalizedProduct.description && (
                            <div className="border-t border-gray-200 pt-4 sm:pt-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Description</h3>
                                <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                    <p>{normalizedProduct.description}</p>
                                </div>
                            </div>
                        )}
                        
                        {normalizedProduct.stock > 0 && (
                            <div className="flex items-center space-x-3 sm:space-x-4 py-3 sm:py-4">
                                <label htmlFor="quantity-input" className="text-sm sm:text-base font-semibold text-gray-900">
                                    Quantity:
                                </label>
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button 
                                        onClick={decrementQuantity} 
                                        className="px-3 sm:px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-300 focus:outline-none focus:bg-gray-100 touch-manipulation min-h-[44px]"
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
                                        className="w-12 sm:w-16 text-center py-2 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
                                        min="1"
                                        max={normalizedProduct.stock}
                                        aria-label="Product quantity"
                                    />
                                    <button 
                                        onClick={incrementQuantity} 
                                        className="px-3 sm:px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-300 focus:outline-none focus:bg-gray-100 touch-manipulation min-h-[44px]"
                                        disabled={Number(quantity) >= normalizedProduct.stock}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 touch-manipulation text-sm sm:text-base min-h-[44px]"
                                onClick={handleAddToCart}
                                disabled={normalizedProduct.stock <= 0}
                            >
                                Add To Cart
                            </button>
                            
                            <div className="flex sm:contents gap-2">
                                <button
                                    className="flex-1 sm:flex-1 bg-transparent border-2 border-pink-500 text-pink-500 hover:bg-pink-50 py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 touch-manipulation text-sm sm:text-base min-h-[44px]"
                                    onClick={handleCheckoutNow}
                                    disabled={normalizedProduct.stock <= 0}
                                >
                                    Checkout Now
                                </button>
                                <button 
                                    className={`sm:flex-none flex items-center justify-center h-11 sm:h-14 px-4 sm:px-0 sm:min-w-[56px] rounded-lg border-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation ${
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
                        </div>
                    
                        {normalizedProduct.benefits.length > 0 && (
                            <div className="border-t border-gray-200 pt-4 sm:pt-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Perfect For:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {normalizedProduct.benefits.map((benefit, index) => (
                                        <span 
                                            key={index} 
                                            className="bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors"
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