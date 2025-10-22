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
  <div className="w-1/2 md:w-1/3 lg:w-1/4 px-3 sm:px-4 mb-6 sm:mb-8">
    <h3 className="text-white font-semibold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl">{title}</h3>
    <ul className="space-y-2 sm:space-y-2.5">
      {links.map((link) => (
        <li key={link.path + link.label}>
          <Link 
            to={link.path} 
            className="text-gray-100 hover:text-white transition-colors duration-300 text-sm sm:text-base flex items-center group"
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
    { label: 'Track Order', path: '/contact' },
    { label: 'Wishlist', path: '/wishlist' },
    { label: 'Checkout', path: '/checkout' },
    { label: 'Cart', path: '/cart' }
  ];

  const shopLinks = [
    { label: 'All Products', path: '/shop' },
    { label: 'New Arrivals', path: '/shop' },
    { label: 'Best Sellers', path: '/shop' },
    { label: 'Blog', path: '/' },
    { label: 'Skin Type Finder', path: '/consultation' }
  ];

  const infoLinks = [
    { label: 'About Us', path: '/' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Shipping Policy', path: '/policies/shipping' },
    { label: 'Privacy Policy', path: '/policies/privacy' },
    { label: 'Terms & Conditions', path: '/policies/terms-and-conditions' },
  ];

  return (
    <footer className="bg-white">
      <style>{bubbleAnimationStyles}</style>
      
      <div>
        <Newsletter />
      </div>
      
      <div className="w-full relative"> 
        <div 
          className="bg-pink-500 py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden w-full"
          style={{
            backgroundImage: `url(${footerBg})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundBlendMode: 'multiply' 
          }}
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-pink-500 opacity-80"></div>
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-white opacity-5 sm:opacity-10"
                  style={{
                    width: `${Math.random() * 40 + 20}px`,
                    height: `${Math.random() * 40 + 20}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `${Math.random() > 0.5 ? 'bounce' : 'float'} ${Math.random() * 2 + 2}s infinite ease-in-out ${Math.random() * 1}s`,
                    animationFillMode: 'both'
                  }}
                ></div>
              ))}
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i + 12}
                  className="absolute rounded-full bg-white opacity-10 hidden md:block"
                  style={{
                    width: `${Math.random() * 80 + 50}px`,
                    height: `${Math.random() * 80 + 50}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `${Math.random() > 0.5 ? 'bounce' : 'float'} ${Math.random() * 2 + 3}s infinite ease-in-out ${Math.random() * 1}s`,
                    animationFillMode: 'both'
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            {/* About Section - Full Width on Mobile */}
            <div className="mb-6 sm:mb-8 lg:mb-10 pb-6 sm:pb-8 border-b border-pink-300 border-opacity-30">
              <div className="max-w-xl lg:max-w-none">
                <div className="flex items-center mb-3 sm:mb-4">
                  <h3 className="text-white font-bold text-lg sm:text-xl lg:text-2xl">About Leksy Cosmetics</h3>
                </div>
                <p className="text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                  Leksy Cosmetic is a leading skincare brand in Nigeria, dedicated to providing premium beauty and skincare products that enhance and preserve your natural glow.
                </p>
                <div className="transform scale-90 sm:scale-100 origin-left">
                  <SocialLinks />
                </div>
              </div>
            </div>

            {/* Link Columns - 2 columns on mobile, 3 on tablet, 4 on desktop */}
            <div className="flex flex-wrap -mx-3 sm:-mx-4">
              <FooterLinkGroup title="My Account" links={accountLinks} />
              <FooterLinkGroup title="Shop" links={shopLinks} />
              <FooterLinkGroup title="Information" links={infoLinks} />
            </div>
            
            {/* Bottom Bar */}
            <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-pink-300 border-opacity-30 relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 gap-4">
                {/* Logo */}
                <div className="order-2 lg:order-1">
                  <img src={logoWhite} alt="Leksy Cosmetics" className="h-6 sm:h-8 md:h-10"/>
                </div>
                
                {/* Copyright */}
                <p className="text-sm sm:text-base text-gray-100 text-center order-1 lg:order-2">
                  Leksy Cosmetics © {new Date().getFullYear()}. All rights reserved.
                </p>

                {/* Developer Credit */}
                <div className="flex items-center order-3">
                  <p className="text-gray-100 text-sm sm:text-base flex flex-col sm:flex-row items-center font-light text-center sm:text-left">
                    <span className="mb-1 sm:mb-0">Designed and Developed by</span>
                    <a 
                      href="https://trinitystudioltd.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center sm:ml-2 hover:opacity-80 transition-all duration-300 group"
                    >
                      <img src={TrintyLogo} alt="Trinity Studio" className="h-3 sm:h-4 md:h-5 w-auto group-hover:scale-110 transition-transform duration-300" />
                      <span className="ml-1 font-medium group-hover:text-white transition-colors duration-300 text-sm sm:text-base">Trinity Studio</span>
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