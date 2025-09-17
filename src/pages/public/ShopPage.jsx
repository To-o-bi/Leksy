// src/pages/public/ShopPage.js

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import { fetchProducts, handleApiError, getCategoryDisplayName } from '../../utils/api';

const ShopPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedFilters, setSelectedFilters] = useState({
        category: new URLSearchParams(location.search).get('category') || '',
        concerns: location.state?.concerns || []
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [totalProductsCount, setTotalProductsCount] = useState(0);
    const [imagesLoading, setImagesLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState(new Set());

    const productsPerPage = 20;

    const fetchAndFilterProducts = useCallback(async (filters, search) => {
        setLoading(true);
        setError(null);
        setImagesLoading(true);
        setLoadedImages(new Set());
        
        try {
            const result = await fetchProducts({
                category: filters.category,
                concerns: filters.concerns,
                search: search,
                sort: 'name',
            });

            if (result.success) {
                setAllProducts(result.products);
                setTotalProductsCount(result.totalCount);
                setCurrentPage(1);
            } else {
                throw new Error(result.error || 'Failed to fetch or filter products');
            }
        } catch (err) {
            setError(handleApiError(err, 'Failed to process products. Please try again.'));
            setAllProducts([]);
            setTotalProductsCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAndFilterProducts(selectedFilters, searchQuery);
    }, [selectedFilters, searchQuery, fetchAndFilterProducts]);

    useEffect(() => {
        if (location.state?.concerns) {
            setSelectedFilters(prev => ({ ...prev, concerns: location.state.concerns }));
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);
    
    useEffect(() => {
        const total = Math.ceil(totalProductsCount / productsPerPage);
        setTotalPages(total > 0 ? total : 1);
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const currentProducts = allProducts.slice(startIndex, endIndex);
        setProducts(currentProducts);
        
        // Reset image loading state when products change
        if (currentProducts.length > 0) {
            setImagesLoading(true);
            setLoadedImages(new Set());
            
            // Preload images for current page products
            const imagePromises = currentProducts.map((product) => {
                return new Promise((resolve) => {
                    if (product.image) {
                        const img = new Image();
                        img.onload = () => {
                            setLoadedImages(prev => new Set([...prev, product.id]));
                            resolve();
                        };
                        img.onerror = () => resolve(); // Still resolve on error to not block loading
                        img.src = product.image;
                    } else {
                        resolve();
                    }
                });
            });
            
            // Set images as loaded when all are done (or timeout after 3 seconds)
            Promise.allSettled([
                ...imagePromises,
                new Promise(resolve => setTimeout(resolve, 3000))
            ]).then(() => {
                setImagesLoading(false);
            });
        } else {
            setImagesLoading(false);
        }
    }, [allProducts, currentPage, totalProductsCount, productsPerPage]);

    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    const handleFilterChange = useCallback((filters) => {
        setSelectedFilters(prev => ({ ...prev, ...filters }));
    }, []);
    
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const clearAllFilters = useCallback(() => {
        setSelectedFilters({ category: '', concerns: [] });
        setSearchQuery('');
    }, []);

    // Product Grid with Skeleton Loading
    const ProductGridWithLoading = () => {
        if (loading && products.length === 0) {
            return <ProductGridSkeleton />;
        }

        if (products.length === 0 && !loading && !error) {
            return (
                <div className="text-center py-12">
                    <div className="text-5xl mb-4">😕</div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-6">
                        {hasActiveFilters ? 'Try adjusting your filters or search criteria' : 'No products available at the moment'}
                    </p>
                    {hasActiveFilters && (
                        <button 
                            onClick={clearAllFilters} 
                            className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="relative">
                {imagesLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-md">
                        <div className="text-center">
                            <Loader />
                            <p className="mt-2 text-sm text-gray-600">Loading images...</p>
                        </div>
                    </div>
                )}
                <ProductGrid 
                    products={products} 
                    loadedImages={loadedImages}
                    showSkeletons={imagesLoading}
                />
            </div>
        );
    };

    // Skeleton loading component for product grid
    const ProductGridSkeleton = () => {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {Array.from({ length: productsPerPage }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border animate-pulse">
                        <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                        <div className="p-3">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    if (loading && products.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader />
            </div>
        );
    }
    
    const hasActiveFilters = selectedFilters.category || selectedFilters.concerns.length > 0 || searchQuery.trim();

    return (
        <div className="flex flex-col min-h-screen">
            <Breadcrumb
                items={[
                    { label: 'Home', path: '/' },
                    { label: 'Shop', path: '/shop' },
                    ...(selectedFilters.category ? [{
                        label: getCategoryDisplayName(selectedFilters.category),
                        path: `/shop?category=${encodeURIComponent(selectedFilters.category)}`
                    }] : [])
                ]}
            />
            
            <div className="w-[87%] mx-auto py-8">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="relative w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full md:w-64 pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition-colors"
                            />
                            <svg className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            <div className="text-sm text-gray-600 flex-grow md:flex-grow-0">
                                {loading && !products.length ? 'Loading...' : `Showing ${products.length} of ${totalProductsCount} products`}
                            </div>
                            <div className="hidden md:flex gap-6 flex-wrap">
                                <ProductFilters
                                    selectedFilters={selectedFilters}
                                    onFilterChange={handleFilterChange}
                                    horizontal={true}
                                    compact={true}
                                />
                            </div>
                            <button 
                                className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors" 
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                </svg>
                                Filters
                            </button>
                        </div>
                    </div>
                    
                    {showMobileFilters && (
                        <div className="md:hidden bg-gray-50 p-4 rounded-md mb-4">
                            <ProductFilters selectedFilters={selectedFilters} onFilterChange={handleFilterChange} compact={true} />
                        </div>
                    )}
                    
                    {hasActiveFilters && (
                        <div className="bg-gray-50 p-4 rounded-md mb-6 flex flex-col md:flex-row items-start md:items-center justify-between">
                            <div className="flex flex-wrap gap-2 items-center mb-3 md:mb-0">
                                <span className="text-sm text-gray-700 font-medium">Active filters:</span>
                                {selectedFilters.category && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800">
                                        {getCategoryDisplayName(selectedFilters.category)}
                                        <button 
                                            onClick={() => handleFilterChange({ category: '' })} 
                                            className="ml-2 focus:outline-none hover:text-pink-900 transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </span>
                                )}
                                {selectedFilters.concerns.map((concern, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800">
                                        {concern}
                                        <button onClick={() => {
                                            const updatedConcerns = selectedFilters.concerns.filter(c => c !== concern);
                                            handleFilterChange({ concerns: updatedConcerns });
                                        }} className="ml-2 focus:outline-none hover:text-pink-900 transition-colors">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                                {searchQuery.trim() && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800">
                                        Search: "{searchQuery}"
                                        <button 
                                            onClick={() => setSearchQuery('')} 
                                            className="ml-2 focus:outline-none hover:text-pink-900 transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </span>
                                )}
                            </div>
                            <button 
                                onClick={clearAllFilters} 
                                className="text-sm text-pink-600 hover:text-pink-800 font-medium flex items-center transition-colors"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}
                
                <ProductGridWithLoading />
                
                {totalPages > 1 && products.length > 0 && (
                    <div className="mt-8 mb-12">
                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={handlePageChange} 
                        />
                        <div className="text-center mt-4 text-sm text-gray-500">
                            Page {currentPage} of {totalPages} • Showing {products.length} products • {totalProductsCount} total
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopPage;