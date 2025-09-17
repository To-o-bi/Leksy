import React from 'react';
import { Link } from 'react-router-dom';
import Meta from '../../components/common/Meta';
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
    <>
      <Meta
        title="Best Cosmetics Store in Nigeria - Leksy Cosmetics"
        description="Shop authentic skincare in Nigeria from Leksy Cosmetics. Based in Lagos, we offer fast nationwide and international delivery. Your trusted source for radiant skin."
        keywords="cosmetics store in nigeria, skincare nigeria, makeup lagos, nationwide delivery cosmetics, international shipping skincare, leksy cosmetics, authentic beauty products"
      />
      
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          {/* Hero Banner doesn't need animation as it's visible on load */}
          <HeroBanner />
          <div className="container mx-auto px-4 md:px-8 lg:px-2 max-w-8xl">
            
            <Categories />
            
            
            <div className="reveal-bottom">
                <BestSellers />
            </div>
            <div className="reveal-bottom">
                <NewArrivals />
            </div>
            <div className="reveal-bottom">
                <ShopByConcern />
            </div>
          </div>
          <div className="reveal-bottom">
             <Testimonials /> 
          </div>
          <div className="reveal-bottom">
             <ConsultationCTA />
          </div>
          <div className="reveal-bottom">
             <BrandLogoSlider />
          </div>
        </main>
      </div>
    </>
  );
};

export default HomePage;