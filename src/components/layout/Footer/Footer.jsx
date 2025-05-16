import React from 'react';
import { Link } from 'react-router-dom';
import Newsletter from './Newsletter';
import SocialLinks from './SocialLinks';
import logoWhite from '/assets/images/icons/leksy-white.png';
import TrintyLogo from '/assets/images/icons/Ts-white.png';
import footerBg from '/assets/images/banners/footer-bg.jpg';

// More efficient bubble animation
const bubbleAnimationStyles = `
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-12px);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-8px) scale(1.05);
    }
  }
`;

const FooterLinkGroup = ({ title, links }) => (
  <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-10">
    <h3 className="text-white font-semibold mb-6 text-lg">{title}</h3>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.path}>
          <Link 
            to={link.path} 
            className="text-gray-100 hover:text-white transition-colors duration-300 text-sm flex items-center group"
          >
            <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300 inline-block">
              {link.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const accountLinks = [
    { label: 'Order History', path: '/account' },
    { label: 'Login', path: '/login' },
    { label: 'Wishlist', path: '/wishlist' },
    { label: 'Checkout', path: '/checkout' },
    { label: 'Cart', path: '/cart' }
  ];

  const shopLinks = [
    { label: 'All Products', path: '/shop' },
    { label: 'New Arrivals', path: '/shop/new-arrivals' },
    { label: 'Best Sellers', path: '/shop/best-sellers' },
    { label: 'Blog', path: '/blog' },
    { label: 'Skin Type Finder', path: '/finder' }
  ];

  const infoLinks = [
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Shipping Policy', path: '/policies/shipping' },
    { label: 'Returns & Refunds', path: '/policies/returns' },
    { label: 'Privacy Policy', path: '/policies/privacy' }
  ];

  return (
    <footer className="bg-white">
      {/* Add the keyframes animation styles */}
      <style>{bubbleAnimationStyles}</style>
      
      <div>
        <Newsletter />
      </div>
      
      <div className="w-full relative"> 
        <div 
          className="bg-pink-500 py-12 md:py-16 relative overflow-hidden w-full"
          style={{
            backgroundImage: `url(${footerBg})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundBlendMode: 'multiply' 
          }}
        >
          {/* Decorative bubbles overlay with optimized animation */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-pink-500 opacity-80"></div>
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-white opacity-10"
                  style={{
                    width: `${Math.random() * 80 + 30}px`,
                    height: `${Math.random() * 80 + 30}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `${Math.random() > 0.5 ? 'bounce' : 'float'} ${Math.random() * 2 + 2}s infinite ease-in-out ${Math.random() * 1}s`,
                    animationFillMode: 'both'
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Footer content - responsive container */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-wrap -mx-2">
              {/* About section */}
              <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-10">          
                <div className="flex items-center mb-6">
                  <h3 className="text-white font-bold text-xl">About Leksy Cosmetics</h3>
                </div>
                <p className="text-gray-100 mb-6 text-sm leading-relaxed">
                  Leksy Cosmetic is a leading skincare brand in Nigeria, dedicated to providing premium beauty and skincare products that enhance and preserve your natural glow.
                </p>
                <SocialLinks />
              </div>
              
              {/* Link sections using the reusable component */}
              <FooterLinkGroup title="My Account" links={accountLinks} />
              <FooterLinkGroup title="Shop" links={shopLinks} />
              <FooterLinkGroup title="Information" links={infoLinks} />
            </div>
            
            {/* Copyright section */}
            <div className="pt-8 mt-8 border-t border-pink-300 border-opacity-30 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0">
                  <img src={logoWhite} alt="Leksy Cosmetics" className="h-8 md:h-10"/>
                </div>
                
                <p className="text-sm text-gray-100 mb-6 md:mb-0 text-center md:text-left">
                  Leksy Cosmetics © {new Date().getFullYear()}. All rights reserved.
                </p>

                <div className="flex items-center">
                  <p className="text-gray-100 text-xs md:text-sm flex flex-col md:flex-row items-center font-light">
                    <span className="mb-2 md:mb-0">Designed and Developed by</span>
                    <a 
                      href="https://trinitystudio.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center md:ml-2 hover:opacity-80 transition-all duration-300 group"
                    >
                      <img src={TrintyLogo} alt="Trinity Studio" className="h-4 md:h-5 w-auto group-hover:scale-110 transition-transform duration-300" />
                      <span className="ml-1 font-medium group-hover:text-white transition-colors duration-300">Trinity Studio</span>
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;