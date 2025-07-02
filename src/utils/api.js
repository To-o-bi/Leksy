// utils/api.js - Enhanced version with improved frontend filtering

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

// Enhanced skin concerns mapping with more comprehensive keywords
const SKIN_CONCERN_KEYWORDS = {
  'Anti-Aging': [
    'anti-aging', 'anti aging', 'antiaging',
    'wrinkle', 'wrinkles', 'fine lines', 'fine line',
    'aging', 'age spots', 'mature skin',
    'firming', 'lifting', 'tightening',
    'collagen', 'elastin', 'peptide', 'peptides',
    'retinol', 'retinoid', 'vitamin c',
    'youth', 'youthful', 'rejuvenating'
  ],
  'Oily Skin': [
    'oily', 'oily skin', 'oil control', 'oil-control',
    'sebum', 'sebum control', 'shine control',
    'mattifying', 'matte', 'non-comedogenic',
    'pore minimizing', 'pore refining',
    'excess oil', 'greasy', 'combination skin'
  ],
  'Dry Skin': [
    'dry', 'dry skin', 'dehydrated', 'dehydration',
    'hydrating', 'hydration', 'moisturizing', 'moisture',
    'nourishing', 'rich', 'intensive',
    'hyaluronic acid', 'ceramides', 'glycerin',
    'barrier repair', 'skin barrier',
    'flaky', 'tight skin', 'parched'
  ],
  'Acne': [
    'acne', 'acne-prone', 'blemish', 'blemishes',
    'pimple', 'pimples', 'breakout', 'breakouts',
    'blackhead', 'blackheads', 'whitehead', 'whiteheads',
    'salicylic acid', 'benzoyl peroxide',
    'comedogenic', 'spot treatment',
    'clear skin', 'purifying', 'clarifying'
  ],
  'Hyperpigmentation': [
    'hyperpigmentation', 'pigmentation', 'dark spots', 'dark spot',
    'age spots', 'sun spots', 'melasma',
    'brightening', 'whitening', 'lightening',
    'even skin tone', 'uneven skin tone',
    'discoloration', 'marks', 'scarring',
    'vitamin c', 'niacinamide', 'kojic acid',
    'arbutin', 'hydroquinone'
  ],
  'Sensitive Skin': [
    'sensitive', 'sensitive skin', 'gentle', 'mild',
    'soothing', 'calming', 'comforting',
    'fragrance-free', 'fragrance free', 'unscented',
    'hypoallergenic', 'dermatologist tested',
    'irritation', 'redness', 'reactive skin',
    'allantoin', 'chamomile', 'aloe', 'centella'
  ]
};

// Enhanced function to check if a product matches skin concerns
const productMatchesConcerns = (product, concerns) => {
  if (!concerns || concerns.length === 0) return true;
  
  // Combine all product text for searching
  const productText = [
    product.name || '',
    product.description || '',
    product.category || '',
    product.ingredients || '', // if available
    product.benefits || '', // if available
    product.skinType || '', // if available
    ...(product.tags || []) // if available
  ].join(' ').toLowerCase();
  
  // Check if product matches ANY of the selected concerns
  return concerns.some(concern => {
    const keywords = SKIN_CONCERN_KEYWORDS[concern] || [concern.toLowerCase()];
    
    // Check if ANY keyword for this concern is found in the product text
    return keywords.some(keyword => {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(productText);
    });
  });
};

// Enhanced search function
const productMatchesSearch = (product, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return true;
  
  const search = searchTerm.toLowerCase().trim();
  const productText = [
    product.name || '',
    product.description || '',
    product.category || '',
    product.brand || '', // if available
    ...(product.tags || []) // if available
  ].join(' ').toLowerCase();
  
  // Split search term into words and check if all words are found
  const searchWords = search.split(/\s+/);
  return searchWords.every(word => productText.includes(word));
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

// Enhanced fetch products with improved frontend filtering
export const fetchProducts = async (options = {}) => {
  try {
    const {
      category = '',
      categories = [],
      concerns = [],
      search = '',
      sort = '',
      limit = '',
      productIds = []
    } = options;

    // Build query parameters for backend
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
      params.append('filter', filterCategories.join(','));
    }
    
    // Handle specific product IDs
    if (productIds.length > 0) {
      params.append('products_ids_array', productIds.join(','));
    }
    
    // Handle sorting (let backend handle this)
    if (sort) {
      params.append('sort', sort);
    }
    
    // Don't apply limit to backend if we're doing frontend filtering
    // We'll apply it after filtering
    const shouldApplyLimitAfterFiltering = concerns.length > 0 || (search && search.trim());
    
    if (limit && !shouldApplyLimitAfterFiltering) {
      params.append('limit', limit.toString());
    }
    
    const url = `${BASE_URL}/fetch-products${params.toString() ? '?' + params.toString() : ''}`;
    console.log('Fetching products from:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.code === 200) {
      let products = data.products || [];
      const originalCount = products.length;
      
      // Apply frontend filters
      
      // Apply search filter
      if (search && search.trim()) {
        products = products.filter(product => productMatchesSearch(product, search));
        console.log(`Search filter applied: ${originalCount} -> ${products.length} products`);
      }
      
      // Apply concerns filter
      if (concerns.length > 0) {
        const beforeConcernFilter = products.length;
        products = products.filter(product => productMatchesConcerns(product, concerns));
        console.log(`Concerns filter applied for [${concerns.join(', ')}]: ${beforeConcernFilter} -> ${products.length} products`);
      }
      
      // Apply limit after filtering if needed
      if (limit && shouldApplyLimitAfterFiltering) {
        products = products.slice(0, parseInt(limit));
      }
      
      return {
        success: true,
        products: products,
        totalCount: products.length,
        originalCount: originalCount, // Total before frontend filtering
        message: data.message,
        appliedFilters: {
          categories: filterCategories,
          concerns: concerns,
          search: search
        }
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

// Get available categories
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
    'Sensitive Skin'
  ];
};

// Helper function to get keywords for a specific concern (for debugging/development)
export const getConcernKeywords = (concern) => {
  return SKIN_CONCERN_KEYWORDS[concern] || [];
};

// Helper function to test if a product would match specific concerns (for debugging)
export const testProductConcernMatch = (product, concerns) => {
  return {
    matches: productMatchesConcerns(product, concerns),
    productText: [
      product.name || '',
      product.description || '',
      product.category || ''
    ].join(' ').toLowerCase(),
    concerns: concerns,
    keywords: concerns.map(concern => ({
      concern,
      keywords: SKIN_CONCERN_KEYWORDS[concern] || []
    }))
  };
};