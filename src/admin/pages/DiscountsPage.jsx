import React, { useState, useEffect } from 'react';
import { discountService } from '../../api/services';
import { useMessage } from '../../contexts/MessageContext';
import { getCategories, getCategoryDisplayName } from '../../utils/api';

const DiscountsPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    category: 'all',
    discount_percent: '',
    valid_from: '',
    valid_to: '',
    isFirstTimeOnly: false
  });
  const { success, error: showError } = useMessage();

  const categories = ['all', ...getCategories(), 'others'];

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await discountService.fetchDiscounts();
      
      if (response.code === 200) {
        const discountData = response.discount_data || [];
        setDiscounts(discountData);
      }
    } catch (err) {
      showError(err.message || 'Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingDiscount) {
        await discountService.editDiscount(editingDiscount.id, formData);
        success('Discount updated successfully!');
      } else {
        await discountService.addDiscount(formData);
        success('Discount created successfully!');
      }
      
      await fetchDiscounts();
      closeModal();
      
    } catch (err) {
      showError(err.message || 'Failed to save discount');
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      category: discount.category || 'all',
      discount_percent: discount.discount_percent,
      valid_from: discount.valid_from,
      valid_to: discount.valid_to,
      isFirstTimeOnly: Boolean(discount.isFirstTimeOnly)
    });
    setShowModal(true);
  };

  const handleDelete = async (discountId) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) {
      return;
    }
    
    try {
      await discountService.deleteDiscount(discountId);
      success('Discount deleted successfully!');
      await fetchDiscounts();
    } catch (err) {
      showError(err.message || 'Failed to delete discount');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDiscount(null);
    setFormData({
      category: 'all',
      discount_percent: '',
      valid_from: '',
      valid_to: '',
      isFirstTimeOnly: false
    });
  };

  const isDiscountActive = (discount) => {
    if (!discount.isActive) return false;
    
    const now = new Date();
    const start = new Date(discount.valid_from);
    const end = new Date(discount.valid_to);
    end.setHours(23, 59, 59, 999);
    
    return now >= start && now <= end;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discount Management</h1>
            <p className="text-sm text-gray-600 mt-1">Create and manage discount campaigns for your store</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-pink-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-pink-600 transition-colors shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Discount</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {discounts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Discounts Yet</h3>
            <p className="text-gray-600 mb-4">Create your first discount campaign to boost sales</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Create Discount
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {discounts.map((discount) => {
                  const active = isDiscountActive(discount);
                  return (
                    <tr key={discount.id} className={active ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {active ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {discount.category === 'all' ? 'All Products' : getCategoryDisplayName(discount.category)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-pink-600">{discount.discount_percent}% OFF</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(discount.valid_from)}
                        </div>
                        <div className="text-xs text-gray-500">
                          to {formatDate(discount.valid_to)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {discount.isFirstTimeOnly ? 'First-time customers' : 'All customers'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                >
                  <option value="all">All Products</option>
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryDisplayName(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="e.g., 25"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.valid_to}
                  onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="firstTimeOnly"
                  checked={formData.isFirstTimeOnly}
                  onChange={(e) => setFormData({ ...formData, isFirstTimeOnly: e.target.checked })}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="firstTimeOnly" className="ml-2 block text-sm text-gray-700">
                  First-time customers only
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  {editingDiscount ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountsPage;