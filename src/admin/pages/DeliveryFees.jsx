import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Truck, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axios'; 

const DeliveryFeeAdmin = () => {
  const [deliveryFees, setDeliveryFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingStates, setEditingStates] = useState(new Set());
  const [tempValues, setTempValues] = useState({});
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all delivery fees on component mount
  useEffect(() => {
    fetchDeliveryFees();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchDeliveryFees = async () => {
    setLoading(true);
    try {
      console.log('Fetching delivery fees...');
      const response = await api.get('/fetch-delivery-fees');
      console.log('API Response:', response.data);
      
      const data = response.data;
      
      if (data.code === 200) {
        setDeliveryFees(data.delivery_fees || []);
        showNotification('success', `Loaded ${data.delivery_fees?.length || 0} delivery fees`);
      } else {
        throw new Error(data.message || 'Failed to fetch delivery fees');
      }
    } catch (error) {
      console.error('Error fetching delivery fees:', error);
      showNotification('error', error.message || 'Failed to load delivery fees');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (state) => {
    const currentFee = deliveryFees.find(fee => fee.state === state)?.delivery_fee || 0;
    setEditingStates(prev => new Set([...prev, state]));
    setTempValues(prev => ({
      ...prev,
      [state]: currentFee
    }));
  };

  const handleCancel = (state) => {
    setEditingStates(prev => {
      const newSet = new Set(prev);
      newSet.delete(state);
      return newSet;
    });
    setTempValues(prev => {
      const newValues = { ...prev };
      delete newValues[state];
      return newValues;
    });
  };

  const handleSave = async (state) => {
    const newFee = tempValues[state];
    
    if (!newFee || newFee < 0) {
      showNotification('error', 'Please enter a valid delivery fee');
      return;
    }

    setSaving(true);
    try {
      console.log(`Updating delivery fee for ${state} to ${newFee}`);
      const params = { [state]: newFee };
      const response = await api.post('/admin/update-delivery-fees', null, { params });
      console.log('Update response:', response.data);
      
      const data = response.data;
      
      if (data.code === 200) {
        // Update local state with the response data if available
        if (data.delivery_fees) {
          setDeliveryFees(data.delivery_fees);
        } else {
          // Fallback: update local state manually
          setDeliveryFees(prev => 
            prev.map(fee => 
              fee.state === state 
                ? { ...fee, delivery_fee: parseInt(newFee) }
                : fee
            )
          );
        }
        
        // Clear editing state
        handleCancel(state);
        showNotification('success', `Updated delivery fee for ${state} successfully`);
      } else {
        throw new Error(data.message || 'Failed to update delivery fee');
      }
    } catch (error) {
      console.error('Error updating delivery fee:', error);
      showNotification('error', error.message || `Failed to update delivery fee for ${state}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (Object.keys(tempValues).length === 0) {
      showNotification('error', 'No changes to save');
      return;
    }

    setSaving(true);
    try {
      console.log('Bulk updating delivery fees:', tempValues);
      const response = await api.post('/admin/update-delivery-fees', null, { params: tempValues });
      console.log('Bulk update response:', response.data);
      
      const data = response.data;
      
      if (data.code === 200) {
        // Use the updated delivery fees from the API response
        if (data.delivery_fees) {
          setDeliveryFees(data.delivery_fees);
        } else {
          // Fallback: update local state manually if API doesn't return updated data
          setDeliveryFees(prev => 
            prev.map(fee => 
              tempValues[fee.state] !== undefined
                ? { ...fee, delivery_fee: parseInt(tempValues[fee.state]) }
                : fee
            )
          );
        }
        setEditingStates(new Set());
        setTempValues({});
        showNotification('success', 'All delivery fees updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update delivery fees');
      }
    } catch (error) {
      console.error('Error updating delivery fees:', error);
      showNotification('error', error.message || 'Failed to update delivery fees');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredFees = deliveryFees.filter(fee =>
    fee.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStatesEditing = editingStates.size;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Truck className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delivery Fee Management</h1>
            <p className="text-gray-600">Manage delivery fees for all Nigerian states</p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchDeliveryFees}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>

            {totalStatesEditing > 0 && (
              <button
                onClick={handleBulkUpdate}
                disabled={saving}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : `Save Changes (${totalStatesEditing})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total States</p>
              <p className="text-2xl font-bold text-gray-900">{deliveryFees.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Fee</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveryFees.length > 0 
                  ? formatPrice(deliveryFees.reduce((sum, fee) => sum + fee.delivery_fee, 0) / deliveryFees.length)
                  : formatPrice(0)
                }
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Changes</p>
              <p className="text-2xl font-bold text-gray-900">{totalStatesEditing}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Edit2 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Fees Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Delivery Fees by State
            {filteredFees.length !== deliveryFees.length && (
              <span className="ml-2 text-sm text-gray-500">
                ({filteredFees.length} of {deliveryFees.length})
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading delivery fees...</p>
          </div>
        ) : filteredFees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No delivery fees found{searchTerm && ` matching "${searchTerm}"`}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Fee
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFees.map((fee) => (
                  <tr key={fee.state} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-1 bg-gray-100 rounded mr-3">
                          <MapPin className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {fee.state}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStates.has(fee.state) ? (
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-1">₦</span>
                          <input
                            type="number"
                            value={tempValues[fee.state] || ''}
                            onChange={(e) => setTempValues(prev => ({
                              ...prev,
                              [fee.state]: parseInt(e.target.value) || 0
                            }))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            min="0"
                            step="100"
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900 font-medium">
                          {formatPrice(fee.delivery_fee)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingStates.has(fee.state) ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSave(fee.state)}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancel(fee.state)}
                            disabled={saving}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(fee.state)}
                          className="text-pink-600 hover:text-pink-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How to use:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Click the edit icon to modify a delivery fee for any state</li>
              <li>You can edit multiple states at once and save all changes together</li>
              <li>Use the search box to quickly find specific states</li>
              <li>Changes will be immediately reflected on the checkout page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryFeeAdmin;