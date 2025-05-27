// api/index.js
import authService from './services/authService';
import productService from './services/productService';

// Export services for easy import throughout the app
export {
  authService,
  productService
};

// If you need to export axios instance as well
export { default as api } from './axios';