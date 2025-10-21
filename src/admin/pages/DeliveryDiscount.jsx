import React, { useState, useEffect } from 'react';
import { deliveryDiscountService } from '../../api/services';
import { useMessage } from '../../contexts/MessageContext';

const DeliveryDiscount = () => {
  const [deliveryDiscounts, setDeliveryDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingType, setDeletingType] = useState(null); // 'lagos' or 'other-states'
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [modalMode, setModalMode] = useState('lagos');
  const [formData, setFormData] = useState({
    discount_percent: '',
    min_order_price_trigger: '',
    valid_from: '',
    valid_to: '',
    isFirstTimeOnly: false,
    isActive: true
  });
  
  const { success, error: showError } = useMessage();

  const otherStates = [
    'abia', 'adamawa', 'akwa ibom', 'anambra', 'bauchi', 'bayelsa', 'benue', 'borno',
    'cross river', 'delta', 'ebonyi', 'edo', 'ekiti', 'enugu', 'abuja', 'gombe',
    'imo', 'jigawa', 'kaduna', 'kano', 'katsina', 'kebbi', 'kogi', 'kwara',
    'nasarawa', 'niger', 'ogun', 'ondo', 'osun', 'oyo', 'plateau',
    'rivers', 'sokoto', 'taraba', 'yobe', 'zamfara'
  ];

  useEffect(() => {
    fetchDeliveryDiscounts();
  }, []);

  const fetchDeliveryDiscounts = async () => {
    setLoading(true);
    try {
      const response = await deliveryDiscountService.fetchAllDeliveryDiscounts();
      
      if (response.code === 200 && response.discount_data) {
        const discounts = Array.isArray(response.discount_data) 
          ? response.discount_data 
          : [response.discount_data];
        
        // Normalize state names to lowercase for consistent comparison
        const normalizedDiscounts = discounts.map(d => ({
          ...d,
          state: d.state?.toLowerCase()
        }));
        
        setDeliveryDiscounts(normalizedDiscounts);
      } else {
        setDeliveryDiscounts([]);
      }
    } catch (err) {
      console.error('Error fetching delivery discounts:', err);
      setDeliveryDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingDiscount) {
        // Editing existing discount
        if (modalMode === 'lagos') {
          await deliveryDiscountService.editDeliveryDiscount(editingDiscount.id, formData);
          success('Lagos delivery discount updated successfully!');
        } else {
          // Update all other states
          const otherStatesDiscounts = deliveryDiscounts.filter(d => d.state !== 'lagos');
          const updatePromises = otherStatesDiscounts.map(discount => 
            deliveryDiscountService.editDeliveryDiscount(discount.id, formData)
          );
          await Promise.all(updatePromises);
          success('Other states delivery discounts updated successfully!');
        }
      } else {
        // Creating new discount
        if (modalMode === 'lagos') {
          // Create discount specifically for Lagos - use lowercase 'lagos'
          await deliveryDiscountService.createDeliveryDiscount({
            ...formData,
            state: 'lagos' // Ensure lowercase
          });
          success('Lagos delivery discount created successfully!');
        } else {
          // Create for all other states
          const createPromises = otherStates.map(state => 
            deliveryDiscountService.createDeliveryDiscount({
              ...formData,
              state: state // Already lowercase in the array
            })
          );
          await Promise.all(createPromises);
          success('Delivery discounts created for all other states successfully!');
        }
      }
      
      // Add a small delay before fetching to ensure backend processing completes
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchDeliveryDiscounts();
      closeModal();
      
    } catch (err) {
      showError(err.message || 'Failed to save delivery discount');
    }
  };

  const handleEdit = (type) => {
    setModalMode(type);
    
    if (type === 'lagos') {
      const lagosDiscount = deliveryDiscounts.find(d => d.state === 'lagos');
      if (lagosDiscount) {
        setEditingDiscount(lagosDiscount);
        setFormData({
          discount_percent: lagosDiscount.discount_percent,
          min_order_price_trigger: lagosDiscount.min_order_price_trigger || '',
          valid_from: lagosDiscount.valid_from,
          valid_to: lagosDiscount.valid_to,
          isFirstTimeOnly: Boolean(lagosDiscount.isFirstTimeOnly),
          isActive: Boolean(lagosDiscount.isActive)
        });
      }
    } else {
      // Get any other state discount as they all have the same values
      const otherDiscount = deliveryDiscounts.find(d => d.state !== 'lagos');
      if (otherDiscount) {
        setEditingDiscount(otherDiscount);
        setFormData({
          discount_percent: otherDiscount.discount_percent,
          min_order_price_trigger: otherDiscount.min_order_price_trigger || '',
          valid_from: otherDiscount.valid_from,
          valid_to: otherDiscount.valid_to,
          isFirstTimeOnly: Boolean(otherDiscount.isFirstTimeOnly),
          isActive: Boolean(otherDiscount.isActive)
        });
      }
    }
    
    setShowModal(true);
  };

  const handleToggleActive = async (type) => {
    try {
      if (type === 'lagos') {
        const lagosDiscount = deliveryDiscounts.find(d => d.state === 'lagos');
        if (lagosDiscount) {
          await deliveryDiscountService.editDeliveryDiscount(lagosDiscount.id, {
            isActive: !lagosDiscount.isActive
          });
          success(`Lagos delivery discount ${lagosDiscount.isActive ? 'deactivated' : 'activated'} successfully!`);
        }
      } else {
        // Toggle all other states
        const otherStatesDiscounts = deliveryDiscounts.filter(d => d.state !== 'lagos');
        if (otherStatesDiscounts.length > 0) {
          const currentStatus = otherStatesDiscounts[0].isActive;
          const updatePromises = otherStatesDiscounts.map(discount => 
            deliveryDiscountService.editDeliveryDiscount(discount.id, {
              isActive: !currentStatus
            })
          );
          await Promise.all(updatePromises);
          success(`Other states delivery discounts ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
        }
      }
      await fetchDeliveryDiscounts();
    } catch (err) {
      showError(err.message || 'Failed to update discount status');
    }
  };

  const handleDelete = (type) => {
    setDeletingType(type);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingType) return;
    
    try {
      if (deletingType === 'lagos') {
        const lagosDiscount = deliveryDiscounts.find(d => d.state === 'lagos');
        if (lagosDiscount) {
          await deliveryDiscountService.deleteDeliveryDiscount(lagosDiscount.id);
          success('Lagos delivery discount deleted successfully!');
        }
      } else {
        // Delete all other states
        const otherStatesDiscounts = deliveryDiscounts.filter(d => d.state !== 'lagos');
        const deletePromises = otherStatesDiscounts.map(discount => 
          deliveryDiscountService.deleteDeliveryDiscount(discount.id)
        );
        await Promise.all(deletePromises);
        success('Other states delivery discounts deleted successfully!');
      }
      
      await fetchDeliveryDiscounts();
      setShowDeleteModal(false);
      setDeletingType(null);
    } catch (err) {
      showError(err.message || 'Failed to delete delivery discount');
      setShowDeleteModal(false);
      setDeletingType(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingType(null);
  };

  const openCreateModal = (mode) => {
    setModalMode(mode);
    setEditingDiscount(null);
    setFormData({
      discount_percent: '',
      min_order_price_trigger: '',
      valid_from: '',
      valid_to: '',
      isFirstTimeOnly: mode === 'lagos',
      isActive: true
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDiscount(null);
    setModalMode('lagos');
    setFormData({
      discount_percent: '',
      min_order_price_trigger: '',
      valid_from: '',
      valid_to: '',
      isFirstTimeOnly: false,
      isActive: true
    });
  };

  const isDiscountActive = (discount) => {
    if (!discount) return false;
    if (!discount.isActive) return false;
    
    const now = new Date();
    const validFrom = new Date(discount.valid_from);
    const validTo = new Date(discount.valid_to);
    validTo.setHours(23, 59, 59, 999);

    return now >= validFrom && now <= validTo;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get representative discounts
  const lagosDiscount = deliveryDiscounts.find(d => d.state === 'lagos');
  const otherStatesDiscount = deliveryDiscounts.find(d => d.state !== 'lagos');
  const hasOtherStatesDiscount = deliveryDiscounts.some(d => d.state !== 'lagos');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Delivery Discounts</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lagos Discount Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Lagos State</h3>
                {!lagosDiscount && (
                  <button
                    onClick={() => openCreateModal('lagos')}
                    className="bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
                  >
                    + Add
                  </button>
                )}
              </div>

              {lagosDiscount ? (
                <div className={`border-2 rounded-lg p-5 ${
                  isDiscountActive(lagosDiscount) ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">🏙️</div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Lagos</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isDiscountActive(lagosDiscount) 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            {isDiscountActive(lagosDiscount) ? '● Active' : '○ Inactive'}
                          </span>
                          {lagosDiscount.isFirstTimeOnly && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              First-time only
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleToggleActive('lagos')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
                        lagosDiscount.isActive
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {lagosDiscount.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Discount</div>
                      <div className="text-2xl font-bold text-pink-600">{lagosDiscount.discount_percent}%</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Min. Order</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {lagosDiscount.min_order_price_trigger > 0 
                          ? `₦${parseFloat(lagosDiscount.min_order_price_trigger).toLocaleString()}`
                          : 'No minimum'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                    <div className="text-xs text-gray-600 mb-1">Valid Period</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(lagosDiscount.valid_from)} - {formatDate(lagosDiscount.valid_to)}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit('lagos')}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete('lagos')}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-2">🏙️</div>
                  <p className="text-gray-600 text-sm">No discount set for Lagos</p>
                </div>
              )}
            </div>

            {/* Other States Discount Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Other States</h3>
                {!hasOtherStatesDiscount && (
                  <button
                    onClick={() => openCreateModal('other-states')}
                    className="bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
                  >
                    + Add
                  </button>
                )}
              </div>

              {otherStatesDiscount ? (
                <div className={`border-2 rounded-lg p-5 ${
                  isDiscountActive(otherStatesDiscount) ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">🗺️</div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">All Other States</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isDiscountActive(otherStatesDiscount) 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            {isDiscountActive(otherStatesDiscount) ? '● Active' : '○ Inactive'}
                          </span>
                          {otherStatesDiscount.isFirstTimeOnly && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              First-time only
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Applies to {otherStates.length} states</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleToggleActive('other-states')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
                        otherStatesDiscount.isActive
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {otherStatesDiscount.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Discount</div>
                      <div className="text-2xl font-bold text-pink-600">{otherStatesDiscount.discount_percent}%</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Min. Order</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {otherStatesDiscount.min_order_price_trigger > 0 
                          ? `₦${parseFloat(otherStatesDiscount.min_order_price_trigger).toLocaleString()}`
                          : 'No minimum'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                    <div className="text-xs text-gray-600 mb-1">Valid Period</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(otherStatesDiscount.valid_from)} - {formatDate(otherStatesDiscount.valid_to)}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit('other-states')}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete('other-states')}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p className="text-gray-600 text-sm">No discount set for other states</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Set a specific discount for Lagos (e.g., 100% for free delivery)</li>
                  <li>Set one discount that applies to all other 36 states at once</li>
                  <li>Use minimum order amount to apply discount only on larger orders</li>
                  <li>Enable "First-time only" for new customer incentives</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Discount Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDiscount ? 
                  (modalMode === 'lagos' ? 'Edit Lagos Discount' : 'Edit Other States Discount') :
                  (modalMode === 'lagos' ? 'Create Lagos Discount' : 'Create Other States Discount')
                }
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {modalMode === 'lagos' 
                  ? 'Set up delivery discount for Lagos state'
                  : `This discount will apply to all ${otherStates.length} states except Lagos`
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingDiscount && modalMode === 'other-states' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs text-yellow-800">
                      This will create the same discount for all {otherStates.length} states except Lagos.
                    </p>
                  </div>
                </div>
              )}

              {editingDiscount && modalMode === 'other-states' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-blue-800">
                      Changes will be applied to all {otherStates.length} states except Lagos.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="e.g., 50 or 100 for free delivery"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use 100% for free delivery</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.min_order_price_trigger}
                  onChange={(e) => setFormData({ ...formData, min_order_price_trigger: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="e.g., 50000 (leave empty for no minimum)"
                />
                <p className="text-xs text-gray-500 mt-1">Discount applies only when order exceeds this amount</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
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
                  End Date <span className="text-red-500">*</span>
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

              {editingDiscount && (
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">Example:</p>
                    <p className="mt-1">Lagos: 100% discount (free delivery) for first-time users</p>
                    <p className="mt-1">Other states: 50% discount for orders above ₦50,000</p>
                  </div>
                </div>
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

      {/* Delivery Discount Delete Modal */}
      {showDeleteModal && deletingType && (
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
                {deletingType === 'lagos' 
                  ? 'Are you sure you want to delete the Lagos delivery discount?'
                  : `Are you sure you want to delete delivery discounts for all ${otherStates.length} states?`
                }
                {' '}This action cannot be undone.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Location: </span>
                  <span className="text-gray-900 font-semibold">
                    {deletingType === 'lagos' ? 'Lagos State' : `All Other States (${otherStates.length} states)`}
                  </span>
                </div>
                {deletingType === 'lagos' && lagosDiscount && (
                  <div className="text-sm mt-1">
                    <span className="font-medium text-gray-700">Discount: </span>
                    <span className="text-pink-600 font-bold">{lagosDiscount.discount_percent}% OFF</span>
                  </div>
                )}
                {deletingType === 'other-states' && otherStatesDiscount && (
                  <div className="text-sm mt-1">
                    <span className="font-medium text-gray-700">Discount: </span>
                    <span className="text-pink-600 font-bold">{otherStatesDiscount.discount_percent}% OFF</span>
                  </div>
                )}
              </div>
              
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