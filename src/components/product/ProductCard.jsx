import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../hooks/useCart';
import { formatter } from '../../utils/formatter';
import ProductDetail from './ProductDetail'; // Assuming ProductDetail is in the same folder

// Utility function to decode HTML entities, preventing XSS
const decodeHtmlEntities = (text) => {
  if (typeof text !== 'string') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlistItem } = useWishlist();
  const { addToCart } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);
  
  // Normalize product data to handle inconsistencies from the API
  const normalizedProduct = useMemo(() => {
    if (!product) return null;
    const productId = product.product_id || product.id || product._id;
    if (!productId) return null;

    const price = parseFloat(product.price) || 0;
    const originalPrice = product.slashed_price ? parseFloat(product.slashed_price) : undefined;

    return {
      ...product, // Spread original product data
      id: productId,
      name: decodeHtmlEntities(product.name || 'Unknown Product'),
      price: price,
      originalPrice: originalPrice,
      image: product.images?.[0] || 'https://placehold.co/300x300/f7f7f7/ccc?text=Product',
      stock: parseInt(product.available_qty, 10) || 0,
      discount: originalPrice && price ? 
        Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    };
  }, [product]);

  const isProductInWishlist = useMemo(() => {
    return normalizedProduct ? isInWishlist(normalizedProduct.id) : false;
  }, [normalizedProduct, isInWishlist]);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlistItem(normalizedProduct);
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
    return null; // Don't render anything if the product data is invalid
  }

  // Renders a specific message based on stock level
  const renderStockStatus = () => {
    const stock = normalizedProduct.stock;
    if (stock <= 0) {
      return <span className="text-xs text-red-600 font-medium">Out of Stock</span>;
    }
    if (stock > 0 && stock <= 5) {
      return <span className="text-xs text-orange-600 font-medium">Only {stock} left</span>;
    }
    return null; // Don't show anything if stock is ample
  };

  return (
    <>
      <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative overflow-hidden pt-[100%]">
          {/* Discount Badge */}
          {normalizedProduct.discount > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-sm">
              -{normalizedProduct.discount}%
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <button onClick={handleWishlistToggle} aria-label="Toggle Wishlist" className="bg-white rounded-full p-2 shadow-md hover:bg-pink-100 hover:text-pink-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isProductInWishlist ? 'text-pink-500' : 'text-gray-500'}`} fill={isProductInWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
            <button onClick={handleQuickView} aria-label="Quick view" className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
          
          <Link to={`/product/${normalizedProduct.id}`} className="block absolute inset-0">
            <img src={normalizedProduct.image} alt={normalizedProduct.name} className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </Link>
          
          {/* Add to Cart on Hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/20 to-transparent opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button onClick={handleAddToCart} disabled={normalizedProduct.stock <= 0} className="w-full bg-white text-gray-800 rounded-md py-2.5 px-4 text-sm font-semibold shadow-md hover:bg-pink-500 hover:text-white transition-colors flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Add to Cart
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <Link to={`/product/${normalizedProduct.id}`} className="block">
            <h3 className="text-gray-700 font-medium text-sm leading-tight hover:text-pink-500 transition-colors line-clamp-2 h-10">
              {normalizedProduct.name}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-gray-900 font-bold text-lg">{formatter.formatCurrency(normalizedProduct.price)}</p>
              {normalizedProduct.originalPrice && (
                <p className="text-gray-500 text-xs line-through">{formatter.formatCurrency(normalizedProduct.originalPrice)}</p>
              )}
            </div>
            {renderStockStatus()}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setShowQuickView(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQuickView(false)} className="absolute top-2 right-2 bg-gray-100 rounded-full p-2 hover:bg-gray-200 z-10">
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
