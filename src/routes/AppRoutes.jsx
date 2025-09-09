import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// --- ADDED: ScrollToTop component ---
// This component will automatically scroll the window to the top on every route change.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Loading fallback for lazy-loaded components
const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-center text-gray-600 mt-4">Loading...</p>
        </div>
    </div>
);

// Public pages
const LoginPage = lazy(() => import('../pages/public/LoginPage'));
const HomePage = lazy(() => import('../pages/public/HomePage'));
const ShopPage = lazy(() => import('../pages/public/ShopPage'));
const ProductDetailPage = lazy(() => import('../pages/public/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/public/CartPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const CheckoutPage = lazy(() => import('../pages/public/CheckoutPage'));
const WishlistPage = lazy(() => import('../pages/public/WishlistPage'));
const ConsultationPage = lazy(() => import('../pages/public/ConsultationPage'));
const ConsultationSuccessPage = lazy(() => import('../components/consultation/ConsultationSuccess'));
const CheckoutSuccessPage = lazy(() => import('../pages/public/CheckoutSuccessPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/public/PolicyPages/PrivacyPolicyPage'));
const TermsAndConditionsPage = lazy(() => import('../pages/public/PolicyPages/TermsAndConditionsPage'));
const ShippingPolicyPage = lazy(() => import('../pages/public/PolicyPages/ShippingPolicyPage'));

// 404 Not Found page
const NotFound = lazy(() => import('../pages/public/NotFound'));

// Admin pages
const DashboardPage = lazy(() => import('../admin/pages/DashboardPage'));
const OrdersPage = lazy(() => import('../admin/pages/OrdersPage'));
const ProductStock = lazy(() => import('../admin/pages/products/ProductStock'));
const AddProductPage = lazy(() => import('../admin/pages/products/AddProductPage'));
const EditProductPage = lazy(() => import('../admin/pages/products/EditProductPage'));
const NotificationsPage = lazy(() => import('../admin/pages/Notifications'));
const InboxPage = lazy(() => import('../admin/pages/InboxPage'));
const BookingsPage = lazy(() => import('../admin/pages/BookingsPage'));
const NewsletterAdmin = lazy(() => import('../admin/pages/NewsletterAdmin'));
const DeliveryFees = lazy(() => import('../admin/pages/DeliveryFees'));

// Improved LoginWrapper
const LoginWrapper = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    
    if (isLoading) return <LoadingFallback />;
    if (isAuthenticated) {
        const from = location.state?.from?.pathname || "/admin/dashboard";
        return <Navigate to={from} replace />;
    }
    return <LoginPage />;
};

const AppRoutes = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            {/* --- ADDED: ScrollToTop component is placed here to monitor route changes --- */}
            <ScrollToTop />
            <Routes>
                <Route path="admin/login" element={<LoginWrapper />} />
                
                <Route element={<PublicRoutes />}>
                    <Route index element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:productId" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/checkout/checkout-success" element={<CheckoutSuccessPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/consultation" element={<ConsultationPage />} />
                    <Route path="/consultation/success" element={<ConsultationSuccessPage />} />
                    <Route path="/policies/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/policies/terms-and-conditions" element={<TermsAndConditionsPage />} />
                    <Route path="/policies/shipping" element={<ShippingPolicyPage />} />
                    {/* 404 page for public routes */}
                    <Route path="/404" element={<NotFound />} />
                </Route>
                
                <Route path="/admin" element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    
                    <Route path="products">
                        <Route index element={<Navigate to="stock" replace />} />
                        <Route path="stock" element={<ProductStock />} />
                        <Route path="add" element={<AddProductPage />} />
                        <Route path="edit/:id" element={<EditProductPage />} />
                    </Route>
                    
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="inbox" element={<InboxPage />} />
                    <Route path="bookings" element={<BookingsPage />} />
                    <Route path="bookings/:id" element={<BookingsPage />} />      

                    <Route path="newsletter" element={<NewsletterAdmin />} />
                    <Route path="delivery" element={<DeliveryFees />} />
                    
                    {/* 404 page for admin routes */}
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* Catch-all route for any unmatched paths */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;