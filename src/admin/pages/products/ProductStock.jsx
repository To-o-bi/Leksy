import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Eye, Trash2, Edit, Plus, ChevronLeft, ChevronRight, ShoppingBag, X, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productService } from '../../../api';
import Loader from '../../../components/common/Loader';

const ProductStockPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Targeting state
  const [targetedProductId, setTargetedProductId] = useState(null);

  // Bulk selection states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const itemsPerPage = 10;

  const decodeHtmlEntities = (text) => {
    if (typeof text !== 'string' || !text.includes('&')) {
      return text;
    }
    let currentText = text;
    let previousText = '';
    let i = 0;
    while (currentText !== previousText && i < 5) {
      previousText = currentText;
      try {
        if (typeof window !== 'undefined') {
          const textarea = document.createElement('textarea');
          textarea.innerHTML = previousText;
          currentText = textarea.value;
        } else {
          break;
        }
      } catch (e) {
        return text;
      }
      i++;
    }
    return currentText;
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await productService.fetchProducts();

      if (response && response.code === 200) {
        setProducts(response.products || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch products');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to load products'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Effect to reset page number when search query or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory]);

  // Get unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))].sort();
    return uniqueCategories;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Text search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        const name = decodeHtmlEntities(product.name).toLowerCase();
        const category = product.category.toLowerCase();
        return name.includes(query) || category.includes(query);
      });
    }

    return filtered;
  }, [products, debouncedSearchQuery, selectedCategory]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const productId = urlParams.get('productId') || urlParams.get('highlight');

    if (productId) {
      setTargetedProductId(productId);

      if (filteredProducts.length > 0) {
        scrollToProduct(productId);
      }

      const timer = setTimeout(() => {
        setTargetedProductId(null);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.search, filteredProducts, currentPage]);

  const scrollToProduct = (productId) => {
    const productIndex = filteredProducts.findIndex(p => p.product_id === productId);
    if (productIndex === -1) return;

    const targetPage = Math.floor(productIndex / itemsPerPage) + 1;

    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }

    setTimeout(() => {
      const element = document.getElementById(`product-row-${productId}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  const handleDelete = async () => {
    if (!activeProduct) return;

    setIsSubmitting(true);
    try {
      const response = await productService.deleteProduct(activeProduct.product_id);

      if (response && response.code === 200) {
        setProducts(prev => prev.filter(p => p.product_id !== activeProduct.product_id));
        setNotification({
          type: 'success',
          message: `Product "${decodeHtmlEntities(activeProduct.name)}" deleted successfully`
        });
        setShowDeleteModal(false);
        setActiveProduct(null);
      } else {
        throw new Error(response?.message || 'Failed to delete product');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to delete product'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectModeToggle = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedProducts(new Set());
  };

  const handleProductSelect = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    const currentProductIds = currentProducts.map(p => p.product_id);
    const allCurrentSelected = currentProductIds.every(id => selectedProducts.has(id));

    const newSelected = new Set(selectedProducts);
    if (allCurrentSelected) {
      currentProductIds.forEach(id => newSelected.delete(id));
    } else {
      currentProductIds.forEach(id => newSelected.add(id));
    }
    setSelectedProducts(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    setIsBulkDeleting(true);
    const selectedProductIds = Array.from(selectedProducts);

    try {
      const deletePromises = selectedProductIds.map(productId =>
        productService.deleteProduct(productId)
      );

      const results = await Promise.allSettled(deletePromises);

      const successfulDeletions = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.code === 200) {
          successfulDeletions.push(selectedProductIds[index]);
        }
      });

      if (successfulDeletions.length > 0) {
        setProducts(prev => prev.filter(p => !successfulDeletions.includes(p.product_id)));
        setNotification({
          type: 'success',
          message: `Successfully deleted ${successfulDeletions.length} product(s).`
        });
      }

      if (successfulDeletions.length < selectedProductIds.length) {
        setNotification({
          type: 'error',
          message: `Deleted ${successfulDeletions.length} products. ${selectedProductIds.length - successfulDeletions.length} failed.`
        });
      }

      setSelectedProducts(new Set());
      setShowBulkDeleteModal(false);
      setIsSelectionMode(false);

    } catch (error) {
      setNotification({
        type: 'error',
        message: 'An error occurred during bulk deletion'
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₦0.00';
    return '₦' + parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getStockColor = (quantity) => {
    const stock = parseInt(quantity, 10) || 0;
    if (stock <= 0) return 'bg-red-100 text-red-800';
    if (stock <= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Check if product has an active discount
  const hasDiscount = (product) => {
    const isApplied = product.isAppliedDiscount === true || product.isAppliedDiscount === 'true';
    const discountPercent = parseFloat(product.discount_percent) || 0;
    const price = parseFloat(product.price) || 0;
    const originalPrice = parseFloat(product.original_price) || price;
    
    return isApplied && discountPercent > 0 && price < originalPrice;
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  const allCurrentPageSelected = currentProducts.length > 0 &&
    currentProducts.every(p => selectedProducts.has(p.product_id));

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      {notification && (
        <div className={`fixed top-2 sm:top-4 left-2 right-2 sm:left-auto sm:right-4 sm:w-auto max-w-md mx-auto sm:mx-0 p-3 sm:p-4 rounded-md shadow-md z-50 ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 sm:ml-4 text-gray-400 text-lg">×</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-medium text-gray-800">Product Stock</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          {!isSelectionMode ? (
            <>
              <button onClick={handleSelectModeToggle} className="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base">
                Select
              </button>
              <button onClick={() => navigate('/admin/products/add')} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md flex items-center justify-center">
                <Plus size={16} />
              </button>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600">{selectedProducts.size} selected</span>
              {selectedProducts.size > 0 && (
                <button onClick={() => setShowBulkDeleteModal(true)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md flex items-center justify-center">
                  <Trash2 size={16} />
                </button>
              )}
              <button onClick={handleSelectModeToggle} className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md flex items-center justify-center">
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Search and Category Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by product name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Info */}
      {(searchQuery || selectedCategory !== 'all') && (
        <div className="mb-4 text-sm text-gray-600 flex items-center justify-between">
          <span>
            Showing {filteredProducts.length} of {products.length} products
            {filteredProducts.length !== products.length && ' (filtered)'}
          </span>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block sm:hidden">
        {isLoading ? (
          <div className="text-center p-8"><Loader /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-8">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{searchQuery || selectedCategory !== 'all' ? 'No products match your search.' : 'No products found'}</p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentProducts.map((product) => {
                const productHasDiscount = hasDiscount(product);
                const originalPrice = parseFloat(product.original_price) || parseFloat(product.price);
                const discountedPrice = parseFloat(product.price);

                return (
                  <div key={product.product_id} id={`product-row-${product.product_id}`} className={`bg-white rounded-lg border p-4 ${targetedProductId === product.product_id ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}>
                    <div className="flex items-start space-x-3">
                      {isSelectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.product_id)}
                          onChange={() => handleProductSelect(product.product_id)}
                          className="rounded mt-1"
                        />
                      )}
                      <img
                        src={product.images?.[0] || '/placeholder.jpg'}
                        alt={decodeHtmlEntities(product.name)}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{decodeHtmlEntities(product.name)}</h3>
                        <p className="text-sm text-gray-600 capitalize mb-1">{product.category}</p>
                        
                        {/* Price Display */}
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">Original: {formatPrice(originalPrice)}</p>
                          {productHasDiscount ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-green-600 font-semibold text-base">
                                {formatPrice(discountedPrice)}
                              </span>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                {product.discount_percent}% OFF
                              </span>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm mt-1">No discount</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(product.available_qty)}`}>
                            Stock: {Math.max(0, parseInt(product.available_qty, 10) || 0)}
                          </span>
                          {!isSelectionMode && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/admin/products/edit/${product.product_id}`)}
                                className="text-gray-500 hover:text-gray-700 p-2"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => { setActiveProduct(product); setShowDeleteModal(true); }}
                                className="text-gray-500 hover:text-red-500 p-2"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!isLoading && filteredProducts.length > 0 && totalPages > 1 && (
              <div className="mt-6 px-4 py-4 bg-white rounded-lg border">
                <div className="flex flex-col space-y-3">
                  <p className="text-sm text-gray-500 text-center">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} className="mr-1" /> Previous
                    </button>
                    <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {isSelectionMode && (
                  <th className="px-3 lg:px-4 py-3 text-left w-12">
                    <input type="checkbox" checked={allCurrentPageSelected} onChange={handleSelectAll} className="rounded" />
                  </th>
                )}
                <th className="px-3 lg:px-4 py-3 text-left text-sm font-medium text-gray-500 w-20">Image</th>
                <th className="px-3 lg:px-4 py-3 text-left text-sm font-medium text-gray-500 min-w-[150px]">Product</th>
                <th className="px-3 lg:px-4 py-3 text-left text-sm font-medium text-gray-500 min-w-[100px]">Category</th>
                <th className="px-3 lg:px-4 py-3 text-left text-sm font-medium text-gray-500 min-w-[110px]">Original Price</th>
                <th className="px-3 lg:px-4 py-3 text-left text-sm font-medium text-gray-500 min-w-[110px]">Discount Price</th>
                <th className="px-3 lg:px-4 py-3 text-left text-sm font-medium text-gray-500 min-w-[80px]">Stock</th>
                <th className="px-3 lg:px-4 py-3 text-left text-sm font-medium text-gray-500 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={isSelectionMode ? 8 : 7} className="text-center p-8"><Loader /></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={isSelectionMode ? 8 : 7} className="text-center p-8">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">{searchQuery || selectedCategory !== 'all' ? 'No products match your search.' : 'No products found'}</p>
                    {(searchQuery || selectedCategory !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => {
                  const productHasDiscount = hasDiscount(product);
                  const originalPrice = parseFloat(product.original_price) || parseFloat(product.price);
                  const discountedPrice = parseFloat(product.price);

                  return (
                    <tr key={product.product_id} id={`product-row-${product.product_id}`} className={`border-b hover:bg-gray-50 ${targetedProductId === product.product_id ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}>
                      {isSelectionMode && (
                        <td className="px-3 lg:px-4 py-3">
                          <input type="checkbox" checked={selectedProducts.has(product.product_id)} onChange={() => handleProductSelect(product.product_id)} className="rounded" />
                        </td>
                      )}
                      <td className="px-3 lg:px-4 py-3">
                        <img src={product.images?.[0] || '/placeholder.jpg'} alt={decodeHtmlEntities(product.name)} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md" />
                      </td>
                      <td className="px-3 lg:px-4 py-3 font-medium text-gray-900">
                        <div className="truncate max-w-[150px] sm:max-w-[200px] lg:max-w-none">{decodeHtmlEntities(product.name)}</div>
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-gray-600">
                        <div className="capitalize truncate">{product.category}</div>
                      </td>
                      <td className="px-3 lg:px-4 py-3 font-medium">{formatPrice(originalPrice)}</td>
                      <td className="px-3 lg:px-4 py-3">
                        {productHasDiscount ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-600">{formatPrice(discountedPrice)}</span>
                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">{product.discount_percent}%</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-3 lg:px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStockColor(product.available_qty)}`}>
                          {Math.max(0, parseInt(product.available_qty, 10) || 0)}
                        </span>
                      </td>
                      <td className="px-3 lg:px-4 py-3">
                        <div className="flex space-x-2 sm:space-x-3">
                          <button onClick={() => navigate(`/admin/products/edit/${product.product_id}`)} disabled={isSelectionMode} className="text-gray-500 hover:text-gray-700 p-1">
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => { setActiveProduct(product); setShowDeleteModal(true); }} disabled={isSelectionMode} className="text-gray-500 hover:text-red-500 p-1">
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredProducts.length > 0 && totalPages > 1 && (
          <div className="px-3 lg:px-4 py-4 flex flex-col sm:flex-row justify-between items-center border-t gap-3 sm:gap-0">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
              </button>
              <span className="text-sm sm:text-base">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to delete "{decodeHtmlEntities(activeProduct?.name)}"? This cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-3 sm:space-y-0">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-md text-sm sm:text-base"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 text-sm sm:text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Bulk Delete</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to delete {selectedProducts.size} product(s)? This cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-3 sm:space-y-0">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 border rounded-md text-sm sm:text-base"
                disabled={isBulkDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 text-sm sm:text-base"
                disabled={isBulkDeleting}
              >
                {isBulkDeleting ? 'Deleting...' : `Delete ${selectedProducts.size} Product(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductStockPage;