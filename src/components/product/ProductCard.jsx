import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../../contexts/WishlistContext';
import { CartContext } from '../../contexts/CartContext';
import ProductDetail from '../product/ProductDetail';

// Utility function to decode HTML entities
const decodeHtmlEntities = (text) => {
  if (typeof text !== 'string') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const ProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [showQuickView, setShowQuickView] = useState(false);
  
  const normalizedProduct = useMemo(() => {
    if (!product) return null;
    const productId = product.product_id || product.id || product._id;
    if (!productId) return null;

    return {
      id: productId,
      name: decodeHtmlEntities(product.name || 'Unknown Product'),
      price: parseFloat(product.price) || 0,
      originalPrice: product.slashed_price ? parseFloat(product.slashed_price) : undefined,
      image: product.images?.[0] || '/placeholder-image.jpg',
      stock: parseInt(product.available_qty, 10) || 0,
      discount: product.slashed_price && product.price ? 
        Math.round(((product.slashed_price - product.price) / product.slashed_price) * 100) : 0,
      ...product
    };
  }, [product]);

  const isWishlisted = useMemo(() => {
    return normalizedProduct ? isInWishlist(normalizedProduct.id) : false;
  }, [normalizedProduct, isInWishlist]);

  const formatPrice = useMemo(() => {
    return (price) => new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(normalizedProduct.id);
    } else {
      addToWishlist(normalizedProduct);
    }
  };
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(normalizedProduct);
  };
  
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  if (!normalizedProduct) {
    return null; // Render nothing if product data is invalid
  }

  // --- THIS IS THE FIX ---
  const renderStockStatus = () => {
    const stock = normalizedProduct.stock;
    // Treat any stock count of 0 or less as out-of-stock
    if (stock <= 0) {
      return <span className="text-xs text-red-600 font-medium">Out of Stock</span>;
    }
    // For low stock, display the actual positive number
    if (stock <= 5) {
      return <span className="text-xs text-orange-600 font-medium">Only {stock} left</span>;
    }
    return null;
  };
  // --- END OF FIX ---

  return (
    <>
      <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
        <div className="relative overflow-hidden pt-[100%]">
          {normalizedProduct.discount > 0 && (
            <div className="absolute top-3 right-12 z-10 bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded-sm">
              -{normalizedProduct.discount}%
            </div>
          )}
          <button onClick={handleQuickView} aria-label="Quick view" className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          
          <Link to={`/product/${normalizedProduct.id}`} className="block absolute inset-0">
            <img src={normalizedProduct.image} alt={normalizedProduct.name} className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </Link>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button onClick={handleAddToCart} disabled={normalizedProduct.stock <= 0} className="bg-white text-gray-800 rounded-md py-2 px-4 text-sm font-semibold shadow-md hover:bg-gray-800 hover:text-white transition-colors flex items-center disabled:bg-gray-300 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Add to Cart
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <Link to={`/product/${normalizedProduct.id}`} className="flex-1">
              <h3 className="text-gray-600 font-medium text-sm leading-tight hover:text-gray-800 line-clamp-2">
                {normalizedProduct.name}
              </h3>
            </Link>
            <button onClick={handleWishlistToggle} className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isWishlisted ? 'bg-pink-50 text-pink-500' : 'bg-gray-50 text-gray-400 hover:text-pink-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-gray-900 font-semibold text-lg">{formatPrice(normalizedProduct.price)}</p>
              {normalizedProduct.originalPrice && (
                <p className="text-gray-500 text-xs line-through">{formatPrice(normalizedProduct.originalPrice)}</p>
              )}
            </div>
            {renderStockStatus()}
          </div>
        </div>
      </div>

      {showQuickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setShowQuickView(false)} className="absolute top-4 right-4 bg-gray-100 rounded-full p-2 hover:bg-gray-200 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <ProductDetail product={normalizedProduct} isModal={true} />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
