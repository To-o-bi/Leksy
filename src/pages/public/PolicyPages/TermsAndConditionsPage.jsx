import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, Phone, Instagram } from 'lucide-react';

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

const TermsAndConditionsPage = () => {
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
                        <FileText className="mx-auto h-12 w-12 text-pink-500" />
                        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                            Terms & Conditions
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Effective Date: {effectiveDate}
                        </p>
                    </div>

                    <div className="space-y-10">
                        <Section title="About Us" number={1}>
                            <p>Leksy Cosmetics is a beauty and skincare e-commerce brand offering premium cosmetic products and personalized consultation services. Our website allows customers to shop, book expert beauty consultations, and receive guidance tailored to their skin and beauty needs.</p>
                        </Section>

                        <Section title="Eligibility" number={2}>
                            <p>To use our services, you must be at least 18 years old or have the consent of a parent or guardian. By using our platform, you confirm that you meet these requirements.</p>
                        </Section>

                        <Section title="Products & Consultations" number={3}>
                            <ul className="list-disc list-outside space-y-2 pl-5">
                                <li>All products are described as accurately as possible.</li>
                                <li>Our consultation service connects users with licensed or experienced beauty consultants for personalized advice.</li>
                                <li>Consultation appointments are to be booked through our official website and are subject to availability.</li>
                                <li>Consultations are non-transferable and may be rescheduled with at least 24 hours’ notice.</li>
                            </ul>
                        </Section>

                        <Section title="Orders & Payments" number={4}>
                            <ul className="list-disc list-outside space-y-2 pl-5">
                                <li>Orders must be placed via our website or authorized sales channels.</li>
                                <li>Full payment is required to confirm product orders or consultation bookings.</li>
                                <li>Accepted payment methods include Paystack, Flutterwave, and bank transfer (where available).</li>
                                <li>Leksy Cosmetics reserves the right to refuse or cancel any order or appointment at its discretion.</li>
                            </ul>
                        </Section>

                        <Section title="Shipping & Delivery" number={5}>
                             <p>We deliver products both locally and internationally:</p>
                             <ul className="list-disc list-outside space-y-2 pl-5">
                                <li><strong>Lagos State:</strong> 1–3 working days</li>
                                <li><strong>Other Nigerian States:</strong> 3–5 working days</li>
                                <li><strong>Outside Nigeria:</strong> 5–7 working days</li>
                            </ul>
                            <p>Please ensure your delivery address is correct. Leksy Cosmetics is not responsible for delays due to incorrect details or courier issues. Tracking information will be provided when your order is shipped.</p>
                        </Section>

                        <Section title="Returns & Refunds" number={6}>
                            <p>You may request a return within <strong>3 days</strong> of receiving your order if the product is damaged, wrong, or expired.</p>
                             <ul className="list-disc list-outside space-y-2 pl-5">
                                <li>Items must be unused, in original condition, and accompanied by proof of purchase.</li>
                                <li>Due to hygiene reasons, we do not accept returns for opened or used products.</li>
                                <li>Refunds (if approved) will be processed within 7–10 business days.</li>
                            </ul>
                            <h3 className="text-lg font-semibold text-gray-800 pt-2">Consultation Bookings:</h3>
                             <ul className="list-disc list-outside space-y-2 pl-5">
                                <li>Cancellations or reschedules must be made at least 24 hours before your appointment.</li>
                                <li>Missed consultations without prior notice are non-refundable.</li>
                            </ul>
                        </Section>
                        
                        <Section title="Cancellation Policy" number={7}>
                             <ul className="list-disc list-outside space-y-2 pl-5">
                                <li>Orders may be canceled within <strong>1 hour</strong> of placement if not already shipped.</li>
                                <li>Consultations may be rescheduled with 24-hour notice.</li>
                                <li>For cancellations, contact support at <a href="mailto:support@leksycosmetics.com" className="text-pink-600 font-medium hover:underline">support@leksycosmetics.com</a>.</li>
                            </ul>
                        </Section>

                        <Section title="Privacy Policy" number={8}>
                            <p>We collect and securely store personal data for order fulfillment and service delivery. Your data is never sold or shared with third parties without your consent. Consultations are confidential and conducted professionally.</p>
                            <p>Full details are available in our <Link to="/policies/privacy" className="text-pink-600 font-medium hover:underline">Privacy Policy</Link>.</p>
                        </Section>
                        
                        <Section title="Intellectual Property" number={9}>
                            <p>All content—logos, product images, text, videos, and branding—belongs to Leksy Cosmetics. Reproduction or use without permission is prohibited.</p>
                        </Section>

                        <Section title="User Conduct" number={10}>
                             <p>Users must not:</p>
                             <ul className="list-disc list-outside space-y-2 pl-5">
                                <li>Provide false information</li>
                                <li>Post offensive or abusive content</li>
                                <li>Attempt to compromise our website or services</li>
                            </ul>
                             <p>Violations may lead to access restrictions or legal action.</p>
                        </Section>

                        <Section title="Disclaimer" number={11}>
                            <p>Leksy Cosmetics provides product and consultation services for informational and beauty enhancement purposes. We do not diagnose or treat medical skin conditions. Users are advised to conduct patch tests and consult a dermatologist where necessary.</p>
                        </Section>

                        <Section title="Limitation of Liability" number={12}>
                             <p>Leksy Cosmetics will not be liable for indirect or consequential damages arising from product use, consultation advice, or service access. Use our products and services at your own discretion.</p>
                        </Section>

                        <Section title="Modifications" number={13}>
                            <p>These terms may be updated periodically. Continued use of the site means you accept any changes.</p>
                        </Section>

                        <Section title="Governing Law" number={15}>
                            <p>These policies are governed by the laws of the Federal Republic of Nigeria.</p>
                        </Section>

                         <Section title="Contact Us" number={14}>
                            <p>For support, feedback, or inquiries:</p>
                             <div className="space-y-2 pt-2">
                                <p className="flex items-center">
                                    <Mail className="w-5 h-5 mr-3 text-pink-500" />
                                    <a href="mailto:support@leksycosmetics.com" className="text-pink-600 font-medium hover:underline">support@leksycosmetics.com</a>
                                </p>
                                <p className="flex items-center">
                                    <Phone className="w-5 h-5 mr-3 text-pink-500" />
                                    <a href="tel:+234-xxx-xxx-xxxx" className="text-pink-600 font-medium hover:underline">+234-xxx-xxx-xxxx</a>
                                </p>
                                <p className="flex items-center">
                                    <Instagram className="w-5 h-5 mr-3 text-pink-500" />
                                    <span>Instagram & Snapchat: @leksycosmetics</span>
                                </p>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default TermsAndConditionsPage;