import api from '../axios';

/**
 * Fetch all products with optional filtering
 * @param {Object} options - Query options
 * @param {string} options.category - Optional product category filter
 * @param {string} options.sort - Optional sorting parameter
 * @returns {Promise<Object>} Products response
 */
export const fetchProducts = async (options = {}) => {
  try {
    const response = await api.post('/fetch-products', options);
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch products');
    }
  } catch (error) {
    console.error('Fetch products error:', error);
    throw new Error(
      error.response?.data?.message || 
      'Unable to load products. Please try again later.'
    );
  }
};

/**
 * Fetch a single product by ID
 * @param {string|number} productId - Product ID to fetch
 * @returns {Promise<Object>} Product data
 */
export const fetchProduct = async (productId) => {
  try {
    // Validate the product ID
    if (!productId) {
      throw new Error('Please set a product_id!');
    }
    
    console.log('Fetching product with ID:', productId);
    
    // Send the product_id in the request body, not as a URL parameter
    const response = await api.post('/fetch-product', { 
      product_id: productId.toString() 
    });
    
    console.log('Product fetch response:', response.data);
    
    if (response.data && response.data.code === 200) {
      if (!response.data.product) {
        throw new Error('Product not found');
      }
      return response.data.product;
    } else {
      throw new Error(response.data.message || 'Failed to fetch product');
    }
  } catch (error) {
    console.error('Fetch product error:', error);
    throw new Error(
      error.response?.data?.message || 
      'Unable to load product details. Please try again later.'
    );
  }
};

/**
 * Add a new product (Admin only)
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Response with product ID
 */
export const addProduct = async (productData) => {
  try {
    console.log('AddProduct service received:', productData);
    
    // Validate required fields
    const requiredFields = ['name', 'price', 'description', 'quantity', 'category'];
    const missingFields = requiredFields.filter(field => 
      productData[field] === undefined || 
      productData[field] === null || 
      productData[field] === ''
    );
    
    if (missingFields.length > 0) {
      throw new Error(`${missingFields.join(', ')} are all required!`);
    }
    
    // Explicitly check for the images array
    if (!productData.images || !Array.isArray(productData.images) || productData.images.length === 0) {
      throw new Error('At least one product image is required!');
    }
    
    // Create FormData for the request
    const formData = new FormData();
    
    // Add all text fields to FormData
    formData.append('name', productData.name);
    formData.append('price', productData.price);
    formData.append('description', productData.description);
    formData.append('quantity', productData.quantity);
    formData.append('category', productData.category);
    
    // Only add slashed_price if it exists and is not empty
    if (productData.slashed_price) {
      formData.append('slashed_price', productData.slashed_price);
    }
    
    // Important: Add each image with field name "images[]" - the backend expects this specific format
    productData.images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append('images[]', image);
        console.log(`Appended image ${index} as "images[]" field`);
      } else {
        throw new Error('Images must be valid file objects');
      }
    });
    
    // Debug FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(`FormData contains: ${key} = ${value instanceof File ? value.name : value}`);
    }
    
    // Use the FormData helper method to properly handle file uploads
    const response = await api.postFormData('/admin/add-product', formData);
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to add product');
    }
  } catch (error) {
    console.error('Add product error:', error);
    
    // Specific handling for authentication errors
    if (error.response?.status === 401) {
      throw new Error('Unauthorized! Please login/re-login.');
    }
    
    throw error; // Re-throw the original error to preserve the message
  }
};

/**
 * Edit an existing product (Admin only)
 * @param {string|number} productId - Product ID to edit
 * @param {Object} updates - Product data updates
 * @returns {Promise<Object>} Response with product ID
 */
export const editProduct = async (productId, updates) => {
  try {
    // Validate product ID
    if (!productId) {
      throw new Error('Product ID is required for updating');
    }
    
    console.log('Editing product with ID:', productId);
    
    // Validate required fields if they are provided in the updates
    const requiredFields = ['name', 'price', 'description', 'quantity', 'category'];
    const providedFields = Object.keys(updates);
    
    const missingFields = requiredFields.filter(field => 
      providedFields.includes(field) && 
      (updates[field] === undefined || updates[field] === null || updates[field] === '')
    );
    
    if (missingFields.length > 0) {
      throw new Error(`${missingFields.join(', ')} are all required!`);
    }
    
    // Create FormData for the request
    const formData = new FormData();
    
    // Add product ID to FormData - convert to string to ensure compatibility
    formData.append('product_id', productId.toString());
    
    // Add text fields that are present in the updates
    if (updates.name) formData.append('name', updates.name);
    if (updates.price) formData.append('price', updates.price);
    if (updates.description) formData.append('description', updates.description);
    if (updates.quantity) formData.append('quantity', updates.quantity);
    if (updates.category) formData.append('category', updates.category);
    if (updates.slashed_price) formData.append('slashed_price', updates.slashed_price);
    
    // Handle existing images if present
    if (updates.existing_images && updates.existing_images.length > 0) {
      updates.existing_images.forEach((image, index) => {
        formData.append(`existing_images[${index}]`, typeof image === 'string' ? image : image.id || image.url || '');
      });
    }
    
    // Handle new images if present - using the "images[]" field name format
    if (updates.images && updates.images.length > 0) {
      updates.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append('images[]', image);
          console.log(`Appended image ${index} as "images[]" field`);
        }
      });
    }
    
    // Debug FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(`Update FormData contains: ${key} = ${value instanceof File ? value.name : value}`);
    }
    
    // Use the FormData helper method
    const response = await api.postFormData('/admin/edit-product', formData);
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to update product');
    }
  } catch (error) {
    console.error('Edit product error:', error);
    
    // Specific handling for authentication errors
    if (error.response?.status === 401) {
      throw new Error('Unauthorized! Please login/re-login.');
    }
    
    throw error; // Re-throw the original error to preserve the message
  }
};

/**
 * Delete a product (Admin only)
 * @param {string|number} productId - Product ID to delete
 * @returns {Promise<Object>} Response with success message
 */
export const deleteProduct = async (productId) => {
  try {
    // Validate product ID
    if (!productId) {
      throw new Error('Product ID is required for deletion');
    }
    
    console.log('Deleting product with ID:', productId);
    
    // Send data in the request body
    const response = await api.post('/admin/delete-product', { 
      product_id: productId.toString() 
    });
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to delete product');
    }
  } catch (error) {
    console.error('Delete product error:', error);
    
    // Specific handling for authentication errors
    if (error.response?.status === 401) {
      throw new Error('Unauthorized! Please login/re-login.');
    }
    
    throw error; // Re-throw the original error to preserve the message
  }
};

export default {
  fetchProducts,
  fetchProduct,
  addProduct,
  editProduct,
  deleteProduct
};