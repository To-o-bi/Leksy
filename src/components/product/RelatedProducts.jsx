import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

/**
 * A component to display a grid of related or featured products.
 * @param {object[]} products - An array of product objects to display.
 * @param {string} [title="You May Also Like"] - An optional title for the section.
 */
const RelatedProducts = ({ products, title = "You May Also Like" }) => {
  // Don't render the section at all if there are no products to show.
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50/75 py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
          <Link 
            to="/shop" 
            className="text-pink-500 hover:text-pink-600 font-semibold flex items-center transition-colors group text-sm sm:text-base touch-manipulation"
          >
            <span className="hidden sm:inline">View All</span>
            <span className="sm:hidden">All</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 sm:h-5 sm:w-5 ml-1 transition-transform group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {products.map((product) => (
            // Use a robust key, handling potential inconsistencies in product ID field names.
            <ProductCard key={product.product_id || product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;