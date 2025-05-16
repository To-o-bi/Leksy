import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Edit, Plus, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const ProductStockPage = () => {
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    price: '',
    piece: ''
  });

  // Mock data for demonstration
  const mockProducts = [
    {
      id: 1,
      name: "Cera Ve Cream",
      category: "Serum",
      price: 6900.00,
      piece: 63,
      image: "/api/placeholder/64/64"
    },
    {
      id: 2,
      name: "Cera Ve Cream",
      category: "Cleanser",
      price: 3900.00,
      piece: 13,
      image: "/api/placeholder/64/64"
    },
    {
      id: 3,
      name: "Cera Ve Cream",
      category: "Serum",
      price: 600.00,
      piece: 635,
      image: "/api/placeholder/64/64"
    },
    {
      id: 4,
      name: "Cera Ve Cream",
      category: "Serum",
      price: 8100.00,
      piece: 67,
      image: "/api/placeholder/64/64"
    },
    {
      id: 5,
      name: "Cera Ve Cream",
      category: "Serum",
      price: 6300.00,
      piece: 52,
      image: "/api/placeholder/64/64"
    },
    {
      id: 6,
      name: "Cera Ve Cream",
      category: "Cleanser",
      price: 2900.00,
      piece: 13,
      image: "/api/placeholder/64/64"
    },
    {
      id: 7,
      name: "Cera Ve Cream",
      category: "Cleanser",
      price: 36900.00,
      piece: 635,
      image: "/api/placeholder/64/64"
    },
    {
      id: 8,
      name: "Cera Ve Cream",
      category: "Serum",
      price: 5900.00,
      piece: 89,
      image: "/api/placeholder/64/64"
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch products
    const fetchProducts = () => {
      setIsLoading(true);
      // In a real application, you would fetch from an API
      setTimeout(() => {
        setTotalItems(mockProducts.length);
        
        // Sort products
        const sortedProducts = [...mockProducts].sort((a, b) => {
          if (sortBy === 'name') {
            return sortDirection === 'asc' 
              ? a.name.localeCompare(b.name) 
              : b.name.localeCompare(a.name);
          } else if (sortBy === 'price') {
            return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
          } else if (sortBy === 'piece') {
            return sortDirection === 'asc' ? a.piece - b.piece : b.piece - a.piece;
          }
          return 0;
        });
        
        // Paginate
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);
        
        setProducts(paginatedProducts);
        setIsLoading(false);
      }, 500);
    };

    fetchProducts();

    // Close dropdowns when clicking outside
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
    } else if (option === 'piece-asc') {
      setSortBy('piece');
      setSortDirection('asc');
    } else if (option === 'piece-desc') {
      setSortBy('piece');
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

  // Format price with commas
  const formatPrice = (price) => {
    return '₦' + price.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  // Handle edit button click
  const handleEditClick = (product) => {
    setActiveProduct(product);
    setEditFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      piece: product.piece
    });
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (product) => {
    setActiveProduct(product);
    setShowDeleteModal(true);
  };

  // Handle view button click
  const handleViewClick = (product) => {
    setActiveProduct(product);
    setShowViewModal(true);
  };

  // Handle add new product button click
  const handleAddNewClick = () => {
    setEditFormData({
      name: '',
      category: '',
      price: '',
      piece: ''
    });
    setShowAddModal(true);
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle save changes in edit modal
  const handleSaveChanges = () => {
    const updatedProducts = products.map(product => {
      if (product.id === activeProduct.id) {
        return {
          ...product,
          name: editFormData.name,
          category: editFormData.category,
          price: parseFloat(editFormData.price),
          piece: parseInt(editFormData.piece)
        };
      }
      return product;
    });

    setProducts(updatedProducts);
    
    // If this were a real app, you would update the backend here
    // and reflect those changes in the mockProducts array as well
    
    setShowEditModal(false);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    const updatedProducts = products.filter(product => product.id !== activeProduct.id);
    setProducts(updatedProducts);
    
    // If this were a real app, you would delete from the backend here
    // and update totalItems accordingly
    setTotalItems(prev => prev - 1);
    
    setShowDeleteModal(false);
  };

  // Handle add new product
  const handleAddProduct = () => {
    // Validation
    if (!editFormData.name || !editFormData.category || !editFormData.price || !editFormData.piece) {
      alert("Please fill in all fields");
      return;
    }
    
    const newProductId = Math.max(...mockProducts.map(p => p.id), 0) + 1;
    const newProduct = {
      id: newProductId,
      name: editFormData.name,
      category: editFormData.category,
      price: parseFloat(editFormData.price),
      piece: parseInt(editFormData.piece),
      image: "/api/placeholder/64/64"
    };

    // Update local state
    setProducts(prev => [...prev, newProduct]);
    
    // If this were a real app, you would add to the backend here
    // Then update the mockProducts array and totalItems
    setTotalItems(prev => prev + 1);
    
    setShowAddModal(false);
  };

  // Modal component to reduce repetition
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with Logo and Navigation - This would be your layout component */}
      
      {/* Main Content */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-medium text-gray-800">Product Stock</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button 
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md flex items-center"
              onClick={handleAddNewClick}
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
                      onClick={() => handleSortOption('piece-asc')}
                    >
                      Stock (Low to High)
                    </button>
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleSortOption('piece-desc')}
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Piece</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Action</th>
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
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden bg-gray-100">
                          <img 
                            src={product.image} 
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
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.piece}</div>
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
          <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">
                Showing {products.length > 0 ? (currentPage === 1 ? 1 : (currentPage - 1) * itemsPerPage + 1) : 0}-
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
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Product"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={editFormData.name}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={editFormData.category}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="Serum">Serum</option>
              <option value="Cleanser">Cleanser</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
            <input
              type="number"
              name="price"
              value={editFormData.price}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              name="piece"
              value={editFormData.piece}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
          >
            Save Changes
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
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
      </Modal>

      {/* View Product Modal */}
      <Modal
        isOpen={showViewModal && activeProduct}
        onClose={() => setShowViewModal(false)}
        title="Product Details"
      >
        {activeProduct && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
              <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100">
                <img src={activeProduct.image} alt={activeProduct.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{activeProduct.name}</h3>
                <p className="text-sm text-gray-500">{activeProduct.category}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Price:</span>
                <span className="text-sm text-gray-900">{formatPrice(activeProduct.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Stock:</span>
                <span className="text-sm text-gray-900">{activeProduct.piece} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Product ID:</span>
                <span className="text-sm text-gray-900">#{activeProduct.id}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Add New Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={editFormData.name}
              onChange={handleFormChange}
              placeholder="Enter product name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={editFormData.category}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Select category</option>
              <option value="Serum">Serum</option>
              <option value="Cleanser">Cleanser</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
            <input
              type="number"
              name="price"
              value={editFormData.price}
              onChange={handleFormChange}
              placeholder="Enter price"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              name="piece"
              value={editFormData.piece}
              onChange={handleFormChange}
              placeholder="Enter stock quantity"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
          >
            Add Product
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductStockPage;