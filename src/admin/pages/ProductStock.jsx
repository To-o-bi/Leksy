import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Edit, Plus, ChevronLeft, ChevronRight, ChevronDown, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import productService from '../../api/services/productService';

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
        // Prepare query parameters
        const queryParams = {
          page: currentPage,
          limit: itemsPerPage,
          sort: sortBy,
          sortDirection: sortDirection
        };
        
        // Call the API through our service
        const response = await productService.fetchProducts(queryParams);
        
        // API response should include:
        // - products array
        // - total count for pagination
        if (response && response.products) {
          setProducts(response.products);
          setTotalItems(response.total || response.products.length);
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load products. Please try again.'
        });
        
        // Fallback to empty array if API fails
        setProducts([]);
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
      setSortBy('quantity');
      setSortDirection('asc');
    } else if (option === 'quantity-desc') {
      setSortBy('quantity');
      setSortDirection('desc');
    }
    setShowSortDropdown(false);
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
    return '₦' + parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  // Handle edit button click - navigate to edit page
  const handleEditClick = (product) => {
    navigate(`/admin/products/edit/${product.id}`);
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
    if (!activeProduct || !activeProduct.id) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the delete API
      await productService.deleteProduct(activeProduct.id);
      
      // Update local state
      setProducts(products.filter(product => product.id !== activeProduct.id));
      setTotalItems(prev => prev - 1);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `Product "${activeProduct.name}" has been deleted successfully.`
      });
      
      // Close modal
      setShowDeleteModal(false);
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

  // Modal component to reduce repetition
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => {
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
        <button onClick={onDismiss} className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1.5">
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
            {/* Navigate to Add Product Page instead of modal */}
            <button 
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md flex items-center"
              onClick={() => navigate('/admin/products/add')}
            >
              <span className="mr-2">Add New</span>
              <Plus size={16} />
            </button>
            
            <div className="relative sort-dropdown w-full sm:w-auto">
              <button 
                className="flex items-center justify-between bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-700 w-full sm:w-auto"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                <span className="mr-2">Sort By</span>
                <ChevronDown size={16} />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleSortOption('name-asc')}
                    >
                      Name (A-Z)
                    </button>
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleSortOption('name-desc')}
                    >
                      Name (Z-A)
                    </button>
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleSortOption('price-asc')}
                    >
                      Price (Low to High)
                    </button>
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleSortOption('price-desc')}
                    >
                      Price (High to Low)
                    </button>
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleSortOption('quantity-asc')}
                    >
                      Stock (Low to High)
                    </button>
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleSortOption('quantity-desc')}
                    >
                      Stock (High to Low)
                    </button>
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
                <tr className="bg-white border-b">
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
                    <td colSpan="6" className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center py-6">
                        <ShoppingBag size={48} className="text-gray-300 mb-3" />
                        <p className="text-gray-500">No products found</p>
                        <button 
                          onClick={() => navigate('/admin/products/add')}
                          className="mt-3 text-pink-500 hover:text-pink-600 text-sm"
                        >
                          Add your first product
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden bg-gray-100">
                          <img 
                            src={product.image_url || "/api/placeholder/64/64"} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{product.category}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                        {product.slashed_price && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(product.slashed_price)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.quantity === 0 
                              ? 'bg-red-100 text-red-800' 
                              : product.quantity <= 10 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {product.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          <button 
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => handleEditClick(product)}
                            aria-label="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="text-gray-500 hover:text-red-500"
                            onClick={() => handleDeleteClick(product)}
                            aria-label="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button 
                            className="text-gray-500 hover:text-blue-500"
                            onClick={() => handleViewClick(product)}
                            aria-label="View"
                          >
                            <Eye size={18} />
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
          {products.length > 0 && (
            <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  Showing {currentPage === 1 ? 1 : (currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                </p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-1 rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded-md ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
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
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        {activeProduct && (
          <>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-medium">{activeProduct.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center ${
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
                ) : 'Delete'}
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
                    src={activeProduct.image_url || "/api/placeholder/200/200"} 
                    alt={activeProduct.name} 
                    className="w-full h-full object-contain" 
                  />
                </div>
              </div>
              <div className="w-full sm:w-2/3">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{activeProduct.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{activeProduct.category}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Price:</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-900 font-semibold">{formatPrice(activeProduct.price)}</span>
                      {activeProduct.slashed_price && (
                        <div className="text-xs text-gray-500 line-through">{formatPrice(activeProduct.slashed_price)}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Stock:</span>
                    <span className="text-sm text-gray-900">{activeProduct.quantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Product ID:</span>
                    <span className="text-sm text-gray-900">#{activeProduct.id}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {activeProduct.description && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{activeProduct.description}</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => handleEditClick(activeProduct)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
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