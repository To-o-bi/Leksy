import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import Hero from '../../components/shop/Hero';
import { useProducts } from '../../contexts/ProductContext';

const ShopPage = () => { 
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the ProductContext - correct method names
  const { 
    products: productsList, 
    loading, 
    error, 
    fetchAllProducts,
    filterByCategory,
    clearError,
    refreshProducts
  } = useProducts();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    concerns: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const productsPerPage = 20;
  
  // Create a stable fetchProducts function using useCallback
  const fetchProducts = useCallback(async () => {
    clearError();
    
    try {
      // Always fetch all products, then filter client-side
      await fetchAllProducts();
    } catch (err) {
      console.error('Error fetching products in component:', err);
    }
  }, [fetchAllProducts, clearError]);

  // Extract category from URL parameters and concerns from location state
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    
    const newFilters = { ...selectedFilters };
    
    if (categoryParam) {
      newFilters.category = categoryParam;
    }
    
    if (location.state?.filterByConcern && location.state?.concerns) {
      newFilters.concerns = location.state.concerns;
    }
    
    if (
      newFilters.category !== selectedFilters.category ||
      JSON.stringify(newFilters.concerns) !== JSON.stringify(selectedFilters.concerns)
    ) {
      setSelectedFilters(newFilters);
      
      if (location.state?.filterByConcern) {
        navigate(location.pathname + location.search, { replace: true, state: {} });
      }
    }
  }, [location, navigate, selectedFilters]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on all criteria
  useEffect(() => {
    if (!productsList || productsList.length === 0) {
      setFilteredProducts([]);
      setTotalPages(1);
      return;
    }
    
    let result = [...productsList];
    
    // Apply category filter using context method
    if (selectedFilters.category && selectedFilters.category !== 'All Products') {
      result = filterByCategory(selectedFilters.category);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      result = result.filter(product => 
        (product.name && product.name.toLowerCase().includes(searchTerm)) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply concerns filter (client-side filtering for concerns)
    if (selectedFilters.concerns && selectedFilters.concerns.length > 0) {
      result = result.filter(p => 
        p.concerns && selectedFilters.concerns.some(concern => p.concerns.includes(concern))
      );
    }
    
    // Calculate total pages
    const totalFilteredProducts = result.length;
    setTotalPages(Math.ceil(totalFilteredProducts / productsPerPage));
    
    // Apply pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = result.slice(startIndex, startIndex + productsPerPage);
    
    setFilteredProducts(paginatedProducts);
  }, [productsList, selectedFilters.category, searchQuery, currentPage, productsPerPage, selectedFilters.concerns, filterByCategory]);

  // Search handler
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  // Filter change handler
  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(prev => ({ ...prev, ...filters }));
    setCurrentPage(1);
    
    // Update URL with new category
    if (filters.category !== undefined && filters.category !== selectedFilters.category) {
      const searchParams = new URLSearchParams(location.search);
      
      if (filters.category && filters.category !== 'All Products') {
        searchParams.set('category', filters.category);
      } else {
        searchParams.delete('category');
      }
      
      navigate({
        pathname: location.pathname,
        search: searchParams.toString()
      }, { replace: true });
    }
  }, [location.search, navigate, selectedFilters.category]);
  
  // Page change handler
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedFilters({
      category: '',
      concerns: []
    });
    setSearchQuery('');
    navigate(location.pathname, { replace: true });
  }, [navigate, location.pathname]);
  
  // Retry handler using refreshProducts
  const handleRetry = useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl py-16">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl py-16 text-center">
        <h2 className="text-2xl font-semibold text-red-600">Error Loading Products</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
            onClick={handleRetry}
          >
            Try Again
          </button>
          <button 
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = selectedFilters.category || selectedFilters.concerns.length > 0 || searchQuery.trim();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Breadcrumb navigation */}
      <Breadcrumb 
        items={[
          { label: 'Home', path: '/' },
          { label: 'Shop', path: '/shop' },
          ...(selectedFilters.category ? [{ label: selectedFilters.category, path: `/shop?category=${encodeURIComponent(selectedFilters.category)}` }] : [])
        ]} 
      />
      
      {/* Hero banner */}
      <Hero />
      
      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl py-8">
        
        {/* Filters and search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Search */}
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Search Product"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full md:w-64 pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <svg 
                className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="text-sm text-gray-600 flex-grow md:flex-grow-0">
                Showing {filteredProducts.length} of {productsList.length} products
              </div>
              
              {/* Desktop filters */}
              <div className="hidden md:flex gap-6 flex-wrap">
                <ProductFilters 
                  selectedFilters={selectedFilters}
                  onFilterChange={handleFilterChange}
                  horizontal={true}
                  compact={true}
                />
              </div>
              
              {/* Mobile filter button */}
              <button 
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
                More Filters
              </button>
            </div>
          </div>
          
          {/* Mobile filters */}
          {showMobileFilters && (
            <div className="md:hidden bg-gray-50 p-4 rounded-md mb-4">
              <ProductFilters 
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                compact={true}
              />
            </div>
          )}
          
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="bg-gray-50 p-4 rounded-md mb-6 flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center mb-3 md:mb-0">
                <span className="text-sm text-gray-700 font-medium">Active filters:</span>
                
                {selectedFilters.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800">
                    {selectedFilters.category}
                    <button 
                      onClick={() => handleFilterChange({ category: '' })}
                      className="ml-2 focus:outline-none"
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
                    <button 
                      onClick={() => {
                        const updatedConcerns = selectedFilters.concerns.filter(c => c !== concern);
                        handleFilterChange({ concerns: updatedConcerns });
                      }}
                      className="ml-2 focus:outline-none"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </span>
                ))}
                
                {searchQuery.trim() && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800">
                    Search: {searchQuery}
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="ml-2 focus:outline-none"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </span>
                )}
              </div>
              
              {/* Clear all filters button */}
              <button 
                onClick={clearAllFilters}
                className="text-sm text-pink-600 hover:text-pink-800 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Clear all filters
              </button>
            </div>
          )}
        </div>
        
        {/* Product grid */}
        <ProductGrid products={filteredProducts} />
        
        {/* No products found */}
        {filteredProducts.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">😕</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
            <button 
              onClick={clearAllFilters}
              className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && filteredProducts.length > 0 && (
          <div className="mt-8 mb-12">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
            <div className="text-center mt-4 text-sm text-gray-500">
              Page {currentPage} of {totalPages} • Showing {filteredProducts.length} of {productsList.length} products
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;