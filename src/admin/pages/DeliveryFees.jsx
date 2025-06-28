import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Truck, MapPin, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { 
  DeliveryFeeService, 
  LagosLGAService, 
  DeliveryFeeUtils, 
  NotificationService 
} from '../../api/deliveryFeeService';

const DeliveryFeeAdmin = () => {
  // State management
  const [deliveryFees, setDeliveryFees] = useState([]);
  const [lagosLGAs, setLagosLGAs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingStates, setEditingStates] = useState(new Set());
  const [editingLGAs, setEditingLGAs] = useState(new Set());
  const [tempValues, setTempValues] = useState({});
  const [tempLGAValues, setTempLGAValues] = useState({});
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLagos, setExpandedLagos] = useState(false);

  // Initialize component
  useEffect(() => {
    loadInitialData();
  }, []);

  // Notification helper
  const showNotification = (notification) => {
    setNotification(notification);
    setTimeout(() => setNotification(null), 5000);
  };

  // Load initial data
  const loadInitialData = async () => {
    await Promise.all([
      fetchDeliveryFees(),
      fetchLagosLGAs()
    ]);
  };

  // Fetch delivery fees
  const fetchDeliveryFees = async () => {
    setLoading(true);
    try {
      const result = await DeliveryFeeService.fetchDeliveryFees();
      setDeliveryFees(result.data);
      showNotification(NotificationService.success(result.message));
    } catch (error) {
      showNotification(NotificationService.error(error.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch Lagos LGAs
  const fetchLagosLGAs = async () => {
    try {
      const result = await LagosLGAService.fetchLagosLGAs();
      setLagosLGAs(result.data);
      
      if (result.isDefault) {
        showNotification(NotificationService.info(result.message));
      }
    } catch (error) {
      showNotification(NotificationService.error(error.message));
    }
  };

  // Edit handlers for states
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
    
    if (!DeliveryFeeUtils.validateFee(newFee)) {
      showNotification(NotificationService.error('Please enter a valid delivery fee'));
      return;
    }

    setSaving(true);
    try {
      const result = await DeliveryFeeService.updateSingleDeliveryFee(state, newFee);
      
      if (result.data) {
        setDeliveryFees(result.data);
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
      
      handleCancel(state);
      showNotification(NotificationService.success(result.message));
    } catch (error) {
      showNotification(NotificationService.error(error.message));
    } finally {
      setSaving(false);
    }
  };

  // Edit handlers for LGAs
  const handleLGAEdit = (lga) => {
    const currentFee = lagosLGAs.find(item => item.lga === lga)?.delivery_fee || 0;
    setEditingLGAs(prev => new Set([...prev, lga]));
    setTempLGAValues(prev => ({
      ...prev,
      [lga]: currentFee
    }));
  };

  const handleLGACancel = (lga) => {
    setEditingLGAs(prev => {
      const newSet = new Set(prev);
      newSet.delete(lga);
      return newSet;
    });
    setTempLGAValues(prev => {
      const newValues = { ...prev };
      delete newValues[lga];
      return newValues;
    });
  };

  const handleLGASave = async (lga) => {
    const newFee = tempLGAValues[lga];
    
    if (!DeliveryFeeUtils.validateFee(newFee)) {
      showNotification(NotificationService.error('Please enter a valid delivery fee'));
      return;
    }

    setSaving(true);
    try {
      const result = await LagosLGAService.updateSingleLGAFee(lga, newFee);
      
      if (result.data) {
        setLagosLGAs(result.data);
      } else {
        // Fallback: update local state manually
        setLagosLGAs(prev => 
          prev.map(item => 
            item.lga === lga 
              ? { ...item, delivery_fee: parseInt(newFee) }
              : item
          )
        );
      }
      
      handleLGACancel(lga);
      showNotification(NotificationService.success(result.message));
    } catch (error) {
      showNotification(NotificationService.error(error.message));
    } finally {
      setSaving(false);
    }
  };

  // Bulk update handlers
  const handleBulkUpdate = async () => {
    if (Object.keys(tempValues).length === 0) {
      showNotification(NotificationService.error('No changes to save'));
      return;
    }

    setSaving(true);
    try {
      const result = await DeliveryFeeService.updateBulkDeliveryFees(tempValues);
      
      if (result.data) {
        setDeliveryFees(result.data);
      } else {
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
      showNotification(NotificationService.success(result.message));
    } catch (error) {
      showNotification(NotificationService.error(error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleBulkLGAUpdate = async () => {
    if (Object.keys(tempLGAValues).length === 0) {
      showNotification(NotificationService.error('No LGA changes to save'));
      return;
    }

    setSaving(true);
    try {
      const result = await LagosLGAService.updateBulkLGAFees(tempLGAValues);
      
      if (result.data) {
        setLagosLGAs(result.data);
      } else {
        setLagosLGAs(prev => 
          prev.map(item => 
            tempLGAValues[item.lga] !== undefined
              ? { ...item, delivery_fee: parseInt(tempLGAValues[item.lga]) }
              : item
          )
        );
      }
      
      setEditingLGAs(new Set());
      setTempLGAValues({});
      showNotification(NotificationService.success(result.message));
    } catch (error) {
      showNotification(NotificationService.error(error.message));
    } finally {
      setSaving(false);
    }
  };

  // Computed values
  const filteredFees = DeliveryFeeUtils.filterBySearch(deliveryFees, searchTerm, 'state');
  const filteredLGAs = DeliveryFeeUtils.filterBySearch(lagosLGAs, searchTerm, 'lga');
  const totalStatesEditing = editingStates.size;
  const totalLGAsEditing = editingLGAs.size;
  const averageFee = DeliveryFeeUtils.calculateAverageFee(deliveryFees);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : notification.type === 'error'
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-blue-100 text-blue-800 border border-blue-200'
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
            <p className="text-gray-600">Manage delivery fees for all Nigerian states and Lagos LGAs</p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search states or LGAs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadInitialData}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>

            {totalLGAsEditing > 0 && (
              <button
                onClick={handleBulkLGAUpdate}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                {saving ? 'Saving...' : `Save LGA Changes (${totalLGAsEditing})`}
              </button>
            )}

            {totalStatesEditing > 0 && (
              <button
                onClick={handleBulkUpdate}
                disabled={saving}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : `Save State Changes (${totalStatesEditing})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
              <p className="text-sm font-medium text-gray-600">Lagos LGAs</p>
              <p className="text-2xl font-bold text-gray-900">{lagosLGAs.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average State Fee</p>
              <p className="text-2xl font-bold text-gray-900">
                {DeliveryFeeUtils.formatPrice(averageFee)}
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
              <p className="text-2xl font-bold text-gray-900">{totalStatesEditing + totalLGAsEditing}</p>
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
                  <React.Fragment key={fee.state}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {DeliveryFeeUtils.isLagosState(fee.state) && (
                            <button
                              onClick={() => setExpandedLagos(!expandedLagos)}
                              className="p-1 hover:bg-gray-200 rounded mr-2"
                            >
                              {expandedLagos ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          )}
                          <div className="p-1 bg-gray-100 rounded mr-3">
                            <MapPin className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {fee.state}
                            </div>
                            {DeliveryFeeUtils.isLagosState(fee.state) && (
                              <div className="text-xs text-gray-500">
                                {lagosLGAs.length} LGAs available
                              </div>
                            )}
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
                            {DeliveryFeeUtils.formatPrice(fee.delivery_fee)}
                            {DeliveryFeeUtils.isLagosState(fee.state) && (
                              <span className="ml-2 text-xs text-gray-500">(Base rate)</span>
                            )}
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
                    
                    {/* Lagos LGAs Sub-table */}
                    {DeliveryFeeUtils.isLagosState(fee.state) && expandedLagos && (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Lagos State LGAs</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {filteredLGAs.map((lgaItem) => (
                                <div key={lgaItem.lga} className="bg-white p-3 rounded border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                                      <span className="text-sm font-medium text-gray-700">{lgaItem.lga}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {editingLGAs.has(lgaItem.lga) ? (
                                        <div className="flex items-center gap-1">
                                          <span className="text-gray-500 text-xs">₦</span>
                                          <input
                                            type="number"
                                            value={tempLGAValues[lgaItem.lga] || ''}
                                            onChange={(e) => setTempLGAValues(prev => ({
                                              ...prev,
                                              [lgaItem.lga]: parseInt(e.target.value) || 0
                                            }))}
                                            className="w-16 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                            min="0"
                                            step="100"
                                          />
                                          <button
                                            onClick={() => handleLGASave(lgaItem.lga)}
                                            disabled={saving}
                                            className="text-green-600 hover:text-green-700 disabled:opacity-50"
                                          >
                                            <Save className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => handleLGACancel(lgaItem.lga)}
                                            disabled={saving}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-medium text-gray-900">
                                            {DeliveryFeeUtils.formatPrice(lgaItem.delivery_fee)}
                                          </span>
                                          <button
                                            onClick={() => handleLGAEdit(lgaItem.lga)}
                                            className="text-blue-600 hover:text-blue-700"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
              <li>For Lagos State, click the arrow to expand and manage individual LGA fees</li>
              <li>You can edit multiple states and LGAs at once and save all changes together</li>
              <li>Use the search box to quickly find specific states or LGAs</li>
              <li>LGA-specific fees will override the base Lagos State fee for checkout</li>
              <li>Changes will be immediately reflected on the checkout page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryFeeAdmin;