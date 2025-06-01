import React, { useState } from 'react';
import HeroBanner from '../../components/consultation/HeroBanner';
import Form from '../../components/consultation/form';
// import Button from '../components/common/Button';

const ConsultationPage = () => {  

  return (
    <div>
    <HeroBanner />

    <Form />

      {/* Why Choose Our Consultation Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Skincare Consultation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg-pink">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Specialists</h3>
              <p className="text-gray-600">
                Our licensed skincare specialists have years of experience and stay updated with the latest skincare science.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Approach</h3>
              <p className="text-gray-600">
                We analyze your unique skin condition and create a customized skincare routine that targets your specific concerns.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ongoing Support</h3>
              <p className="text-gray-600">
                Receive follow-up support to track your progress and make adjustments to your routine as your skin evolves.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8 md:mb-0">
            <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Book Consultation</h3>
            <p className="text-gray-600 max-w-xs">
              Fill out our form with your skin concerns and schedule a convenient time.
            </p>
          </div>
          
          <div className="hidden md:block w-24 h-0.5 bg-pink-200"></div>
          
          <div className="flex flex-col items-center text-center mb-8 md:mb-0">
            <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Skin Analysis</h3>
            <p className="text-gray-600 max-w-xs">
              Our specialist will analyze your skin and discuss your goals during the consultation.
            </p>
          </div>
          
          <div className="hidden md:block w-24 h-0.5 bg-pink-200"></div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom Routine</h3>
            <p className="text-gray-600 max-w-xs">
              Receive a personalized skincare routine and product recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">What products does Leksy Cosmetics offer?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                We offer a wide range of beauty and skincare products including facial creams, body lotions, oils, soaps, serums, and more—carefully selected to enhance and protect your skin.
                </div>
              </details>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">How can I book a consultation?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                Click on the “Book a Consultation” button on our homepage. You can choose your preferred date, time, and consultation type. Payments are made securely online during booking.
                </div>
              </details>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">Is there a fee for the consultation?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  Yes, there is a consultation fee of ₦5,000, which is fully redeemable against product purchases made within 30 days of your consultation. This ensures our specialists can dedicate quality time to addressing your specific needs.
                </div>
              </details>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">Do you offer international shipping?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                Yes, we do! Leksy Cosmetics offers international shipping to selected countries. Shipping fees and delivery times vary based on your location. At checkout, you will see available options for your region.
                </div>
              </details>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">How long does delivery take?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                Orders within Lagos are typically delivered in 1–2 business days, while orders to other states take 3–5 business days. You'll receive tracking details once your order ships.
                </div>
              </details>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">Can I return or exchange a product?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                Yes, you can return or exchange products within 7 days of delivery if they are unopened and in their original condition. Please read our Return Policy for more details.
                </div>
              </details>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">Will I need to purchase products during or after the consultation?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  There is absolutely no obligation to purchase products during or after your consultation. Our specialists will provide recommendations based on your skin needs, but the decision to purchase is entirely yours.
                </div>
              </details>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">How can I contact Leksy Cosmetics?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                You can reach us via the Contact Us page, send an email to support@leksycosmetics.com, or DM us on snapchat @lexie_luya or Instagram @leksycosmetics.
                </div>
              </details>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">Do you offer discounts or promotions?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                Yes! Follow us on social media and subscribe to our newsletter to stay updated on our exclusive deals, giveaways, and seasonal promos.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-16 bg-gradient-to-r from-pink-500 to-pink-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-pink-500 opacity-75"></div>
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-white opacity-10"
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
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Skincare Routine?
            </h2>
            <p className="text-white text-lg mb-8">
              Book your personalized consultation today and take the first step towards healthier, more radiant skin.
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-3 bg-white text-pink-600 text-lg font-medium rounded-md hover:bg-pink-50 transition-colors"
            >
              Book Your Consultation Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;