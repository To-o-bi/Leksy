// src/utils/api.js

const BASE_URL = 'https://leksycosmetics.com/api';

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

const normalizeProduct = (product) => {
    let concerns = [];
    if (Array.isArray(product.concern_options)) {
        concerns = product.concern_options;
    } else if (typeof product.concern_options === 'string' && product.concern_options.trim() !== '') {
        try {
            const parsed = JSON.parse(product.concern_options);
            if (Array.isArray(parsed)) {
                concerns = parsed;
            }
        } catch (e) {
            concerns = product.concern_options.split(',').map(c => c.trim()).filter(Boolean);
        }
    }
    return { ...product, concern_options: concerns };
};

const CONCERN_LABEL_TO_VALUE = {
    'Anti-Aging': 'anti_aging',
    'Oily Skin': 'oily_skin',
    'Dry Skin': 'dry_skin',
    'Acne': 'acne',
    'Hyperpigmentation': 'hyperpigmentation',
    'Sensitive Skin': 'sensitive_skin'
};

const productMatchesConcerns = (product, selectedConcernLabels) => {
    if (!selectedConcernLabels || selectedConcernLabels.length === 0) {
        return true;
    }
    const selectedConcernValues = selectedConcernLabels.map(label => CONCERN_LABEL_TO_VALUE[label]);
    const productConcernValues = product.concern_options || [];
    return selectedConcernValues.some(filterValue => productConcernValues.includes(filterValue));
};

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

export const fetchProducts = async (options = {}) => {
    try {
        const {
            category = '',
            concerns = [],
            search = '',
            sort = '',
            limit = '',
        } = options;

        const params = new URLSearchParams();
        if (category) {
            params.append('filter', category);
        }
        if (sort) {
            params.append('sort', sort);
        }

        const url = `${BASE_URL}/fetch-products${params.toString() ? '?' + params.toString() : ''}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok && data.code === 200) {
            let products = (data.products || []).map(normalizeProduct);
            
            if (search && search.trim()) {
                products = products.filter(product => productMatchesSearch(product, search));
            }
            
            if (concerns.length > 0) {
                products = products.filter(product => productMatchesConcerns(product, concerns));
            }
            
            if (limit) {
                products = products.slice(0, parseInt(limit));
            }
            
            return {
                success: true,
                products: products,
                totalCount: products.length,
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

export const getSkinConcerns = () => {
    return [ 'Anti-Aging', 'Oily Skin', 'Dry Skin', 'Acne', 'Hyperpigmentation', 'Sensitive Skin' ];
};