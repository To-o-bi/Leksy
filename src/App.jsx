// src/App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ProductProvider } from './contexts/ProductContext';
import { DiscountProvider } from './contexts/DiscountContext';
import TokenExpiryWarning from './components/TokenExpiryWarning';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <BrowserRouter>
      {/* AuthProvider MUST be inside BrowserRouter to use navigation hooks */}
      <AuthProvider>
        <MessageProvider>
          <ProductProvider>
            <DiscountProvider> 
              <CartProvider>
                <WishlistProvider>
                  {/* TokenExpiryWarning should be inside all providers to access auth state */}
                  <TokenExpiryWarning />
                  <AppRoutes />                
                </WishlistProvider>       
              </CartProvider>
            </DiscountProvider>
          </ProductProvider>
        </MessageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;