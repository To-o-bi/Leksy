import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { getNewArrivals } from '../../assets/dummy/data'; // Import new arrivals function from data.js

const NewArrivals = () => {
  // Get new arrival products from our data.js
  const newProducts = getNewArrivals();
  
  // Convert data format for ProductCard component
  const products = newProducts.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: '$', // Using dollar sign for currency
    image: product.image,
    rating: product.rating,
    reviewCount: product.reviews,
    isNew: true // Mark as new arrival
  }));

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold">New Arrivals</h2>
          <Link to="/shop" className="text-sm text-pink-500 flex items-center hover:text-pink-600">
            See all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;