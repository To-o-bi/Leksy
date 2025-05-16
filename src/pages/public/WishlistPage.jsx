import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../../contexts/WishlistContext';
import { CartContext } from '../../contexts/CartContext';
import { FaFacebookF, FaTwitter, FaPinterestP, FaInstagram } from 'react-icons/fa';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
  };

  // Format price to use NGN currency format
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('NGN', '₦');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-8">
        <Link to="/" className="text-gray-500 hover:text-pink-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-pink-500">Wishlist</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-center">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500 mb-6">Your wishlist is empty.</p>
          <Link to="/shop" className="bg-pink-500 text-white py-3 px-8 rounded-md hover:bg-pink-600 transition">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Wishlist Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="py-4 px-6 font-medium text-gray-500 uppercase text-sm">PRODUCT</th>
                  <th className="py-4 px-6 font-medium text-gray-500 uppercase text-sm">PRICE</th>
                  <th className="py-4 px-6 font-medium text-gray-500 uppercase text-sm">STOCK STATUS</th>
                  <th className="py-4 px-6 font-medium text-gray-500 uppercase text-sm"></th>
                  <th className="py-4 px-6 font-medium text-gray-500 uppercase text-sm"></th>
                </tr>
              </thead>
              <tbody>
                {wishlist.map((product) => {
                  const isInStock = product.stockStatus !== 'Out of Stock';
                  
                  return (
                    <tr key={product.id} className="border-t">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover mr-4" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {product.oldPrice && (
                          <span className="line-through text-gray-400 mr-2">{formatPrice(product.oldPrice)}</span>
                        )}
                        <span className="font-bold">{formatPrice(product.price)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`py-1 px-3 rounded-md text-sm ${isInStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {isInStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!isInStock}
                          className={`py-2 px-6 rounded-md text-sm font-medium ${
                            isInStock
                              ? 'bg-pink-500 text-white hover:bg-pink-600'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Add to Cart
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleRemove(product.id)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Remove from wishlist"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Social Share Section */}
          <div className="mt-8 border-t pt-6">
            <div className="flex items-center">
              <span className="mr-4 font-medium">Share:</span>
              <div className="flex space-x-2">
                <a href="#" className="bg-pink-500 text-white p-2 rounded-full">
                  <FaFacebookF className="h-4 w-4" />
                </a>
                <a href="#" className="bg-gray-200 text-gray-600 p-2 rounded-full hover:bg-gray-300">
                  <FaTwitter className="h-4 w-4" />
                </a>
                <a href="#" className="bg-gray-200 text-gray-600 p-2 rounded-full hover:bg-gray-300">
                  <FaPinterestP className="h-4 w-4" />
                </a>
                <a href="#" className="bg-gray-200 text-gray-600 p-2 rounded-full hover:bg-gray-300">
                  <FaInstagram className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Related Products Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Related Products</h2>
          <Link to="/shop" className="text-gray-500 hover:text-pink-500 flex items-center">
            See all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Example related products - these would come from your actual product data */}
          {Array.from({ length: 4 }).map((_, index) => (
            <RelatedProductCard key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Sample Related Product Card component
const RelatedProductCard = () => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  
  const toggleWishlist = (e) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group relative bg-white border rounded-lg overflow-hidden">
      <div className="relative pt-[100%]">
        <img 
          src="https://via.placeholder.com/300x300?text=Skincare+Product" 
          alt="Timeless Skincare TIMELESS 20% Vitamin C Serum + Vitamin E + Ferulic Acid" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <button 
          onClick={toggleWishlist}
          className="absolute top-2 right-2 z-10 bg-white p-1.5 rounded-full shadow-sm"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${isWishlisted ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`} 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            fill="none"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-sm text-gray-500">Timeless Skincare TIMELESS</h3>
        <p className="font-medium">20% Vitamin C Serum + Vitamin E + Ferulic Acid</p>
        <p className="font-bold mt-2">₦15,000</p>
      </div>
    </div>
  );
};

export default WishlistPage;