import React from 'react';
import { Shield, Mail, Phone, ExternalLink } from 'lucide-react';

// Helper component for consistent section styling
const Section = ({ title, number, children }) => (
    <div className="space-y-4 pt-6 border-t border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <span className="text-pink-500 mr-3">{number}.</span>
            {title}
        </h2>
        <div className="text-gray-700 leading-relaxed space-y-3 pl-8">
            {children}
        </div>
    </div>
);

const PrivacyPolicyPage = () => {
    // Set the effective date dynamically or keep it as a string
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
                        <Shield className="mx-auto h-12 w-12 text-pink-500" />
                        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                            Privacy Policy
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Effective Date: {effectiveDate}
                        </p>
                    </div>

                    <div className="text-center bg-pink-50 border border-pink-200 rounded-lg p-4 mb-10 text-sm text-pink-800 space-y-2">
                        <p><strong>Website:</strong> <a href="https://www.leksycosmetics.com" target="_blank" rel="noopener noreferrer" className="hover:underline">www.leksycosmetics.com</a></p>
                        <p><strong>Email:</strong> <a href="mailto:support@leksycosmetics.com" className="hover:underline">support@leksycosmetics.com</a></p>
                        <p><strong>Phone:</strong> <a href="tel:+234-xxx-xxx-xxxx" className="hover:underline">+234-xxx-xxx-xxxx</a></p>
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-600 mb-10">
                        <p>
                            Leksy Cosmetics ("we," "us," or "our") values your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you visit our website or use our services.
                        </p>
                    </div>

                    <div className="space-y-10">
                        <Section title="Information We Collect" number={1}>
                            <p>We may collect the following types of information:</p>
                            <h3 className="text-lg font-semibold text-gray-800 pt-2">a. Personal Information</h3>
                            <ul className="list-disc list-outside space-y-1 pl-5">
                                <li>Full name</li>
                                <li>Email address</li>
                                <li>Phone number</li>
                                <li>Delivery address</li>
                                <li>Billing information</li>
                                <li>Skin concerns/preferences (for consultations)</li>
                            </ul>
                            <h3 className="text-lg font-semibold text-gray-800 pt-2">b. Non-Personal Information</h3>
                            <ul className="list-disc list-outside space-y-1 pl-5">
                                <li>Device type</li>
                                <li>Browser type</li>
                                <li>IP address</li>
                                <li>Pages visited</li>
                                <li>Referral source</li>
                                <li>Session duration</li>
                            </ul>
                        </Section>

                        <Section title="How We Use Your Information" number={2}>
                             <p>We use your information to:</p>
                            <ul className="list-disc list-outside space-y-1 pl-5">
                                <li>Process and deliver product orders</li>
                                <li>Schedule and manage consultations</li>
                                <li>Send order updates and confirmations</li>
                                <li>Improve our website and user experience</li>
                                <li>Respond to customer service inquiries</li>
                                <li>Provide personalized beauty recommendations</li>
                                <li>Send promotional content (with your consent)</li>
                            </ul>
                        </Section>

                        <Section title="How We Share Your Information" number={3}>
                            <p className="font-semibold text-gray-800">We do not sell or rent your personal data.</p>
                            <p>We may share your data only with:</p>
                             <ul className="list-disc list-outside space-y-1 pl-5">
                                <li><span className="font-semibold">Third-party logistics partners</span> for delivery.</li>
                                <li><span className="font-semibold">Payment processors</span> like Paystack or Flutterwave.</li>
                                <li><span className="font-semibold">Consultants/beauty experts</span> (only if you book a session).</li>
                                <li><span className="font-semibold">Legal authorities,</span> if required by law or to protect our rights.</li>
                            </ul>
                        </Section>

                        <Section title="Data Security" number={4}>
                            <p>We use encryption, SSL protocols, and secure data storage systems to protect your information. Only authorized personnel have access to your personal data.</p>
                            <p>However, no system is 100% secure. We encourage you to protect your login credentials.</p>
                        </Section>

                        <Section title="Cookies and Tracking Technologies" number={5}>
                             <p>Our website uses cookies to:</p>
                            <ul className="list-disc list-outside space-y-1 pl-5">
                                <li>Remember your cart and login state</li>
                                <li>Track visitor behavior for analytics</li>
                                <li>Personalize your experience</li>
                            </ul>
                            <p>You may disable cookies in your browser, but some features may not work as intended.</p>
                        </Section>

                        <Section title="Your Rights" number={6}>
                            <p>You have the right to:</p>
                             <ul className="list-disc list-outside space-y-1 pl-5">
                                <li>Access the personal data we hold about you</li>
                                <li>Correct inaccurate or outdated information</li>
                                <li>Withdraw consent to marketing communications</li>
                                <li>Request deletion of your account or data (subject to legal limits)</li>
                            </ul>
                            <p>To exercise any of these rights, please contact us at <a href="mailto:support@leksycosmetics.com" className="text-pink-600 font-medium hover:underline">support@leksycosmetics.com</a>.</p>
                        </Section>

                        <Section title="Third-Party Links" number={7}>
                            <p>Our website may contain links to third-party sites (e.g., payment gateways or Instagram). We are not responsible for the privacy practices of those platforms.</p>
                        </Section>

                        <Section title="Data Retention" number={8}>
                            <p>We retain your personal information for as long as necessary:</p>
                             <ul className="list-disc list-outside space-y-1 pl-5">
                                <li>To fulfill orders and services</li>
                                <li>To comply with legal obligations</li>
                                <li>For internal reporting or auditing</li>
                            </ul>
                        </Section>

                        <Section title="Updates to This Policy" number={9}>
                             <p>We may update this Privacy Policy from time to time. Changes will be posted on this page, and we encourage you to review it periodically.</p>
                        </Section>

                        <Section title="Contact Us" number={10}>
                            <p>If you have any questions or concerns regarding your privacy, please don't hesitate to reach out:</p>
                            <div className="space-y-2 pt-2">
                                <p className="flex items-center">
                                    <Mail className="w-5 h-5 mr-3 text-pink-500" />
                                    <a href="mailto:support@leksycosmetics.com" className="text-pink-600 font-medium hover:underline">
                                        support@leksycosmetics.com
                                    </a>
                                </p>
                                <p className="flex items-center">
                                    <Phone className="w-5 h-5 mr-3 text-pink-500" />
                                    <a href="tel:+234-xxx-xxx-xxxx" className="text-pink-600 font-medium hover:underline">
                                        +234-xxx-xxx-xxxx
                                    </a>
                                </p>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PrivacyPolicyPage;