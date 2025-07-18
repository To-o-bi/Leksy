import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Trash2, Edit, Plus, ChevronLeft, ChevronRight, ShoppingBag, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productService } from '../../../api';
import Loader from '../../../components/common/Loader'; // Added this import

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
  
  // Targeting state
  const [targetedProductId, setTargetedProductId] = useState(null);
  
  // Bulk selection states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  const itemsPerPage = 10;

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
      console.error('Error fetching products:', error);
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

  // Check for URL parameters to target specific product
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const productId = urlParams.get('productId') || urlParams.get('highlight');
    
    if (productId) {
      setTargetedProductId(productId);
      
      if (products.length > 0) {
        scrollToProduct(productId);
      }
      
      const timer = setTimeout(() => {
        setTargetedProductId(null);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.search, products, currentPage]);

  const scrollToProduct = (productId) => {
    const productIndex = products.findIndex(p => p.product_id === productId);
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
          message: `Product "${activeProduct.name}" deleted successfully`
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

  // Bulk selection handlers
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

  // Pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);
  const allCurrentPageSelected = currentProducts.length > 0 && 
    currentProducts.every(p => selectedProducts.has(p.product_id));

  return (
    <div>
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 text-gray-400">×</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium text-gray-800">Product Stock</h1>
        <div className="flex items-center space-x-3">
          {!isSelectionMode ? (
            <>
              <button onClick={handleSelectModeToggle} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center">
                Select Products
              </button>
              <button onClick={() => navigate('/admin/products/add')} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
                <Plus size={16} className="mr-2" /> Add New
              </button>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600">{selectedProducts.size} selected</span>
              {selectedProducts.size > 0 && (
                <button onClick={() => setShowBulkDeleteModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center">
                  <Trash2 size={16} className="mr-2" /> Delete Selected
                </button>
              )}
              <button onClick={handleSelectModeToggle} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center">
                <X size={16} className="mr-2" /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {isSelectionMode && (
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={allCurrentPageSelected} onChange={handleSelectAll} className="rounded" />
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Image</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={isSelectionMode ? 7 : 6} className="text-center p-8"><Loader /></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={isSelectionMode ? 7 : 6} className="text-center p-8"><ShoppingBag size={48} className="mx-auto text-gray-300" /><p>No products found</p></td></tr>
            ) : (
              currentProducts.map((product) => (
                <tr key={product.product_id} id={`product-row-${product.product_id}`} className={`border-b hover:bg-gray-50 ${targetedProductId === product.product_id ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}>
                  {isSelectionMode && (
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedProducts.has(product.product_id)} onChange={() => handleProductSelect(product.product_id)} className="rounded" /></td>
                  )}
                  <td className="px-4 py-3"><img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} className="w-12 h-12 object-cover rounded-md" /></td>
                  <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{product.category}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(product.available_qty)}`}>
                      {Math.max(0, parseInt(product.available_qty, 10) || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-3">
                      <button onClick={() => navigate(`/admin/products/edit/${product.product_id}`)} disabled={isSelectionMode} className="text-gray-500 hover:text-gray-700"><Edit size={16} /></button>
                      <button onClick={() => { setActiveProduct(product); setShowDeleteModal(true); }} disabled={isSelectionMode} className="text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && products.length > 0 && totalPages > 1 && (
          <div className="px-4 py-4 flex justify-between items-center border-t">
            <p className="text-sm text-gray-500">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, products.length)} of {products.length}</p>
            <div className="flex items-center space-x-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={20} /></button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={20} /></button>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete "{activeProduct?.name}"? This cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-md" disabled={isSubmitting}>Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50" disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Bulk Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete {selectedProducts.size} product(s)? This cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowBulkDeleteModal(false)} className="px-4 py-2 border rounded-md" disabled={isBulkDeleting}>Cancel</button>
              <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50" disabled={isBulkDeleting}>
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
