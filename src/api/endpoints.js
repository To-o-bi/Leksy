import axios from 'axios';

const BASE_URL = 'https://leksycosmetics.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle specific error cases here if needed
    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  loginAdmin: async (username, password) => {
    const response = await api.post(`/admin/login?username=${username}&password=${password}`);
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
  
  getAuthUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Product service functions
export const productService = {
  // Admin product management
  addProduct: async (productData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(productData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, productData[key]);
      }
    });
    
    // Append image files
    if (productData.images && productData.images.length) {
      productData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    // For FormData we need to use different content type
    return api.post('/admin/add-product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  updateProduct: async (productId, productData) => {
    const formData = new FormData();
    formData.append('product_id', productId);
    
    // Append text fields
    Object.keys(productData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, productData[key]);
      }
    });
    
    // Append image files if any
    if (productData.images && productData.images.length) {
      productData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    return api.post('/admin/update-product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteProduct: async (productId) => {
    return api.post(`/admin/delete-product?product_id=${productId}`);
  },
  
  // Public product fetching
  fetchProduct: async (productId) => {
    return api.get(`/fetch-product?product_id=${productId}`);
  },
  
  fetchProducts: async (options = {}) => {
    const { filter, productIds, sort } = options;
    let url = '/fetch-products?';
    
    // Add filters for categories if provided
    if (filter && filter.length) {
      url += `filter=${filter.join(',')}&`;
    }
    
    // Add specific product IDs if provided
    if (productIds && productIds.length) {
      url += `products_ids_array=${productIds.join(',')}&`;
    }
    
    // Add sorting if provided
    if (sort) {
      url += `sort=${sort}&`;
    }
    
    // Remove trailing & or ? if present
    url = url.endsWith('&') ? url.slice(0, -1) : url;
    url = url.endsWith('?') ? url.slice(0, -1) : url;
    
    return api.get(url);
  }
};

export default api;