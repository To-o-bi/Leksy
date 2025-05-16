import React from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../../components/home/HeroBanner';
import Categories from '../../components/home/Categories';
import BestSellers from '../../components/home/BestSellers';
import NewArrivals from '../../components/home/NewArrivals';
import ShopByConcern from '../../components/home/ShopByConcern';
import BrandLogoSlider from '../../components/home/BrandLogoSlider';
import Testimonials from '../../components/home/Testimonials';
import ConsultationCTA from '../../components/home/ConsultationCTA';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Full-width hero banner */}
        <HeroBanner />
        
        {/* Add container with margins for content sections */}
        <div className="container mx-auto px-4 md:px-8 lg:px-2 max-w-8xl">
          <Categories />
          <BestSellers />
          <NewArrivals />
          <ShopByConcern />
        </div>
        
        {/* Full-width sections with internal padding */}
        
        <Testimonials />       
        <ConsultationCTA />
        <BrandLogoSlider />
      </main>
    </div>
  );
};

export default HomePage;