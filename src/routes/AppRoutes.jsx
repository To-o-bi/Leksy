import React, { lazy, Suspense, useEffect, memo, useState } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { RouteTransitionProvider } from './RouteTransitionLoader';

// Import critical pages directly (no lazy loading)
import ProductDetailPage from '../pages/public/ProductDetailPage';

const ScrollRevealLayout = memo(() => {
  useEffect(() => {
    const ScrollReveal = window.ScrollReveal;

    if (ScrollReveal) {
      const sr = ScrollReveal({
        distance: '60px',
        duration: 2500,
        delay: 400,
        reset: false,
      });

      sr.reveal('.reveal-bottom', { origin: 'bottom', interval: 200 });
      sr.reveal('.reveal-left', { origin: 'left', interval: 200 });
      sr.reveal('.reveal-right', { origin: 'right', interval: 200 });
      sr.reveal('.reveal-top', { origin: 'top', interval: 200 });
    }
  }, []);

  return <Outlet />;
});

ScrollRevealLayout.displayName = 'ScrollRevealLayout';

const ScrollToTop = memo(() => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Delay scroll to top for product pages to prevent footer flash
    if (pathname.includes('/product/')) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
});

ScrollToTop.displayName = 'ScrollToTop';

const LoadingFallback = memo(() => (
  <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mx-auto" />
      <p className="text-center text-gray-600 mt-3 text-sm">Loading...</p>
    </div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

// Lazy load non-critical pages
const publicPages = {
  LoginPage: lazy(() => import('../pages/public/LoginPage')),
  HomePage: lazy(() => import('../pages/public/HomePage')),
  ShopPage: lazy(() => import('../pages/public/ShopPage')),
  CartPage: lazy(() => import('../pages/public/CartPage')),
  ContactPage: lazy(() => import('../pages/public/ContactPage')),
  CheckoutPage: lazy(() => import('../pages/public/CheckoutPage')),
  WishlistPage: lazy(() => import('../pages/public/WishlistPage')),
  ConsultationPage: lazy(() => import('../pages/public/ConsultationPage')),
  ConsultationSuccessPage: lazy(() => import('../components/consultation/ConsultationSuccess')),
  CheckoutSuccessPage: lazy(() => import('../pages/public/CheckoutSuccessPage')),
  PrivacyPolicyPage: lazy(() => import('../pages/public/PolicyPages/PrivacyPolicyPage')),
  TermsAndConditionsPage: lazy(() => import('../pages/public/PolicyPages/TermsAndConditionsPage')),
  ShippingPolicyPage: lazy(() => import('../pages/public/PolicyPages/ShippingPolicyPage')),
  NotFound: lazy(() => import('../pages/public/NotFound'))
};

const adminPages = {
  DashboardPage: lazy(() => import('../admin/pages/DashboardPage')),
  OrdersPage: lazy(() => import('../admin/pages/OrdersPage')),
  ProductStock: lazy(() => import('../admin/pages/products/ProductStock')),
  AddProductPage: lazy(() => import('../admin/pages/products/AddProductPage')),
  EditProductPage: lazy(() => import('../admin/pages/products/EditProductPage')),
  NotificationsPage: lazy(() => import('../admin/pages/Notifications')),
  InboxPage: lazy(() => import('../admin/pages/InboxPage')),
  BookingsPage: lazy(() => import('../admin/pages/BookingsPage')),
  NewsletterAdmin: lazy(() => import('../admin/pages/NewsletterAdmin')),
  DeliveryFees: lazy(() => import('../admin/pages/DeliveryFees')),
  DiscountsPage: lazy(() => import('../admin/pages/DiscountsPage'))
};

const LoginWrapper = memo(() => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) return <LoadingFallback />;
  
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/admin/dashboard";
    return <Navigate to={from} replace />;
  }
  
  return <publicPages.LoginPage />;
});

LoginWrapper.displayName = 'LoginWrapper';

const AppRoutes = () => {
  const [routeChanging, setRouteChanging] = useState(false);
  const location = useLocation();

  // Handle route transitions
  useEffect(() => {
    setRouteChanging(true);
    const timer = setTimeout(() => setRouteChanging(false), 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Preload critical components on app startup
  useEffect(() => {
    // Preload important pages that users frequently navigate to
    const preloadPages = () => {
      import('../pages/public/CartPage');
      import('../pages/public/CheckoutPage');
      import('../pages/public/ShopPage');
    };
    
    // Delay preloading to not interfere with initial load
    setTimeout(preloadPages, 2000);
  }, []);

  return (
    <RouteTransitionProvider>
      {/* Route transition indicator */}
      {routeChanging && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-pink-500 z-50 animate-pulse" />
      )}
      
      <Suspense fallback={<LoadingFallback />}>
        <ScrollToTop />
        <Routes>
          <Route path="admin/login" element={<LoginWrapper />} />
          
          <Route element={<ScrollRevealLayout />}>
            <Route element={<PublicRoutes />}>
              <Route index element={<publicPages.HomePage />} />
              <Route path="/shop" element={<publicPages.ShopPage />} />
              
              {/* ProductDetail - No lazy loading for instant navigation */}
              <Route path="/product/:productId" element={<ProductDetailPage />} />
              
              <Route path="/cart" element={<publicPages.CartPage />} />
              <Route path="/contact" element={<publicPages.ContactPage />} />
              <Route path="/checkout" element={<publicPages.CheckoutPage />} />
              <Route path="/checkout/checkout-success" element={<publicPages.CheckoutSuccessPage />} />
              <Route path="/wishlist" element={<publicPages.WishlistPage />} />
              <Route path="/consultation" element={<publicPages.ConsultationPage />} />
              <Route path="/consultation/success" element={<publicPages.ConsultationSuccessPage />} />
              <Route path="/policies/privacy" element={<publicPages.PrivacyPolicyPage />} />
              <Route path="/policies/terms-and-conditions" element={<publicPages.TermsAndConditionsPage />} />
              <Route path="/policies/shipping" element={<publicPages.ShippingPolicyPage />} />
              <Route path="/404" element={<publicPages.NotFound />} />
            </Route>
          </Route>
          
          <Route path="/admin" element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<adminPages.DashboardPage />} />
            <Route path="orders" element={<adminPages.OrdersPage />} />
            
            <Route path="products">
              <Route index element={<Navigate to="stock" replace />} />
              <Route path="stock" element={<adminPages.ProductStock />} />
              <Route path="add" element={<adminPages.AddProductPage />} />
              <Route path="edit/:id" element={<adminPages.EditProductPage />} />
            </Route>
            
            <Route path="notifications" element={<adminPages.NotificationsPage />} />
            <Route path="inbox" element={<adminPages.InboxPage />} />
            <Route path="bookings" element={<adminPages.BookingsPage />} />
            <Route path="bookings/:id" element={<adminPages.BookingsPage />} />   
            <Route path="newsletter" element={<adminPages.NewsletterAdmin />} />
            <Route path="delivery" element={<adminPages.DeliveryFees />} />
            <Route path="discounts" element={<adminPages.DiscountsPage />} />
            <Route path="*" element={<publicPages.NotFound />} />
          </Route>

          <Route path="*" element={<publicPages.NotFound />} />
        </Routes>
      </Suspense>
    </RouteTransitionProvider>
  );
};

export default memo(AppRoutes);