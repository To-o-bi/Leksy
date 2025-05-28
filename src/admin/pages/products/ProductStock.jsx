import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Edit, Plus, ChevronLeft, ChevronRight, ChevronDown, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import productService from '../../../api/services/productService';

const ProductStockPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for notifications from location state (e.g., from add/edit page)
  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setNotification(null);
        // Clear the location state
        window.history.replaceState({}, document.title);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Prepare query parameters that match the API expectations
        const queryParams = {
          sort: sortBy, // API only accepts: name|price|category (no direction)
        };
        
        console.log('Fetching products with params:', queryParams);
        
        // Call the API through our service
        const response = await productService.fetchProducts(queryParams);
        
        console.log('Products API response:', response);
        
        // Handle the response structure from the API
        if (response && response.code === 200) {
          let productsList = response.products || [];
          
          // Map API response fields to match component expectations
          productsList = productsList.map(product => ({
            ...product,
            id: product.product_id, // Map product_id to id
            quantity: product.available_qty, // Map available_qty to quantity
            image_url: product.images && product.images.length > 0 ? product.images[0] : null
          }));
          
          // Sort products locally since API doesn't support direction
          productsList.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
              case 'name':
                aValue = (a.name || '').toLowerCase();
                bValue = (b.name || '').toLowerCase();
                break;
              case 'price':
                aValue = parseFloat(a.price) || 0;
                bValue = parseFloat(b.price) || 0;
                break;
              case 'category':
                aValue = (a.category || '').toLowerCase();
                bValue = (b.category || '').toLowerCase();
                break;
              default:
                return 0;
            }
            
            if (sortDirection === 'desc') {
              return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            } else {
              return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            }
          });
          
          // Handle pagination locally since API doesn't support it
          const startIndex = (currentPage - 1) * itemsPerPage;
          const paginatedProducts = productsList.slice(startIndex, startIndex + itemsPerPage);
          
          setProducts(paginatedProducts);
          setTotalItems(productsList.length);
        } else {
          throw new Error(response?.message || 'Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setNotification({
          type: 'error',
          message: error.message || 'Failed to load products. Please try again.'
        });
        
        // Fallback to empty array if API fails
        setProducts([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, itemsPerPage, sortBy, sortDirection]);

  // Handle clicks outside of dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle sort option selection
  const handleSortOption = (option) => {
    if (option === 'name-asc') {
      setSortBy('name');
      setSortDirection('asc');
    } else if (option === 'name-desc') {
      setSortBy('name');
      setSortDirection('desc');
    } else if (option === 'price-asc') {
      setSortBy('price');
      setSortDirection('asc');
    } else if (option === 'price-desc') {
      setSortBy('price');
      setSortDirection('desc');
    } else if (option === 'quantity-asc') {
      setSortBy('name'); // API doesn't support quantity sorting, fallback to name
      setSortDirection('asc');
    } else if (option === 'quantity-desc') {
      setSortBy('name'); // API doesn't support quantity sorting, fallback to name
      setSortDirection('desc');
    }
    setShowSortDropdown(false);
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Handle pagination
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Format price with Naira symbol
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₦0.00';
    return '₦' + parseFloat(price).toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  // Handle edit button click - navigate to edit page
  const handleEditClick = (product) => {
    navigate(`/admin/products/edit/${product.product_id || product.id}`);
  };

  // Handle delete button click - show confirmation modal
  const handleDeleteClick = (product) => {
    setActiveProduct(product);
    setShowDeleteModal(true);
  };

  // Handle view button click - show view modal
  const handleViewClick = (product) => {
    setActiveProduct(product);
    setShowViewModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!activeProduct || !(activeProduct.product_id || activeProduct.id)) return;
    
    setIsSubmitting(true);
    
    try {
      const productId = activeProduct.product_id || activeProduct.id;
      console.log('Deleting product with ID:', productId);
      
      // Call the delete API
      const response = await productService.deleteProduct(productId);
      
      console.log('Delete response:', response);
      
      if (response && response.code === 200) {
        // Update local state by removing the deleted product
        setProducts(prevProducts => 
          prevProducts.filter(product => 
            (product.product_id || product.id) !== productId
          )
        );
        setTotalItems(prev => Math.max(0, prev - 1));
        
        // Show success notification
        setNotification({
          type: 'success',
          message: response.message || `Product "${activeProduct.name}" has been deleted successfully.`
        });
        
        // If we're on a page with no products left, go to previous page
        if (products.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        throw new Error(response?.message || 'Failed to delete product');
      }
      
      // Close modal
      setShowDeleteModal(false);
      setActiveProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: error.message || 'Failed to delete product. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort options for the dropdown
  const sortOptions = [
    { id: 'name-asc', label: 'Name (A-Z)' },
    { id: 'name-desc', label: 'Name (Z-A)' },
    { id: 'price-asc', label: 'Price (Low to High)' },
    { id: 'price-desc', label: 'Price (High to Low)' },
    { id: 'quantity-asc', label: 'Stock (Low to High)' },
    { id: 'quantity-desc', label: 'Stock (High to Low)' }
  ];

  // Get current sort option label
  const getCurrentSortLabel = () => {
    const currentOption = sortOptions.find(option => {
      if (sortBy === 'name' && sortDirection === 'asc') return option.id === 'name-asc';
      if (sortBy === 'name' && sortDirection === 'desc') return option.id === 'name-desc';
      if (sortBy === 'price' && sortDirection === 'asc') return option.id === 'price-asc';
      if (sortBy === 'price' && sortDirection === 'desc') return option.id === 'price-desc';
      return false;
    });
    return currentOption ? currentOption.label : 'Sort By';
  };

  // Modal component to reduce repetition
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  // Notification component
  const Notification = ({ type, message, onDismiss }) => {
    const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
    const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';
    
    return (
      <div className={`fixed top-4 right-4 flex p-4 mb-4 ${bgColor} ${textColor} border-l-4 ${borderColor} rounded-md shadow-md max-w-md z-50`}>
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button onClick={onDismiss} className="ml-auto -mx-1.5 -my-1.5 bg-white/50 text-gray-400 hover:text-gray-900 rounded-lg p-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onDismiss={() => setNotification(null)} 
        />
      )}
      
      {/* Main Content */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-medium text-gray-800">Product Stock</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Navigate to Add Product Page */}
            <button 
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
              onClick={() => navigate('/admin/products/add')}
            >
              <Plus size={16} className="mr-2" />
              <span>Add New</span>
            </button>
            
            <div className="relative sort-dropdown w-full sm:w-auto">
              <button 
                className="flex items-center justify-between bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-700 w-full sm:w-auto min-w-[160px] hover:bg-gray-50 transition-colors"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                <span className="mr-2">{getCurrentSortLabel()}</span>
                <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    {sortOptions.map(option => (
                      <button 
                        key={option.id}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                        onClick={() => handleSortOption(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Table - Responsive */}
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Image</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mb-2"></div>
                        <p className="text-gray-500 text-sm">Loading products...</p>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center py-6">
                        <ShoppingBag size={48} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 mb-2">No products found</p>
                        <button 
                          onClick={() => navigate('/admin/products/add')}
                          className="text-pink-500 hover:text-pink-600 text-sm font-medium transition-colors"
                        >
                          Add your first product
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.product_id || product.id || `product-${Math.random()}`} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden bg-gray-100">
                          <img 
                            src={product.image_url || (product.images && product.images[0]) || "/api/placeholder/64/64"} 
                            alt={product.name || 'Product image'} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/api/placeholder/64/64";
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {product.name || 'Unnamed Product'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {product.category || 'Uncategorized'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {formatPrice(product.price)}
                        </div>
                        {product.slashed_price && parseFloat(product.slashed_price) > 0 && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(product.slashed_price)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (product.quantity || product.available_qty || 0) === 0 
                              ? 'bg-red-100 text-red-800' 
                              : (product.quantity || product.available_qty || 0) <= 10 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {product.quantity || product.available_qty || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          <button 
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                            onClick={() => handleViewClick(product)}
                            aria-label="View product details"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            onClick={() => handleEditClick(product)}
                            aria-label="Edit product"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="text-gray-500 hover:text-red-500 transition-colors"
                            onClick={() => handleDeleteClick(product)}
                            aria-label="Delete product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && products.length > 0 && totalPages > 1 && (
            <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t">
              <div>
                <p className="text-sm text-gray-500">
                  Showing {currentPage === 1 ? 1 : (currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} products
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md transition-colors ${
                    currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md transition-colors ${
                    currentPage === totalPages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isSubmitting && setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        {activeProduct && (
          <>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-medium">"{activeProduct.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel 
              </button>
              <button
                onClick={handleDeleteConfirm}
                className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center transition-colors ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* View Product Modal */}
      <Modal
        isOpen={showViewModal && activeProduct}
        onClose={() => setShowViewModal(false)}
        title="Product Details"
      >
        {activeProduct && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="w-full sm:w-1/3">
                <div className="w-full h-40 rounded-md overflow-hidden bg-gray-100">
                  <img 
                    src={activeProduct.image_url || (activeProduct.images && activeProduct.images[0]) || "/api/placeholder/200/200"} 
                    alt={activeProduct.name || 'Product image'} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/200/200";
                    }}
                  />
                </div>
              </div>
              <div className="w-full sm:w-2/3">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {activeProduct.name || 'Unnamed Product'}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {activeProduct.category || 'Uncategorized'}
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Price:</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-900 font-semibold">
                        {formatPrice(activeProduct.price)}
                      </span>
                      {activeProduct.slashed_price && parseFloat(activeProduct.slashed_price) > 0 && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatPrice(activeProduct.slashed_price)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Stock:</span>
                    <span className="text-sm text-gray-900">{activeProduct.quantity || activeProduct.available_qty || 0} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Product ID:</span>
                    <span className="text-sm text-gray-900">#{activeProduct.product_id || activeProduct.id}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {activeProduct.description && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {activeProduct.description}
                </p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditClick(activeProduct);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center transition-colors"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProductStockPage;