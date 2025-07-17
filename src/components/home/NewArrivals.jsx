import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { useProducts } from '../../contexts/ProductContext';

const NewArrivals = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState([]);
  
  const { 
    products: productsList, 
    loading, 
    error, 
    refreshProducts
  } = useProducts();

  useEffect(() => {
    if (!productsList || productsList.length === 0) {
      setNewArrivals([]);
      return;
    }
    
    // Correctly filter by 'product_id' and slice the first 8 items.
    // The problematic .sort() has been removed.
    const latestProducts = [...productsList]
      .filter(product => product && (product.product_id !== undefined && product.product_id !== null))
      .slice(0, 8); 

    // Add isNew flag and use the correct 'product_id' for the uniqueId
    const formattedProducts = latestProducts.map((product, index) => ({
      ...product,
      isNew: true, 
      uniqueId: product.product_id || `new-arrival-${index}`
    }));

    setNewArrivals(formattedProducts);
  }, [productsList]);

  const handleRetry = useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);

  const handleSeeAll = useCallback(() => {
    navigate('/shop');
  }, [navigate]);

  if (loading && newArrivals.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={`new-arrivals-skeleton-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && newArrivals.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">New Arrivals</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!loading && newArrivals.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-bold">New Arrivals</h2>
                <button
                    onClick={handleSeeAll}
                    className="text-sm text-pink-500 flex items-center hover:text-pink-600 transition-colors duration-200"
                >
                    See all
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No new arrivals yet</h3>
            <p className="text-gray-600 mb-6">Check back soon for the latest products</p>
            <button 
              onClick={handleRetry}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
            >
              Refresh Products
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50/30 to-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
            <p className="text-gray-600">Discover our latest beauty essentials</p>
          </div>
          <button 
            onClick={handleSeeAll}
            className="text-sm text-pink-500 flex items-center hover:text-pink-600 transition-colors duration-200 font-medium"
          >
            See all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map((product, index) => (
            <ProductCard 
              key={`new-arrival-${product.uniqueId}`} 
              product={product} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;