import React, { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import Notification from '../common/Notification';

const ProductDetail = ({ product, isModal = false }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Check if product is in wishlist on component mount
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsInWishlist(wishlist.some(item => item.id === product.id));
  }, [product.id]);

  // Ensure product has images array
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || '/placeholder-image.jpg']; // Fallback to single image or placeholder

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product.stock || 10)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product.stock || 10)) {
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
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImages[0],
      quantity,
    });

    setNotification({
      type: 'success',
      message: 'Product added to cart!',
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleCheckoutNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImages[0],
      quantity,
    });
    navigate('/checkout');
  };

  const handleShareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this amazing product: ${product.name}`,
        url: window.location.href,
      })
        .then(() => {
          setNotification({
            type: 'success',
            message: 'Product shared successfully!',
          });
          
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        })
        .catch(() => {
          handleCopyLink();
        });
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setNotification({
          type: 'success',
          message: 'Product link copied to clipboard!',
        });
        
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      })
      .catch(() => {
        setNotification({
          type: 'error',
          message: 'Failed to copy link. Please try again.',
        });
        
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      });
  };

  const handleToggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (isInWishlist) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(item => item.id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsInWishlist(false);
      
      setNotification({
        type: 'info',
        message: 'Product removed from wishlist!',
      });
    } else {
      // Add to wishlist
      const updatedWishlist = [...wishlist, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: productImages[0],
      }];
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsInWishlist(true);
      
      setNotification({
        type: 'success',
        message: 'Product added to wishlist!',
      });
    }
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle image error and replace with placeholder
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = '/placeholder-image.jpg';
  };

  // Function to change selected image
  const changeSelectedImage = (index) => {
    setSelectedImage(index);
  };

  // Format price with Nigerian Naira
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate old price if not provided
  const oldPrice = product.oldPrice || (product.discount ? Math.round(product.price / (1 - product.discount / 100)) : null);

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
        {/* Breadcrumb navigation - only show if not in modal */}
        {!isModal && (
          <div className="text-sm text-gray-500 mb-6">
            <span className="hover:text-gray-700 cursor-pointer">Home</span> &gt; 
            {product.category && (
              <>
                <span className="hover:text-gray-700 cursor-pointer"> {product.category}</span> &gt; 
              </>
            )}
            <span className="text-gray-700"> {product.name}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="mb-4 relative bg-gray-50 rounded-lg overflow-hidden">
              <img 
                src={productImages[selectedImage]}
                alt={product.name} 
                className="w-full h-96 object-contain"
                onError={handleImageError}
              />
              
              {/* Action buttons */}
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
              
              {/* Display badges if product is new or has a discount */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {product.isNew && (
                  <div className="bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded-sm">
                    New
                  </div>
                )}
                {product.discount && (
                  <div className="bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded-sm">
                    -{product.discount}%
                  </div>
                )}
              </div>
            </div>
            
            {/* Thumbnail images */}
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
                      alt={`${product.name} ${index + 1}`} 
                      className="w-full h-16 object-cover"
                      onError={handleImageError}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Information */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            
            {/* Price information - always showing both prices */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(oldPrice || product.price * 1.2)}
              </span>
              {product.discount && (
                <span className="text-sm font-medium text-red-600">
                  Save {product.discount}%
                </span>
              )}
            </div>
            
            {/* Availability */}
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className="text-sm">
                {product.stock > 0 
                  ? (product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In Stock') 
                  : 'Out of Stock'}
              </span>
            </div>
            
            {/* Description */}
            <div className="text-gray-600">
              <p>{product.description}</p>
            </div>
            
            {/* Quantity selector */}
            {product.stock > 0 && (
              <div className="flex items-center">
                <span className="mr-3 text-sm font-medium">Quantity:</span>
                <div className="flex border border-gray-300 rounded-md">
                  <button 
                    onClick={decrementQuantity}
                    className="px-3 py-1 border-r border-gray-300 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={product.stock || 10}
                    className="w-12 text-center focus:outline-none"
                  />
                  <button 
                    onClick={incrementQuantity}
                    className="px-3 py-1 border-l border-gray-300 hover:bg-gray-100"
                    disabled={quantity >= (product.stock || 10)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="bg-pink-500 hover:bg-pink-600 text-white py-3 px-6 rounded-md font-medium w-full transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add To Cart
              </button>
              <button
                className="bg-white hover:bg-gray-100 text-gray-800 py-3 px-6 rounded-md font-medium border border-gray-300 w-full transition duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                onClick={handleCheckoutNow}
                disabled={product.stock <= 0}
              >
                Checkout Now
              </button>
            </div>
          
            {/* Key Benefits section */}
            {product.benefits && product.benefits.length > 0 ? (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-4">Key Benefits:</h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-4">Key Benefits:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Brightens and evens skin tone</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Reduces appearance of dark spots</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Antioxidant protection against environmental damage</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Lightweight, non-greasy formula</span>
                  </li>
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