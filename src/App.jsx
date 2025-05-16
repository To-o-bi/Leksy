import React from 'react';
import { HashRouter } from 'react-router-dom';
import AuthContextProvider from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ProductProvider } from './contexts/ProductContext';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <AuthContextProvider>
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
    </AuthContextProvider>
  );
};

export default App;