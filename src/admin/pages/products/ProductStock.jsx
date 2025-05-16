import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Trash2, Edit, Plus, ChevronLeft, ChevronRight, ChevronDown, AlertCircle, ShoppingBag } from 'lucide-react';

const ProductStockPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Enhanced mock data to match AddProductPage structure
  const mockProducts = [
    {
      id: 1,
      name: "Cera Ve Cream",
      category: "Moisturizer",
      mainPrice: 6900.00,
      oldPrice: 7500.00,
      quantity: 63,
      description: "CeraVe Moisturizing Cream includes 3 essential ceramides that help restore and maintain the skin's natural barrier.",
      images: ["/api/placeholder/80/80"]
    },
    {
      id: 2,
      name: "The Ordinary Niacinamide",
      category: "Serum",
      mainPrice: 5200.00,
      oldPrice: 5800.00,
      quantity: 42,
      description: "The Ordinary Niacinamide 10% + Zinc 1% is a water-based serum that boosts skin brightness and improves congestion.",
      images: ["/api/placeholder/80/80"]
    },
    {
      id: 3,
      name: "Neutrogena Hydro Boost",
      category: "Moisturizer",
      mainPrice: 4500.00,
      oldPrice: null,
      quantity: 29,
      description: "Neutrogena Hydro Boost water gel quenches dry skin and keeps it looking hydrated, supple, and smooth.",
      images: ["/api/placeholder/80/80"]
    },
    {
      id: 4,
      name: "Paula's Choice BHA Exfoliant",
      category: "Cleanser",
      mainPrice: 8900.00,
      oldPrice: 9500.00,
      quantity: 17,
      description: "Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant gently removes dead skin cells and unclogs pores.",
      images: ["/api/placeholder/80/80"]
    },
    {
      id: 5,
      name: "La Roche-Posay Sunscreen",
      category: "Sunscreens",
      mainPrice: 7200.00,
      oldPrice: 7800.00,
      quantity: 34,
      description: "La Roche-Posay Anthelios provides broad-spectrum SPF 50+ protection against UVA and UVB rays.",
      images: ["/api/placeholder/80/80"]
    },
    {
      id: 6,
      name: "Dove Body Wash",
      category: "Bathe",
      mainPrice: 3200.00,
      oldPrice: 3500.00,
      quantity: 52,
      description: "Dove Deep Moisture Body Wash provides instant softness and nourishment for your skin.",
      images: ["/api/placeholder/80/80"]
    },
    {
      id: 7,
      name: "Cetaphil Gentle Cleanser",
      category: "Cleanser",
      mainPrice: 4800.00,
      oldPrice: null,
      quantity: 38,
      description: "Cetaphil Gentle Skin Cleanser is suitable for all skin types, even sensitive skin.",
      images: ["/api/placeholder/80/80"]
    },
    {
      id: 8,
      name: "Bioderma Micellar Water",
      category: "Cleanser",
      mainPrice: 5100.00,
      oldPrice: 5600.00,
      quantity: 25,
      description: "Bioderma Sensibio H2O is a gentle cleansing and makeup removing water that respects the fragility of sensitive skin.",
      images: ["/api/placeholder/80/80"]
    },
    {
      id: 9,
      name: "Olay Regenerist Serum",
      category: "Serum",
      mainPrice: 8200.00,
      oldPrice: 9000.00,
      quantity: 19,
      description: "Olay Regenerist Micro-Sculpting Serum hydrates to improve elasticity and firm skin for a lifted look.",
      images: ["/api/placeholder/80/80"]
    }
  ];

  // Check for added product notification from location state
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

  useEffect(() => {
    const fetchProducts = () => {
      setIsLoading(true);
      setTimeout(() => {
        setTotalItems(mockProducts.length);
        
        const sortedProducts = [...mockProducts].sort((a, b) => {
          if (sortBy === 'name') {
            return sortDirection === 'asc' 
              ? a.name.localeCompare(b.name) 
              : b.name.localeCompare(a.name);
          } else if (sortBy === 'mainPrice') {
            return sortDirection === 'asc' ? a.mainPrice - b.mainPrice : b.mainPrice - a.mainPrice;
          } else if (sortBy === 'quantity') {
            return sortDirection === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
          }
          return 0;
        });
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);
        
        setProducts(paginatedProducts);
        setIsLoading(false);
      }, 500);
    };

    fetchProducts();

    const handleClickOutside = (event) => {
      if (!event.target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentPage, itemsPerPage, sortBy, sortDirection]);

  const handleSortOption = (option) => {
    if (option === 'name-asc') {
      setSortBy('name');
      setSortDirection('asc');
    } else if (option === 'name-desc') {
      setSortBy('name');
      setSortDirection('desc');
    } else if (option === 'price-asc') {
      setSortBy('mainPrice');
      setSortDirection('asc');
    } else if (option === 'price-desc') {
      setSortBy('mainPrice');
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

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '-';
    return '₦' + price.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const handleDeleteClick = (product) => {
    setActiveProduct(product);
    setShowDeleteModal(true);
  };

  const handleViewClick = (product) => {
    setActiveProduct(product);
    setShowViewModal(true);
  };

  const handleDeleteConfirm = () => {
    // In a real app, you would call an API to delete the product
    const updatedProducts = products.filter(product => product.id !== activeProduct.id);
    setProducts(updatedProducts);
    setTotalItems(prev => prev - 1);
    setShowDeleteModal(false);
    
    // Show success notification
    setNotification({
      type: 'success',
      message: `Product "${activeProduct.name}" has been deleted successfully.`
    });
    
    // Auto-dismiss notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Modal component (for delete and view)
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
            <AlertCircle className={`w-5 h-5 ${iconColor}`} />
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

  // Prepare pagination text
  const getStartItemNumber = () => {
    if (products.length === 0) return 0;
    return currentPage === 1 ? 1 : (currentPage - 1) * itemsPerPage + 1;
  };

  const getEndItemNumber = () => {
    return Math.min(currentPage * itemsPerPage, totalItems);
  };

  // Prepare button class names
  const getPrevButtonClass = () => {
    return currentPage === 1 
      ? "p-1 rounded-md text-gray-300 cursor-not-allowed" 
      : "p-1 rounded-md text-gray-500 hover:bg-gray-100";
  };

  const getNextButtonClass = () => {
    return currentPage === totalPages 
      ? "p-1 rounded-md text-gray-300 cursor-not-allowed" 
      : "p-1 rounded-md text-gray-500 hover:bg-gray-100";
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
      
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-medium text-gray-800">Product Stock</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
                      Quantity (Low to High)
                    </button>
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleSortOption('quantity-desc')}
                    >
                      Quantity (High to Low)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Image</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Quantity</th>
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
                            src={product.images[0] || "/api/placeholder/80/80"} 
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
                        <div className="text-sm text-gray-900">{formatPrice(product.mainPrice)}</div>
                        {product.oldPrice && (
                          <div className="text-xs text-gray-500 line-through">{formatPrice(product.oldPrice)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.quantity}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          <button 
                            className="text-gray-500 hover:text-blue-500"
                            onClick={() => navigate(`/admin/products/edit/${product.id}`)}
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
                  Showing {getStartItemNumber()}-{getEndItemNumber()} of {totalItems}
                </p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={getPrevButtonClass()}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={getNextButtonClass()}
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
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
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
                    src={activeProduct.images[0] || "/api/placeholder/200/200"} 
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
                      <span className="text-sm text-gray-900 font-semibold">{formatPrice(activeProduct.mainPrice)}</span>
                      {activeProduct.oldPrice && (
                        <div className="text-xs text-gray-500 line-through">{formatPrice(activeProduct.oldPrice)}</div>
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
                onClick={() => navigate(`/admin/products/edit/${activeProduct.id}`)}
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