import React from 'react';
import { Link } from 'react-router-dom';
import Meta from '/src/components/common/Meta';
import HeroBanner from '/src/components/home/HeroBanner';
import Categories from '/src/components/home/Categories';
import BestSellers from '/src/components/home/BestSellers';
import NewArrivals from '/src/components/home/NewArrivals';
import ShopByConcern from '/src/components/home/ShopByConcern';
import BrandLogoSlider from '/src/components/home/BrandLogoSlider';
import Testimonials from '/src/components/home/Testimonials';
import ConsultationCTA from '/src/components/home/ConsultationCTA';

const HomePage = () => {
  return (
    <>
      {/* UPDATED META COMPONENT FOR SEO */}
      <Meta
        title="Best Cosmetics Store in Nigeria - Leksy Cosmetics"
        description="Shop authentic skincare in Nigeria from Leksy Cosmetics. Based in Lagos, we offer fast nationwide and international delivery. Your trusted source for radiant skin."
        keywords="cosmetics store in nigeria, skincare nigeria, makeup lagos, nationwide delivery cosmetics, international shipping skincare, leksy cosmetics, authentic beauty products"
      />
      
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <HeroBanner />
          <div className="container mx-auto px-4 md:px-8 lg:px-2 max-w-8xl">
            <Categories />
            <BestSellers />
            <NewArrivals />
            <ShopByConcern />
          </div>
          <Testimonials />      
          <ConsultationCTA />
          <BrandLogoSlider />
        </main>
      </div>
    </>
  );
};

export default HomePage;

