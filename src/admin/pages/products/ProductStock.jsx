import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Edit, Plus, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../../api';

const ProductStockPage = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
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

  const formatPrice = (price) => {
    if (!price) return '₦0.00';
    return '₦' + parseFloat(price).toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  const getStockColor = (quantity) => {
    const stock = parseInt(quantity) || 0;
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 text-gray-400">×</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium text-gray-800">Product Stock</h1>
        <button 
          onClick={() => navigate('/admin/products/add')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add New
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
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
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading products...</p>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center">
                  <ShoppingBag size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No products found</p>
                  <button 
                    onClick={() => navigate('/admin/products/add')}
                    className="text-blue-500 hover:underline mt-2"
                  >
                    Add your first product
                  </button>
                </td>
              </tr>
            ) : (
              currentProducts.map((product) => (
                <tr key={product.product_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                      <img 
                        src={product.images?.[0] || '/placeholder.jpg'} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = '/placeholder.jpg'}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-600 capitalize">{product.category}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{formatPrice(product.price)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(product.available_qty)}`}>
                      {product.available_qty || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => navigate(`/admin/products/edit/${product.product_id}`)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setActiveProduct(product);
                          setShowDeleteModal(true);
                        }}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoading && products.length > 0 && totalPages > 1 && (
          <div className="px-4 py-4 flex justify-between items-center border-t">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, products.length)} of {products.length}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{activeProduct?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductStockPage;
