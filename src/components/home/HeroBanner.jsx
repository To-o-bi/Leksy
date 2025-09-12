import React, { useState, useEffect } from 'react';

const HeroBanner = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [socialExpanded, setSocialExpanded] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const toggleSocial = () => {
    setSocialExpanded(!socialExpanded);
  };

  return (
    <section className="relative h-screen bg-white overflow-hidden flex flex-col font-sans">
      {/* Decorative floating petals */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-8 h-8 bg-pink-200 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-pink-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-10 h-10 bg-pink-100 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-60 left-1/4 w-4 h-4 bg-pink-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-60 right-1/4 w-6 h-6 bg-pink-300 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-32 right-1/3 w-5 h-5 bg-pink-200 rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute top-1/3 left-1/2 w-6 h-6 bg-pink-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-pink-100 rounded-full opacity-40 animate-bounce"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 flex flex-col h-full">
        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto pt-8 pb-6 flex-shrink-0">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 leading-tight text-gray-800 flex items-center justify-center gap-x-2">
            Your <span className="text-pink-500">Beauty,</span> Our Priority
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Shop our best-selling skincare & cosmetics, designed for radiant, flawless skin.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-2">
            <button 
              className="group bg-pink-500 text-white py-3 px-8 rounded-full font-semibold text-base hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              Explore our Products
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              className="group border-2 border-pink-500 text-pink-500 py-3 px-8 rounded-full font-semibold text-base hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              Book Consultation
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0v1m0-1h6m-6 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Image Card Section in Arc */}
        <div className="flex-grow relative flex items-center justify-center -mt-8 sm:-mt-12">
           <div className="flex items-center justify-center space-x-[-1.5rem] sm:space-x-[-1rem]">
                {/* Card 1 - Slides from center to left */}
                <div className={`group transform transition-all duration-1000 ease-out w-44 h-60 sm:w-52 sm:h-72 cursor-pointer ${
                  isAnimating 
                    ? 'rotate-[-18deg] translate-y-12 translate-x-0 z-0 opacity-100' 
                    : 'rotate-[2deg] -translate-y-6 translate-x-32 z-0 opacity-0'
                } hover:scale-110 hover:rotate-[-10deg] hover:z-40`} 
                style={{ transitionDelay: isAnimating ? '800ms' : '0ms' }}>
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-pink-50 to-white p-1 shadow-2xl hover:shadow-pink-200/50">
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner">
                            <img src="/assets/images/hero/card-1.jpg" alt="Woman with face mask" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 to-pink-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    </div>
                </div>
                
                {/* Card 2 - Slides from center to left */}
                <div className={`group transform transition-all duration-1000 ease-out w-44 h-60 sm:w-52 sm:h-72 cursor-pointer ${
                  isAnimating 
                    ? 'rotate-[-8deg] -translate-y-2 translate-x-0 z-10 opacity-100' 
                    : 'rotate-[2deg] -translate-y-6 translate-x-16 z-10 opacity-0'
                } hover:scale-110 hover:rotate-[-2deg] hover:z-40`}
                style={{ transitionDelay: isAnimating ? '600ms' : '0ms' }}>
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-pink-100 to-white p-1 shadow-2xl hover:shadow-pink-300/60">
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner">
                            <img src="/assets/images/hero/card-2.jpg" alt="Woman with face mask" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-400/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-300 to-pink-500 rounded-3xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-500"></div>
                    </div>
                </div>
                
                {/* Card 3 - Center (Featured) - First to animate */}
                <div className={`group transform transition-all duration-1800 ease-in-out w-48 h-64 sm:w-56 sm:h-76 cursor-pointer ${
                  isAnimating 
                    ? 'rotate-[2deg] -translate-y-6 translate-x-0 z-20 opacity-100' 
                    : 'rotate-[2deg] translate-y-8 translate-x-0 z-20 opacity-0'
                } hover:scale-110 hover:rotate-[1deg] hover:z-40`}
                style={{ transitionDelay: isAnimating ? '200ms' : '0ms' }}>
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-pink-200 to-pink-50 p-1.5 shadow-2xl hover:shadow-pink-400/70">
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner">
                            <img src="/assets/images/hero/card-3.jpg" alt="Woman with face mask" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-400 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                        {/* Sparkle effect for center card */}
                        <div className="absolute top-2 right-2 w-3 h-3 bg-pink-400 rounded-full opacity-60 animate-ping"></div>
                        <div className="absolute bottom-4 left-3 w-2 h-2 bg-pink-300 rounded-full opacity-40 animate-pulse"></div>
                    </div>
                </div>
                
                {/* Card 4 - Slides from center to right */}
                <div className={`group transform transition-all duration-1000 ease-out w-44 h-60 sm:w-52 sm:h-72 cursor-pointer ${
                  isAnimating 
                    ? 'rotate-[8deg] -translate-y-2 translate-x-0 z-10 opacity-100' 
                    : 'rotate-[2deg] -translate-y-6 -translate-x-16 z-10 opacity-0'
                } hover:scale-110 hover:rotate-[2deg] hover:z-40`}
                style={{ transitionDelay: isAnimating ? '600ms' : '0ms' }}>
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-pink-100 to-white p-1 shadow-2xl hover:shadow-pink-300/60">
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner">
                            <img src="/assets/images/hero/card-4.jpg" alt="Woman with face mask" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-400/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-pink-300 rounded-3xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-500"></div>
                    </div>
                </div>
                
                {/* Card 5 - Slides from center to right */}
                <div className={`group transform transition-all duration-1000 ease-out w-44 h-60 sm:w-52 sm:h-72 cursor-pointer ${
                  isAnimating 
                    ? 'rotate-[18deg] translate-y-12 translate-x-0 z-0 opacity-100' 
                    : 'rotate-[2deg] -translate-y-6 -translate-x-32 z-0 opacity-0'
                } hover:scale-110 hover:rotate-[10deg] hover:z-40 hover:-translate-y-6 hover:shadow-2xl`}
                style={{ transitionDelay: isAnimating ? '800ms' : '0ms' }}>
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-pink-50 to-white p-1 shadow-2xl group-hover:shadow-pink-200/50 transition-all duration-500">
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner">
                            <img src="/assets/images/hero/card-5.jpg" alt="Woman with face mask" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-pink-400 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className={`relative z-10 text-center pb-4 flex-shrink-0 -mt-8 transform transition-all duration-1000 ease-out ${
          isAnimating 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-6 opacity-0'
        }`}
        style={{ transitionDelay: isAnimating ? '1200ms' : '0ms' }}>
            <div className="inline-block cursor-pointer group">
                {/* Cylinder-like container */}
                <div className="relative w-8 h-16 border-2 border-gray-300 rounded-full flex items-end justify-center pb-2 mb-3 group-hover:border-pink-400 transition-colors duration-300 bg-white/50">
                    {/* Full arrow inside at bottom that animates up and down */}
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="w-4 h-4 text-gray-400 group-hover:text-pink-400 transition-colors duration-300 animate-bounce" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth={2.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l7-7m-7 7l-7-7" />
                    </svg>
                    
                    {/* Optional: Add a subtle outer glow on hover */}
                    <div className="absolute inset-0 rounded-full border-2 border-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
            </div>
            
            <p className="mt-1 text-gray-500 text-sm tracking-widest font-light">Your Skincare Journey Starts Here</p>
        </div>

        {/* Social Media Widget - Moved to right */}
        <div className="fixed bottom-8 right-8 z-50">
          {/* Social Media Icons - Float upward when expanded */}
          <div className={`absolute bottom-16 right-0 flex flex-col space-y-3 transition-all duration-500 ${
            socialExpanded 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}>

            {/* Instagram */}
            <div className={`transform transition-all duration-300 ${socialExpanded ? 'translate-y-0' : 'translate-y-4'}`}
                 style={{ transitionDelay: socialExpanded ? '150ms' : '0ms' }}>
              <a href="https://www.instagram.com/leksy.cosmetics?igsh=MWR5OWtpNG44ZHR2Mw==" className="group flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">              
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="Instagram" width="24" height="24">
                <title>Instagram</title>
                <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 6.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z"/>
              </svg>
              </a>
            </div>

            {/* Email */}
            <div className={`transform transition-all duration-300 ${socialExpanded ? 'translate-y-0' : 'translate-y-4'}`}
                 style={{ transitionDelay: socialExpanded ? '200ms' : '0ms' }}>
              <a href="mailto:hello@beauty.com" className="group flex items-center justify-center w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>

            {/* Snapchat */}
            <div
              className={`transform transition-all duration-300 ${
                socialExpanded ? "translate-y-0" : "translate-y-4"
              }`}
              style={{ transitionDelay: socialExpanded ? "250ms" : "0ms" }}
            >
              <a
                href="https://snapchat.com/t/dqHNOMmX"
                className="group flex items-center justify-center w-14 h-14 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22" 
                  height="22"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="0.6"   
                  className="bi bi-snapchat"
                >
                  <path d="M15.943 11.526c-.111-.303-.323-.465-.564-.599a1 1 0 0 0-.123-.064l-.219-.111c-.752-.399-1.339-.902-1.746-1.498a3.4 3.4 0 0 1-.3-.531c-.034-.1-.032-.156-.008-.207a.3.3 0 0 1 .097-.1c.129-.086.262-.173.352-.231.162-.104.289-.187.371-.245.309-.216.525-.446.66-.702a1.4 1.4 0 0 0 .069-1.16c-.205-.538-.713-.872-1.329-.872a1.8 1.8 0 0 0-.487.065c.006-.368-.002-.757-.035-1.139-.116-1.344-.587-2.048-1.077-2.61a4.3 4.3 0 0 0-1.095-.881C9.764.216 8.92 0 7.999 0s-1.76.216-2.505.641c-.412.232-.782.53-1.097.883-.49.562-.96 1.267-1.077 2.61-.033.382-.04.772-.036 1.138a1.8 1.8 0 0 0-.487-.065c-.615 0-1.124.335-1.328.873a1.4 1.4 0 0 0 .067 1.161c.136.256.352.486.66.701.082.058.21.14.371.246l.339.221a.4.4 0 0 1 .109.11c.026.053.027.11-.012.217a3.4 3.4 0 0 1-.295.52c-.398.583-.968 1.077-1.696 1.472-.385.204-.786.34-.955.8-.128.348-.044.743.28 1.075q.18.189.409.31a4.4 4.4 0 0 0 1 .4.7.7 0 0 1 .202.09c.118.104.102.26.259.488q.12.178.296.3c.33.229.701.243 1.095.258.355.014.758.03 1.217.18.19.064.389.186.618.328.55.338 1.305.802 2.566.802 1.262 0 2.02-.466 2.576-.806.227-.14.424-.26.609-.321.46-.152.863-.168 1.218-.181.393-.015.764-.03 1.095-.258a1.14 1.14 0 0 0 .336-.368c.114-.192.11-.327.217-.42a.6.6 0 0 1 .19-.087 4.5 4.5 0 0 0 1.014-.404c.16-.087.306-.2.429-.336l.004-.005c.304-.325.38-.709.256-1.047m-1.121.602c-.684.378-1.139.337-1.493.565-.3.193-.122.61-.34.76-.269.186-1.061-.012-2.085.326-.845.279-1.384 1.082-2.903 1.082s-2.045-.801-2.904-1.084c-1.022-.338-1.816-.14-2.084-.325-.218-.15-.041-.568-.341-.761-.354-.228-.809-.187-1.492-.563-.436-.24-.189-.39-.044-.46 2.478-1.199 2.873-3.05 2.89-3.188.022-.166.045-.297-.138-.466-.177-.164-.962-.65-1.18-.802-.36-.252-.52-.503-.402-.812.082-.214.281-.295.49-.295a1 1 0 0 1 .197.022c.396.086.78.285 1.002.338q.04.01.082.011c.118 0 .16-.06.152-.195-.026-.433-.087-1.277-.019-2.066.094-1.084.444-1.622.859-2.097.2-.229 1.137-1.22 2.93-1.22 1.792 0 2.732.987 2.931 1.215.416.475.766 1.013.859 2.098.068.788.009 1.632-.019 2.065-.01.142.034.195.152.195a.4.4 0 0 0 .082-.01c.222-.054.607-.253 1.002-.338a1 1 0 0 1 .197-.023c.21 0 .409.082.49.295.117.309-.04.56-.401.812-.218.152-1.003.638-1.18.802-.184.169-.16.3-.139.466.018.14.413 1.991 2.89 3.189.147.073.394.222-.041.464"/>
                </svg>
              </a>
            </div>


            {/* WhatsApp */}
            <div className={`transform transition-all duration-300 ${socialExpanded ? 'translate-y-0' : 'translate-y-4'}`}
                 style={{ transitionDelay: socialExpanded ? '300ms' : '0ms' }}>
              <a href="http://wa.me/2349014425540" className="group flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Main Toggle Button */}
          <button
            onClick={toggleSocial}
            className={`group flex items-center justify-center w-14 h-14 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
              socialExpanded ? 'rotate-45' : 'rotate-0'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {/* Backdrop overlay when expanded */}
          {socialExpanded && (
            <div 
              className="fixed inset-0 -z-10"
              onClick={() => setSocialExpanded(false)}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;