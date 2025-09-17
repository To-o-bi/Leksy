import React from 'react';
import ConsultationForm from '../../components/consultation/consultationFormFold/ConsultationForm';
import WhyChooseUs from '../../components/consultation/WhyChooseUs';
import Faq from '../../components/consultation/faq';
import HowItWorks from '../../components/consultation/HowItWorks';
import CTA from '../../components/consultation/CTA';

const ConsultationPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative py-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-[center_10%]"
            style={{
              backgroundImage: "url('public/assets/images/banners/fine.jpg')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-pink-400 opacity-60"></div>
          
          {/* Floating Bubbles */}
          <div className="absolute inset-0">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-pink-200 opacity-20"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Personalized Skincare Consultation
            </h1>
            <p className="text-lg text-white mb-8">
              Get expert advice tailored to your unique skin needs and concerns.
              Our specialists will create a customized routine just for you.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <ConsultationForm />
      </div>

      <WhyChooseUs />
      <HowItWorks />
      <Faq />
      <CTA />

      {/* CSS for floating animation */}
      <style jsx="true">{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default ConsultationPage;