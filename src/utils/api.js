// utils/api.js

const BASE_URL = 'https://leksycosmetics.com/api';

// Helper function to handle API errors
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || defaultMessage;
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || defaultMessage;
  }
};

// Fetch a single product by ID
export const fetchProduct = async (productId) => {
  try {
    const response = await fetch(`${BASE_URL}/fetch-product?product_id=${productId}`);
    const data = await response.json();
    
    if (response.ok && data.code === 200) {
      return {
        success: true,
        product: data.product
      };
    } else {
      throw new Error(data.message || 'Failed to fetch product');
    }
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error, 'Failed to fetch product')
    };
  }
};

// Fetch products with optional filtering and sorting
export const fetchProducts = async (options = {}) => {
  try {
    const {
      category = '',
      categories = [],
      concerns = [], // Note: This might not be supported by your backend
      search = '', // Note: This might not be supported by your backend
      sort = '',
      limit = '',
      productIds = []
    } = options;

    // Build query parameters
    const params = new URLSearchParams();
    
    // Handle category filtering - convert to backend format
    const filterCategories = [];
    if (category) {
      filterCategories.push(category);
    }
    if (categories.length > 0) {
      filterCategories.push(...categories);
    }
    
    if (filterCategories.length > 0) {
      // Backend expects comma-separated filter parameter
      params.append('filter', filterCategories.join(','));
    }
    
    // Handle specific product IDs
    if (productIds.length > 0) {
      params.append('products_ids_array', productIds.join(','));
    }
    
    // Handle sorting
    if (sort) {
      params.append('sort', sort);
    }
    
    // Handle limit
    if (limit) {
      params.append('limit', limit.toString());
    }
    
    // Note: Search and concerns filtering might need backend support
    // For now, we'll handle these client-side
    
    const url = `${BASE_URL}/fetch-products${params.toString() ? '?' + params.toString() : ''}`;
    console.log('Fetching products from:', url); // Debug log
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.code === 200) {
      let products = data.products || [];
      
      // Client-side filtering for features not supported by backend
      
      // Apply search filter if provided
      if (search && search.trim()) {
        const searchTerm = search.toLowerCase().trim();
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply concerns filter if provided (client-side)
      if (concerns.length > 0) {
        // This is a placeholder - you'd need to implement concern matching
        // based on your product data structure
        console.log('Concerns filtering not implemented in backend, applying client-side filter');
        
        // For now, we'll filter based on product name/description containing concern keywords
        products = products.filter(product => {
          const productText = `${product.name} ${product.description}`.toLowerCase();
          return concerns.some(concern => {
            const concernKeywords = {
              'Anti-Aging': ['anti-aging', 'anti aging', 'wrinkle', 'fine lines', 'aging'],
              'Oily Skin': ['oily', 'oil control', 'sebum'],
              'Dry Skin': ['dry', 'hydrating', 'moisturizing', 'moisture'],
              'Acne': ['acne', 'blemish', 'pimple', 'breakout'],
              'Hyperpigmentation': ['hyperpigmentation', 'dark spots', 'pigmentation', 'brightening'],
              'Sensitive skin': ['sensitive', 'gentle', 'soothing', 'calming']
            };
            
            const keywords = concernKeywords[concern] || [concern.toLowerCase()];
            return keywords.some(keyword => productText.includes(keyword));
          });
        });
      }
      
      return {
        success: true,
        products: products,
        totalCount: products.length,
        message: data.message
      };
    } else {
      throw new Error(data.message || 'Failed to fetch products');
    }
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error, 'Failed to fetch products'),
      products: [],
      totalCount: 0
    };
  }
};

// Fetch products by specific IDs (for cart, wishlist, etc.)
export const fetchProductsByIds = async (productIds) => {
  if (!productIds || productIds.length === 0) {
    return {
      success: true,
      products: [],
      totalCount: 0
    };
  }
  
  return fetchProducts({ productIds });
};

// Get available categories (you might want to add this to your backend)
export const getCategories = () => {
  return [
    'serums',
    'moisturizers',
    'bathe and body',
    'sunscreens',
    'toners',
    'face cleansers'
  ];
};

// Get category display names
export const getCategoryDisplayName = (category) => {
  const categoryDisplayNames = {
    'serums': 'Serums',
    'moisturizers': 'Moisturizers',
    'bathe and body': 'Bathe and Body',
    'sunscreens': 'Sunscreens',
    'toners': 'Toners',
    'face cleansers': 'Face Cleansers'
  };
  return categoryDisplayNames[category] || category;
};

// Get available skin concerns
export const getSkinConcerns = () => {
  return [
    'Anti-Aging',
    'Oily Skin',
    'Dry Skin',
    'Acne',
    'Hyperpigmentation',
    'Sensitive skin'
  ];
};