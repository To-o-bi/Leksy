import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../hooks/useCart';
import { productService } from '../../api'; // Ensure this path is correct
import { formatter } from '../../utils/formatter'; // Corrected import
import ProductCard from '../../components/product/ProductCard'; 
import Breadcrumb from '../../components/common/Breadcrumb'; // Assuming you have this component
import { FaFacebookF, FaTwitter, FaWhatsapp } from 'react-icons/fa';

/**
 * Renders the user's wishlist page.
 * Displays wishlist items and suggestions for related products.
 */
const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch related/featured products when the component mounts
  useEffect(() => {
    const fetchRelated = async () => {
      setIsLoading(true);
      try {
        // Example: Fetch 4 random or featured products
        const response = await productService.fetchProducts({ limit: 4, sort: 'random' });
        if (response.products) {
          setRelatedProducts(response.products);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelated();
  }, []);

  // Handler for social media sharing
  const handleShare = (platform) => {
    const pageUrl = encodeURIComponent(window.location.href);
    const message = encodeURIComponent("Check out my wishlist on Leksy Store!");
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${message}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${message}%20${pageUrl}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Wishlist' }]} />
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800">My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
            <p className="text-xl text-gray-600 mb-6">Your wishlist is currently empty.</p>
            <p className="text-gray-500 mb-8">Add items you love to your wishlist to save them for later!</p>
            <Link to="/shop" className="bg-pink-500 text-white py-3 px-8 rounded-md hover:bg-pink-600 transition-colors font-semibold">
              Discover Products
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto shadow-md rounded-lg mb-8">
              <table className="w-full border-collapse bg-white">
                <thead className="bg-gray-100">
                  <tr className="text-left">
                    <th className="py-4 px-6 font-semibold text-gray-600 uppercase text-sm" colSpan="2">PRODUCT</th>
                    <th className="py-4 px-6 font-semibold text-gray-600 uppercase text-sm hidden md:table-cell">PRICE</th>
                    <th className="py-4 px-6 font-semibold text-gray-600 uppercase text-sm hidden md:table-cell">STOCK</th>
                    <th className="py-4 px-6 font-semibold text-gray-600 uppercase text-sm text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlist.map((product) => {
                    const isInStock = product.available_qty > 0;
                    return (
                      <tr key={product.product_id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 w-24">
                          <Link to={`/product/${product.product_id}`}>
                            <img 
                              src={product.images?.[0] || 'https://placehold.co/100x100/f7f7f7/ccc?text=Image'} 
                              alt={product.name} 
                              className="w-16 h-16 object-cover rounded-md" 
                            />
                          </Link>
                        </td>
                        <td className="py-4 px-2 md:px-6">
                          <Link to={`/product/${product.product_id}`} className="font-medium text-gray-800 hover:text-pink-500">{product.name}</Link>
                          <div className="md:hidden text-sm font-bold mt-1">{formatter.formatCurrency(product.price)}</div>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <span className="font-bold text-lg text-gray-800">{formatter.formatCurrency(product.price)}</span>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <span className={`py-1 px-3 rounded-full text-xs font-semibold ${isInStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isInStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => addToCart(product)}
                              disabled={!isInStock}
                              className="bg-pink-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={() => removeFromWishlist(product.product_id)}
                              className="text-gray-400 hover:text-red-500 p-2"
                              aria-label="Remove from wishlist"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 border-t pt-6 flex justify-end">
              <div className="flex items-center">
                <span className="mr-4 font-medium text-gray-600">Share your wishlist:</span>
                <div className="flex space-x-4">
                  <button onClick={() => handleShare('facebook')} aria-label="Share on Facebook" className="text-gray-500 hover:text-blue-600 transition-colors"><FaFacebookF size={20} /></button>
                  <button onClick={() => handleShare('twitter')} aria-label="Share on Twitter" className="text-gray-500 hover:text-sky-500 transition-colors"><FaTwitter size={20} /></button>
                  <button onClick={() => handleShare('whatsapp')} aria-label="Share on WhatsApp" className="text-gray-500 hover:text-green-500 transition-colors"><FaWhatsapp size={20} /></button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">You Might Also Like</h2>
            <Link to="/shop" className="text-pink-500 hover:underline font-medium flex items-center">
              See all
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {isLoading ? (
             <p className="text-center text-gray-500 py-8">Loading recommendations...</p>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.product_id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Could not load recommendations at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
