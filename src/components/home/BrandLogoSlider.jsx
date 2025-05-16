import React, { useEffect, useRef, useState } from 'react';

const BrandLogoSlider = () => {
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  
  const brands = [
    { id: 1, name: 'CeraVe', logo: '/assets/images/icons/cerave.png' },
    { id: 2, name: 'ULTA', logo: '/assets/images/icons/Ulta.png' },
    { id: 3, name: 'Cetaphil', logo: '/assets/images/icons/ceta.png' },
    { id: 4, name: 'L\'ORÉAL', logo: '/assets/images/icons/oreal.png' },
    { id: 5, name: 'Dove', logo: '/assets/images/icons/dove.png' },
    { id: 6, name: 'CeraVe', logo: '/assets/images/icons/cerave.png' },
    { id: 7, name: 'Dove', logo: '/assets/images/icons/dove.png' },
    { id: 8, name: 'ULTA', logo: '/assets/images/icons/Ulta.png' },
    { id: 9, name: 'Cetaphil', logo: '/assets/images/icons/ceta.png' },
    { id: 10, name: 'L\'ORÉAL', logo: '/assets/images/icons/oreal.png' },
    { id: 11, name: 'Dove', logo: '/assets/images/icons/dove.png' },
  ];
  
  // Create a combined array for continuous scrolling (only duplicate once is enough)
  const displayBrands = [...brands, ...brands];

  useEffect(() => {
    // Only run animation when component is mounted and visible
    if (!isVisible || !sliderRef.current) return;

    const slider = sliderRef.current;
    const container = containerRef.current;
    let animationId;
    let position = 0;
    let brandItemWidth = 0;
    let resetPoint = 0;
    
    // Calculate initial dimensions
    const calculateDimensions = () => {
      if (slider.children.length === 0) return;
      
      // Get width of a single brand item including margins
      const firstItem = slider.children[0];
      const itemStyle = window.getComputedStyle(firstItem);
      const marginLeft = parseInt(itemStyle.marginLeft);
      const marginRight = parseInt(itemStyle.marginRight);
      
      brandItemWidth = firstItem.offsetWidth + marginLeft + marginRight;
      
      // Width of a single set of brands
      const singleSetWidth = brands.length * brandItemWidth;
      resetPoint = -singleSetWidth;
    };
    
    // Initial calculation
    setTimeout(calculateDimensions, 100); // Small delay to ensure DOM is ready
    
    const animate = () => {
      // Move the slider
      position -= 0.5;
      
      // Reset position when first set of logos is scrolled past
      if (position <= resetPoint) {
        position = 0;
      }
      
      slider.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };
    
    // Start animation after a short delay to ensure dimensions are calculated
    setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 200);
    
    // Pause animation on hover for better user experience
    const handleMouseEnter = () => {
      cancelAnimationFrame(animationId);
    };
    
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };
    
    // Add event listeners
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', calculateDimensions);
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', calculateDimensions);
    };
  }, [isVisible, brands.length]);

  // Handle visibility changes for performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div className="py-12 bg-gradient-to-r from-pink-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-center text-gray-500 text-sm font-medium uppercase tracking-wider mb-8">Trusted by leading brands</h3>
        
        <div className="relative" ref={containerRef}>
          {/* Add subtle gradient overlay on edges for fade effect */}
          <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-pink-50 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10"></div>
          
          <div className="flex items-center whitespace-nowrap py-4 overflow-hidden">
            <div className="flex items-center" ref={sliderRef}>
              {displayBrands.map((brand, index) => (
                <div 
                  key={`${brand.id}-${index}`} 
                  className="mx-10 flex items-center justify-center transform transition-all duration-300 hover:scale-110"
                  style={{ minWidth: '120px' }} // Enforce minimum width for each item
                >
                  <img 
                    src={brand.logo} 
                    alt={`${brand.name} logo`} 
                    className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLogoSlider;