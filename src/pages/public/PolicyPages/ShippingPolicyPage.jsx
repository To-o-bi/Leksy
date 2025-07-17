import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, AlertCircle, Phone, Mail } from 'lucide-react';

// Helper component for consistent section styling
const Section = ({ title, number, children }) => (
    <div className="space-y-4 pt-6 border-t border-gray-200 first:pt-0 first:border-t-0">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-start">
            <span className="text-pink-500 mr-3 mt-1">{number}.</span>
            <span>{title}</span>
        </h2>
        <div className="text-gray-700 leading-relaxed space-y-3 pl-8">
            {children}
        </div>
    </div>
);

const ShippingPolicyPage = () => {
    const effectiveDate = new Date('2025-07-17T00:00:00Z').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <main className="bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="bg-white p-8 sm:p-10 rounded-xl shadow-md">
                    <div className="text-center mb-10">
                        <Truck className="mx-auto h-12 w-12 text-pink-500" />
                        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                            Shipping Policy
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Effective Date: {effectiveDate}
                        </p>
                    </div>

                    <div className="space-y-10">
                        <Section title="Delivery Coverage" number={1}>
                            <p>Leksy Cosmetics offers both local and international shipping. We deliver across all 36 states in Nigeria and selected countries outside Nigeria.</p>
                        </Section>
                        
                        <Section title="Delivery Timeframes" number={2}>
                             <p>Estimated delivery times after payment confirmation:</p>
                             <ul className="list-disc list-outside space-y-2 pl-5">
                                <li><strong>Lagos State:</strong> 1–3 working days</li>
                                <li><strong>Other Nigerian States:</strong> 3–5 working days</li>
                                <li><strong>Outside Nigeria:</strong> 5–7 working days</li>
                            </ul>
                            <p className="text-sm text-gray-500"><em>Note: Working days exclude weekends and public holidays.</em></p>
                        </Section>

                        <Section title="Order Processing" number={3}>
                            <ul className="list-disc list-outside space-y-2 pl-5">
                                <li>Orders are processed within <strong>24 hours</strong> of payment confirmation.</li>
                                <li>Orders placed after 5 PM will be processed the next business day.</li>
                                <li>You will receive an order confirmation email followed by a tracking number once the order is shipped.</li>
                            </ul>
                        </Section>

                        <Section title="Delivery Partners" number={4}>
                            <p>We work with trusted third-party logistics partners to ensure timely and secure delivery. These include (but are not limited to):</p>
                            <ul className="list-disc list-outside space-y-2 pl-5">
                                <li>GIG Logistics</li>
                                <li>DHL</li>
                                <li>Dispatch riders (for local deliveries within Lagos)</li>
                                <li>Gabenco Logistics</li>
                                <li>GUO</li>
                                <li>AAJ</li>
                            </ul>
                        </Section>

                        <Section title="Delivery Charges" number={5}>
                             <p>Shipping costs vary depending on your location and the weight of the products. The final shipping cost will be calculated at checkout.</p>
                             <p>Orders above a certain amount may qualify for <strong>free shipping</strong> within Nigeria. This will be indicated at checkout if applicable.</p>
                        </Section>
                        
                        <Section title="Delays" number={6}>
                            <p>While we strive to meet all delivery timelines, delays may occur due to:</p>
                            <ul className="list-disc list-outside space-y-2 pl-5">
                                <li>Weather conditions</li>
                                <li>Customs processing (for international orders)</li>
                                <li>Incomplete or incorrect address information</li>
                                <li>Logistic network disruptions</li>
                            </ul>
                            <p>Leksy Cosmetics is not liable for delays caused by third-party logistics providers.</p>
                        </Section>

                        <Section title="Pick-up Delivery" number={7}>
                            <p>You may arrange for your own dispatch rider to pick up your order from our location.</p>
                            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                               <p className="font-semibold text-gray-800">Pick-up Location:</p>
                               <p>3 Olumorokun Street, Mushin, Lagos.</p>
                               <p className="font-semibold text-gray-800 mt-2">Pick-up Contact:</p>
                               <a href="tel:+2348126141829" className="text-pink-600 hover:underline">+234 812 614 1829</a>
                            </div>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mt-4">
                               <p className="font-semibold text-yellow-800">Please note: ONLY RIDERS are allowed for pick-up as we do not have a walk-in store yet.</p>
                            </div>
                            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-lg mt-4 text-red-800">
                               <p className="font-extrabold text-lg">‼️ IMPORTANT ‼️</p>
                               <p className="font-semibold mt-2">Your rider MUST state the exact pick-up name you provided to us. Once a wrong pick-up name is given, we will not attend to the rider.</p>
                            </div>
                            <p className="font-semibold text-gray-800 mt-4">Pick-up Time: 1pm - 6pm daily.</p>
                        </Section>

                        <Section title="Failed Deliveries" number={8}>
                             <p>If a delivery fails because the customer provided an incorrect address, was unavailable, or refused to accept the order:</p>
                             <ul className="list-disc list-outside space-y-2 pl-5">
                                <li>We will attempt redelivery once after making contact.</li>
                                <li>If the second attempt is unsuccessful, the order will be returned to us. The customer will be responsible for the full cost of re-shipping.</li>
                            </ul>
                        </Section>

                        <Section title="International Shipping" number={9}>
                             <p>Customs duties, taxes, or import fees may apply depending on your country’s regulations. Leksy Cosmetics is not responsible for any additional charges levied by customs during clearance.</p>
                        </Section>

                        <Section title="Tracking Your Order" number={10}>
                            <p>Once your order is dispatched, a tracking number will be sent to you via Email, SMS, or WhatsApp. You can use this number on the courier's website to track the progress of your delivery.</p>
                        </Section>

                        <Section title="Contact Us" number={11}>
                            <p>If you have any questions about your order or our shipping policy, please contact us:</p>
                            <div className="space-y-2 pt-2">
                                <p className="flex items-center">
                                    <Mail className="w-5 h-5 mr-3 text-pink-500" />
                                    <a href="mailto:support@leksycosmetics.com" className="text-pink-600 font-medium hover:underline">support@leksycosmetics.com</a>
                                </p>
                                <p className="flex items-center">
                                    <Phone className="w-5 h-5 mr-3 text-pink-500" />
                                    <a href="tel:09014425540" className="text-pink-600 font-medium hover:underline">09014425540</a>
                                </p>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ShippingPolicyPage;