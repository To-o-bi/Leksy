// src/App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ProductProvider } from './contexts/ProductContext';
import TokenExpiryWarning from './components/TokenExpiryWarning';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <AuthProvider>
      <TokenExpiryWarning />
      <MessageProvider>
        <BrowserRouter>
          <ProductProvider>
            <CartProvider>
              <WishlistProvider>                
                <AppRoutes />                
              </WishlistProvider>       
            </CartProvider>
          </ProductProvider>
        </BrowserRouter>
      </MessageProvider>      
    </AuthProvider>
  );
};

export default App;