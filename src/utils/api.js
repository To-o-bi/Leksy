// utils/api.js - Corrected version with Strict Filtering

const BASE_URL = 'https://leksycosmetics.com/api';

// Helper function to handle API errors
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);
    if (error.response) {
        return error.response.data?.message || defaultMessage;
    } else if (error.request) {
        return 'Network error. Please check your connection.';
    } else {
        return error.message || defaultMessage;
    }
};

// --- START: MODIFIED SECTION ---

// ADDED: Helper to ensure product.concern_options is always a usable array
const normalizeProduct = (product) => {
    let concerns = [];
    if (Array.isArray(product.concern_options)) {
        concerns = product.concern_options;
    } else if (typeof product.concern_options === 'string' && product.concern_options.trim() !== '') {
        try {
            // Best case: It's a valid JSON array string '["a", "b"]'
            const parsed = JSON.parse(product.concern_options);
            if (Array.isArray(parsed)) {
                concerns = parsed;
            }
        } catch (e) {
            // Fallback: It's a comma-separated string "a,b"
            concerns = product.concern_options.split(',').map(c => c.trim()).filter(Boolean);
        }
    }
    // Return the product with a guaranteed array for concern_options
    return { ...product, concern_options: concerns };
};


// ADDED: A map to translate filter labels (e.g., "Sensitive Skin") to database values (e.g., "sensitive_skin")
const CONCERN_LABEL_TO_VALUE = {
    'Anti-Aging': 'anti_aging',
    'Oily Skin': 'oily_skin',
    'Dry Skin': 'dry_skin',
    'Acne': 'acne',
    'Hyperpigmentation': 'hyperpigmentation',
    'Sensitive Skin': 'sensitive_skin'
};

// REPLACED: This function now uses strict, accurate filtering
const productMatchesConcerns = (product, selectedConcernLabels) => {
    if (!selectedConcernLabels || selectedConcernLabels.length === 0) {
        return true; // If no filter is applied, show all products
    }

    // Get the database values for the selected filter labels
    const selectedConcernValues = selectedConcernLabels.map(label => CONCERN_LABEL_TO_VALUE[label]);
    
    // Get the product's assigned concerns (which are already database values)
    const productConcernValues = product.concern_options || [];

    // Show the product if AT LEAST ONE of its concerns matches AT LEAST ONE of the selected filters.
    return selectedConcernValues.some(filterValue => productConcernValues.includes(filterValue));
};

// --- END: MODIFIED SECTION ---


// Enhanced search function (this can remain as-is)
const productMatchesSearch = (product, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase().trim();
    const productText = [
        product.name || '',
        product.description || '',
        product.category || '',
        product.brand || '',
        ...(product.tags || [])
    ].join(' ').toLowerCase();
    const searchWords = search.split(/\s+/);
    return searchWords.every(word => productText.includes(word));
};

// Fetch a single product by ID
export const fetchProduct = async (productId) => {
    try {
        const response = await fetch(`${BASE_URL}/fetch-product?product_id=${productId}`);
        const data = await response.json();
        if (response.ok && data.code === 200) {
            return { success: true, product: data.product };
        } else {
            throw new Error(data.message || 'Failed to fetch product');
        }
    } catch (error) {
        return { success: false, error: handleApiError(error, 'Failed to fetch product') };
    }
};

// Enhanced fetch products with the corrected filtering logic
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

        const params = new URLSearchParams();
        const filterCategories = [];
        if (category) filterCategories.push(category);
        if (categories.length > 0) filterCategories.push(...categories);
        if (filterCategories.length > 0) params.append('filter', filterCategories.join(','));
        if (productIds.length > 0) params.append('products_ids_array', productIds.join(','));
        if (sort) params.append('sort', sort);

        const url = `${BASE_URL}/fetch-products${params.toString() ? '?' + params.toString() : ''}`;
        console.log('Fetching products from:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok && data.code === 200) {
            // MODIFIED: Normalize data as soon as it arrives
            let products = (data.products || []).map(normalizeProduct);
            const originalCount = products.length;
            
            // Apply search filter (client-side)
            if (search && search.trim()) {
                products = products.filter(product => productMatchesSearch(product, search));
            }
            
            // Apply concerns filter (client-side) using the new strict function
            if (concerns.length > 0) {
                products = products.filter(product => productMatchesConcerns(product, concerns));
            }
            
            // Apply limit after filtering
            if (limit) {
                products = products.slice(0, parseInt(limit));
            }
            
            return {
                success: true,
                products: products,
                totalCount: products.length,
                originalCount: originalCount,
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

// Fetch products by specific IDs
export const fetchProductsByIds = async (productIds) => {
    if (!productIds || productIds.length === 0) {
        return { success: true, products: [], totalCount: 0 };
    }
    return fetchProducts({ productIds });
};

// --- UNCHANGED HELPER FUNCTIONS ---

export const getCategories = () => {
    return [ 'serums', 'moisturizers', 'bathe and body', 'sunscreens', 'toners', 'face cleansers' ];
};

export const getCategoryDisplayName = (category) => {
    const categoryDisplayNames = {
        'serums': 'Serums', 'moisturizers': 'Moisturizers', 'bathe and body': 'Bathe and Body',
        'sunscreens': 'Sunscreens', 'toners': 'Toners', 'face cleansers': 'Face Cleansers'
    };
    return categoryDisplayNames[category] || category;
};

// This now provides the LABELS for the UI filter component.
export const getSkinConcerns = () => {
    return [ 'Anti-Aging', 'Oily Skin', 'Dry Skin', 'Acne', 'Hyperpigmentation', 'Sensitive Skin' ];
};