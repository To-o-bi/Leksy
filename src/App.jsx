import React from 'react';
import { HashRouter } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext'; // Import the proper AuthProvider
import { MessageProvider } from './contexts/MessageContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ProductProvider } from './contexts/ProductContext';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <AuthProvider>
      <MessageProvider>
        <HashRouter>
          <ProductProvider>
            <CartProvider>
              <WishlistProvider>
                <AppRoutes />
              </WishlistProvider>       
            </CartProvider>
          </ProductProvider>
        </HashRouter>
      </MessageProvider>
    </AuthProvider>
  );
};

export default App;