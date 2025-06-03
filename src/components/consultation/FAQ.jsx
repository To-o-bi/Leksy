import React from 'react'

const FAQ = () => {
  return (
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
  )
}

export default FAQ
