import React, { useState, useEffect } from 'react';
import { deliveryDiscountService } from '../../api/services';
import { useMessage } from '../../contexts/MessageContext';

const DeliveryDiscount = () => {
  const [deliveryDiscount, setDeliveryDiscount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    discount_percent: '',
    valid_from: '',
    valid_to: '',
    isFirstTimeOnly: false,
    isActive: true
  });
  
  const { success, error: showError } = useMessage();

  useEffect(() => {
    fetchDeliveryDiscount();
  }, []);

  const fetchDeliveryDiscount = async () => {
    setLoading(true);
    try {
      const response = await deliveryDiscountService.fetchDeliveryDiscount();
      
      if (response.code === 200 && response.discount_data) {
        setDeliveryDiscount(response.discount_data);
      } else {
        setDeliveryDiscount(null);
      }
    } catch (err) {
      console.error('Error fetching delivery discount:', err);
      setDeliveryDiscount(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (deliveryDiscount) {
        await deliveryDiscountService.editDeliveryDiscount(formData);
        success('Delivery discount updated successfully!');
      } else {
        await deliveryDiscountService.createDeliveryDiscount(formData);
        success('Delivery discount created successfully!');
      }
      
      await fetchDeliveryDiscount();
      closeModal();
      
    } catch (err) {
      showError(err.message || 'Failed to save delivery discount');
    }
  };

  const handleEdit = () => {
    setFormData({
      discount_percent: deliveryDiscount.discount_percent,
      valid_from: deliveryDiscount.valid_from,
      valid_to: deliveryDiscount.valid_to,
      isFirstTimeOnly: Boolean(deliveryDiscount.isFirstTimeOnly),
      isActive: Boolean(deliveryDiscount.isActive)
    });
    setShowModal(true);
  };

  const handleToggleActive = async () => {
    if (!deliveryDiscount) return;
    
    try {
      await deliveryDiscountService.editDeliveryDiscount({
        isActive: !deliveryDiscount.isActive
      });
      success(`Delivery discount ${deliveryDiscount.isActive ? 'deactivated' : 'activated'} successfully!`);
      await fetchDeliveryDiscount();
    } catch (err) {
      showError(err.message || 'Failed to update discount status');
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deliveryDiscountService.deleteDeliveryDiscount();
      success('Delivery discount deleted successfully!');
      setDeliveryDiscount(null);
      setShowDeleteModal(false);
    } catch (err) {
      showError(err.message || 'Failed to delete delivery discount');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      discount_percent: '',
      valid_from: '',
      valid_to: '',
      isFirstTimeOnly: false,
      isActive: true
    });
  };

  const isDiscountActive = () => {
    if (!deliveryDiscount) return false;
    return deliveryDiscountService.isDeliveryDiscountActive(deliveryDiscount);
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
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {!deliveryDiscount ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🚚</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Delivery Discount</h3>
            <p className="text-gray-600 mb-4">Create a discount to reduce delivery fees for your customers</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Create Discount
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className={`border-2 rounded-lg p-6 ${isDiscountActive() ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">🚚</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Delivery Fee Discount</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isDiscountActive() 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {isDiscountActive() ? '● Active' : '○ Inactive'}
                      </span>
                      {deliveryDiscount.isFirstTimeOnly && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          First-time customers only
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleActive}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      deliveryDiscount.isActive
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {deliveryDiscount.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Discount Amount</div>
                  <div className="text-3xl font-bold text-pink-600">{deliveryDiscount.discount_percent}%</div>
                  <div className="text-xs text-gray-500 mt-1">off delivery fee</div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Start Date</div>
                  <div className="text-lg font-semibold text-gray-900">{formatDate(deliveryDiscount.valid_from)}</div>
                  <div className="text-xs text-gray-500 mt-1">Discount begins</div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">End Date</div>
                  <div className="text-lg font-semibold text-gray-900">{formatDate(deliveryDiscount.valid_to)}</div>
                  <div className="text-xs text-gray-500 mt-1">Discount expires</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How it works:</p>
                    <p>This discount will be automatically applied to delivery fees {deliveryDiscount.isFirstTimeOnly ? 'for first-time customers' : 'for all customers'} during the active period. Customers will see the reduced delivery fee at checkout.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Edit Discount
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Discount
                </button>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <div>Created: {new Date(deliveryDiscount.created_at).toLocaleString()}</div>
              <div>Last Modified: {new Date(deliveryDiscount.modified_at).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Discount Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {deliveryDiscount ? 'Edit Delivery Discount' : 'Create Delivery Discount'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                <p className="text-xs text-gray-500 mt-1">Percentage off the delivery fee</p>
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
                  id="deliveryFirstTimeOnly"
                  checked={formData.isFirstTimeOnly}
                  onChange={(e) => setFormData({ ...formData, isFirstTimeOnly: e.target.checked })}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="deliveryFirstTimeOnly" className="ml-2 block text-sm text-gray-700">
                  First-time customers only
                </label>
              </div>

              {deliveryDiscount && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="deliveryIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="deliveryIsActive" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              )}

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
                  {deliveryDiscount ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Discount Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Delivery Discount
              </h3>
              
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete the delivery discount? This action cannot be undone and customers will no longer receive discounted delivery fees.
              </p>
              
              {deliveryDiscount && (
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Discount: </span>
                    <span className="text-pink-600 font-bold">{deliveryDiscount.discount_percent}% OFF</span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium text-gray-700">Valid: </span>
                    <span className="text-gray-900">{formatDate(deliveryDiscount.valid_from)} - {formatDate(deliveryDiscount.valid_to)}</span>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeliveryDiscount;