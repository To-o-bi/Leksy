import api from './axios.js';
import { ENDPOINTS, CATEGORIES } from './config.js';

export const authService = {
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    try {
      console.log('authService: Attempting login with backend API format');
      
      // According to your API docs, backend expects form data with username/password
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      // Make request to the correct endpoint as per your API docs
      const response = await api.post('/admin/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('authService: Response received:', response.data);
      
      // Check for successful response according to your backend format
      if (response.data && response.data.code === 200) {
        // Store auth token 
        if (response.data.token) {
          api.setToken(response.data.token);
          console.log('authService: Token saved');
        } else {
          throw new Error('No token received from server');
        }
        
        // Store user data (your backend returns "user" object)
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          console.log('authService: User data saved');
        } else {
          throw new Error('No user data received from server');
        }
        
        return response.data;
      } else if (response.data && response.data.code === 401) {
        throw new Error('Invalid credentials');
      } else if (response.data && response.data.code === 412) {
        throw new Error('Username and password are required');
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error) {
      console.error('authService: Login error:', error);
      
      // Handle different error types based on your backend responses
      if (error.response && error.response.data) {
        const { code, message } = error.response.data;
        
        switch(code) {
          case 400:
            throw new Error('Username and password are required');
          case 401:
            throw new Error('Invalid credentials');
          case 412:
            throw new Error('Please provide both username and password');
          default:
            throw new Error(message || 'Login failed');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw error;
      }
    }
  },

  async logout() {
    try {
      console.log('authService: Attempting logout');
      const response = await api.post(ENDPOINTS.ADMIN_LOGOUT);
      console.log('authService: Logout response:', response.data);
      return response.data;
    } catch (error) {
      console.error('authService: Logout error:', error);
      throw error;
    } finally {
      // Always clear local storage
      api.clearAuth();
      localStorage.removeItem('user');
      console.log('authService: Cleared localStorage');
    }
  },

  clearAuth() {
    api.clearAuth();
    localStorage.removeItem('user');
    console.log('authService: Logged out - cleared localStorage');
  },

  isAuthenticated() {
    const hasToken = !!api.getToken();
    const hasUser = !!localStorage.getItem('user');
    console.log('authService: isAuthenticated check -', { hasToken, hasUser });
    return hasToken && hasUser;
  },

  getAuthUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  isAdmin() {
    const user = this.getAuthUser();
    return user && (user.role === 'admin' || user.role === 'superadmin');
  }
};

export const productService = {
  async fetchProducts(filters = {}) {
    try {
      const params = {};
      if (filters.categories?.length) params.filter = filters.categories.join(',');
      if (filters.productIds?.length) params.products_ids_array = filters.productIds.join(',');
      if (filters.sort) params.sort = filters.sort;
      if (filters.limit) params.limit = filters.limit;
      
      const response = await api.get(ENDPOINTS.FETCH_PRODUCTS, params);
      return response.data;
    } catch (error) {
      console.error('productService: fetchProducts error:', error);
      throw error;
    }
  },

  async fetchProduct(productId) {
    try {
      const response = await api.get(ENDPOINTS.FETCH_PRODUCT, { product_id: productId });
      return response.data;
    } catch (error) {
      console.error('productService: fetchProduct error:', error);
      throw error;
    }
  },

  async addProduct(productData) {
    try {
      // Basic validation
      if (!productData.name?.trim()) throw new Error('Product name is required');
      if (!productData.price || parseFloat(productData.price) <= 0) throw new Error('Valid price is required');
      if (!productData.description?.trim()) throw new Error('Description is required');
      if (!productData.quantity || parseInt(productData.quantity) < 0) throw new Error('Valid quantity is required');
      if (!productData.category) throw new Error('Category is required');
      if (!CATEGORIES.includes(productData.category)) throw new Error('Invalid category');

      console.log('productService: Adding product');

      // Build form data for POST request
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('price', productData.price);
      formData.append('description', productData.description);
      formData.append('quantity', productData.quantity);
      formData.append('category', productData.category);

      if (productData.slashed_price) {
        formData.append('slashed_price', productData.slashed_price);
      }

      // Add images
      if (productData.images && Array.isArray(productData.images)) {
        productData.images.forEach(image => {
          if (!image.type?.startsWith('image/')) {
            throw new Error('Only image files are allowed');
          }
          if (image.size > 2 * 1024 * 1024) {
            throw new Error('Image size must be less than 2MB');
          }
          formData.append('images', image);
        });
      }

      const response = await api.postFormData(ENDPOINTS.ADD_PRODUCT, formData);
      console.log('productService: Product added successfully');
      return response.data;
    } catch (error) {
      console.error('productService: addProduct error:', error);
      throw error;
    }
  },

  async updateProduct(productId, productData) {
    try {
      console.log('productService: Updating product:', productId);

      const formData = new FormData();
      formData.append('product_id', productId);
      
      // Add changed fields
      Object.entries(productData).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add new images if any
      if (productData.images && Array.isArray(productData.images)) {
        productData.images.forEach(image => formData.append('images', image));
      }

      const response = await api.postFormData(ENDPOINTS.UPDATE_PRODUCT, formData);
      console.log('productService: Product updated successfully');
      return response.data;
    } catch (error) {
      console.error('productService: updateProduct error:', error);
      throw error;
    }
  },

  async deleteProduct(productId) {
    try {
      console.log('productService: Deleting product:', productId);
      const formData = new FormData();
      formData.append('product_id', productId);
      
      const response = await api.postFormData(ENDPOINTS.DELETE_PRODUCT, formData);
      console.log('productService: Product deleted successfully');
      return response.data;
    } catch (error) {
      console.error('productService: deleteProduct error:', error);
      throw error;
    }
  }
};

export const contactService = {
  async submit(contactData) {
    try {
      // Basic validation
      if (!contactData.name?.trim()) throw new Error('Name is required');
      if (!contactData.email?.trim()) throw new Error('Email is required');
      if (!contactData.phone?.trim()) throw new Error('Phone is required');
      if (!contactData.subject?.trim()) throw new Error('Subject is required');
      if (!contactData.message?.trim()) throw new Error('Message is required');

      // Email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
        throw new Error('Invalid email format');
      }

      console.log('contactService: Submitting contact form');

      // Build form data for POST request
      const formData = new FormData();
      formData.append('name', contactData.name.trim());
      formData.append('email', contactData.email.trim());
      formData.append('phone', contactData.phone.trim());
      formData.append('subject', contactData.subject.trim());
      formData.append('message', contactData.message.trim());

      const response = await api.postFormData(ENDPOINTS.SUBMIT_CONTACT, formData);
      console.log('contactService: Contact form submitted successfully');
      return response.data;
    } catch (error) {
      console.error('contactService: submit error:', error);
      throw error;
    }
  },

  async fetchSubmissions(filters = {}) {
    try {
      const response = await api.get(ENDPOINTS.FETCH_CONTACT_SUBMISSIONS, filters);
      return response.data;
    } catch (error) {
      console.error('contactService: fetchSubmissions error:', error);
      throw error;
    }
  }
};

export const orderService = {
  async initiateCheckout(checkoutData) {
    try {
      // Basic validation
      if (!checkoutData.phone?.trim()) throw new Error('Phone is required');
      if (!checkoutData.delivery_method) throw new Error('Delivery method is required');
      if (!['pickup', 'address'].includes(checkoutData.delivery_method)) {
        throw new Error('Invalid delivery method');
      }

      if (checkoutData.delivery_method === 'address') {
        if (!checkoutData.state?.trim()) throw new Error('State is required');
        if (!checkoutData.city?.trim()) throw new Error('City is required');
        if (!checkoutData.street_address?.trim()) throw new Error('Street address is required');
      }

      if (!checkoutData.cart || !Array.isArray(checkoutData.cart) || checkoutData.cart.length === 0) {
        throw new Error('Cart cannot be empty');
      }

      console.log('orderService: Initiating checkout');

      const params = {
        phone: checkoutData.phone,
        delivery_method: checkoutData.delivery_method,
        cart: JSON.stringify(checkoutData.cart)
      };

      if (checkoutData.delivery_method === 'address') {
        params.state = checkoutData.state;
        params.city = checkoutData.city;
        params.street_address = checkoutData.street_address;
      }

      const response = await api.get(ENDPOINTS.INITIATE_CHECKOUT, params);
      console.log('orderService: Checkout initiated successfully');
      return response.data;
    } catch (error) {
      console.error('orderService: initiateCheckout error:', error);
      throw error;
    }
  },

  async fetchOrders(filters = {}) {
    try {
      const response = await api.get(ENDPOINTS.FETCH_ORDERS, filters);
      return response.data;
    } catch (error) {
      console.error('orderService: fetchOrders error:', error);
      throw error;
    }
  },

  async changeDeliveryStatus(orderId, newStatus) {
    try {
      const validStatuses = ['unpaid', 'order-received', 'packaged', 'in-transit', 'delivered'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid delivery status');
      }

      console.log('orderService: Changing delivery status:', { orderId, newStatus });

      const response = await api.get(ENDPOINTS.CHANGE_DELIVERY_STATUS, {
        order_id: orderId,
        new_delivery_status: newStatus
      });
      
      console.log('orderService: Delivery status changed successfully');
      return response.data;
    } catch (error) {
      console.error('orderService: changeDeliveryStatus error:', error);
      throw error;
    }
  }
};

export const productService = {
  async fetchProducts(filters = {}) {
    const params = {};
    if (filters.categories?.length) params.filter = filters.categories.join(',');
    if (filters.productIds?.length) params.products_ids_array = filters.productIds.join(',');
    if (filters.sort) params.sort = filters.sort;
    if (filters.limit) params.limit = filters.limit;
    
    const response = await api.get(ENDPOINTS.FETCH_PRODUCTS, params);
    return response.data;
  },

  async fetchProduct(productId) {
    const response = await api.get(ENDPOINTS.FETCH_PRODUCT, { product_id: productId });
    return response.data;
  },

  async addProduct(productData) {
    // Basic validation
    if (!productData.name?.trim()) throw new Error('Product name is required');
    if (!productData.price || parseFloat(productData.price) <= 0) throw new Error('Valid price is required');
    if (!productData.description?.trim()) throw new Error('Description is required');
    if (!productData.quantity || parseInt(productData.quantity) < 0) throw new Error('Valid quantity is required');
    if (!productData.category) throw new Error('Category is required');
    if (!CATEGORIES.includes(productData.category)) throw new Error('Invalid category');

    // Build query string for POST request as per API docs
    const params = new URLSearchParams({
      name: productData.name,
      price: productData.price,
      description: productData.description,
      quantity: productData.quantity,
      category: productData.category
    });

    if (productData.slashed_price) {
      params.append('slashed_price', productData.slashed_price);
    }

    // Add images to FormData
    const formData = new FormData();
    if (productData.images && Array.isArray(productData.images)) {
      productData.images.forEach(image => {
        // Basic image validation
        if (!image.type?.startsWith('image/')) {
          throw new Error('Only image files are allowed');
        }
        if (image.size > 2 * 1024 * 1024) {
          throw new Error('Image size must be less than 2MB');
        }
        formData.append('images', image);
      });
    }

    const response = await api.postFormData(`${ENDPOINTS.ADD_PRODUCT}?${params.toString()}`, formData);
    return response.data;
  },

  async updateProduct(productId, productData) {
    const params = new URLSearchParams({ product_id: productId });
    
    // Add only changed fields to params
    Object.entries(productData).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const formData = new FormData();
    if (productData.images && Array.isArray(productData.images)) {
      productData.images.forEach(image => formData.append('images', image));
    }

    const response = await api.postFormData(`${ENDPOINTS.UPDATE_PRODUCT}?${params.toString()}`, formData);
    return response.data;
  },

  async deleteProduct(productId) {
    const response = await api.post(`${ENDPOINTS.DELETE_PRODUCT}?product_id=${productId}`);
    return response.data;
  }
};

export const contactService = {
  async submit(contactData) {
    // Basic validation
    if (!contactData.name?.trim()) throw new Error('Name is required');
    if (!contactData.email?.trim()) throw new Error('Email is required');
    if (!contactData.phone?.trim()) throw new Error('Phone is required');
    if (!contactData.subject?.trim()) throw new Error('Subject is required');
    if (!contactData.message?.trim()) throw new Error('Message is required');

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      throw new Error('Invalid email format');
    }

    // Build query string for POST request as per API docs
    const params = new URLSearchParams({
      name: contactData.name.trim(),
      email: contactData.email.trim(),
      phone: contactData.phone.trim(),
      subject: contactData.subject.trim(),
      message: contactData.message.trim()
    });

    const response = await api.post(`${ENDPOINTS.SUBMIT_CONTACT}?${params.toString()}`);
    return response.data;
  },

  async fetchSubmissions(filters = {}) {
    const response = await api.get(ENDPOINTS.FETCH_CONTACT_SUBMISSIONS, filters);
    return response.data;
  }
};

export const orderService = {
  async initiateCheckout(checkoutData) {
    // Basic validation
    if (!checkoutData.phone?.trim()) throw new Error('Phone is required');
    if (!checkoutData.delivery_method) throw new Error('Delivery method is required');
    if (!['pickup', 'address'].includes(checkoutData.delivery_method)) {
      throw new Error('Invalid delivery method');
    }

    if (checkoutData.delivery_method === 'address') {
      if (!checkoutData.state?.trim()) throw new Error('State is required');
      if (!checkoutData.city?.trim()) throw new Error('City is required');
      if (!checkoutData.street_address?.trim()) throw new Error('Street address is required');
    }

    if (!checkoutData.cart || !Array.isArray(checkoutData.cart) || checkoutData.cart.length === 0) {
      throw new Error('Cart cannot be empty');
    }

    const params = {
      phone: checkoutData.phone,
      delivery_method: checkoutData.delivery_method,
      cart: JSON.stringify(checkoutData.cart)
    };

    if (checkoutData.delivery_method === 'address') {
      params.state = checkoutData.state;
      params.city = checkoutData.city;
      params.street_address = checkoutData.street_address;
    }

    const response = await api.get(ENDPOINTS.INITIATE_CHECKOUT, params);
    return response.data;
  },

  async fetchOrders(filters = {}) {
    const response = await api.get(ENDPOINTS.FETCH_ORDERS, filters);
    return response.data;
  },

  async changeDeliveryStatus(orderId, newStatus) {
    const validStatuses = ['unpaid', 'order-received', 'packaged', 'in-transit', 'delivered'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid delivery status');
    }

    const response = await api.get(ENDPOINTS.CHANGE_DELIVERY_STATUS, {
      order_id: orderId,
      new_delivery_status: newStatus
    });
    return response.data;
  }
};