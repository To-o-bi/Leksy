import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

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

// Admin pages
const DashboardPage = lazy(() => import('../admin/pages/DashboardPage'));
const OrdersPage = lazy(() => import('../admin/pages/OrdersPage'));
const ProductStock = lazy(() => import('../admin/pages/products/ProductStock'));
const AddProductPage = lazy(() => import('../admin/pages/products/AddProductPage'));
const EditProductPage = lazy(() => import('../admin/pages/products/EditProductPage'));
const NotificationsPage = lazy(() => import('../admin/pages/Notifications'));
const InboxPage = lazy(() => import('../admin/pages/InboxPage'));
const BookingsPage = lazy(() => import('../admin/pages/BookingsPage'));
const NewBookingPage = lazy(() => import('../admin/pages/NewBookingPage'));
const EditBookingPage = lazy(() => import('../admin/pages/EditBookingPage'));

// Improved LoginWrapper with better redirect handling
const LoginWrapper = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  // If user is already authenticated, redirect to dashboard or the intended location
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/admin/dashboard";
    return <Navigate to={from} replace />;
  }
  
  // Otherwise show login page
  return <LoginPage />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginWrapper />} />
        
        {/* Public Routes */}
        <Route element={<PublicRoutes />}>
          <Route index element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
        </Route>
        
        {/* Protected Admin Routes - now using ProtectedRoute that includes AdminLayout */}
        <Route path="/admin" element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          
          {/* Product Management Routes */}
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
          <Route path="bookings/new" element={<NewBookingPage />} />
          <Route path="bookings/edit/:id" element={<EditBookingPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;