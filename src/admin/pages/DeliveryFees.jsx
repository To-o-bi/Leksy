import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Truck, MapPin, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import api from '../../api/axios';

const DeliveryFeeAdmin = () => {
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

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feesResponse, lgasResponse] = await Promise.allSettled([
        api.post('/fetch-delivery-fees'),
        api.post('/fetch-lgas-delivery-fees', { state: 'Lagos' })
      ]);

      if (feesResponse.status === 'fulfilled' && feesResponse.value.data.code === 200) {
        const data = feesResponse.value.data;
        const validFees = data.delivery_fees?.filter(fee => fee && fee.state && fee.delivery_fee !== undefined) || [];
        setDeliveryFees(validFees);
        if (validFees.length > 0) {
          showNotification('success', data.message || `Loaded ${validFees.length} delivery fees`);
        }
      } else {
        throw new Error('Failed to fetch delivery fees');
      }

      if (lgasResponse.status === 'fulfilled' && lgasResponse.value.data.code === 200) {
        const lgaData = lgasResponse.value.data;
        const validLGAs = lgaData.delivery_fees?.filter(lga => lga && lga.lga && lga.delivery_fee !== undefined) || [];
        setLagosLGAs(validLGAs);
      } else {
        setLagosLGAs([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('error', error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (identifier, isLGA = false) => {
    const collection = isLGA ? lagosLGAs : deliveryFees;
    const key = isLGA ? 'lga' : 'state';
    const currentFee = collection.find(item => item[key] === identifier)?.delivery_fee || 0;
    
    if (isLGA) {
      setEditingLGAs(prev => new Set(prev).add(identifier));
      setTempLGAValues(prev => ({ ...prev, [identifier]: currentFee }));
    } else {
      setEditingStates(prev => new Set(prev).add(identifier));
      setTempValues(prev => ({ ...prev, [identifier]: currentFee }));
    }
  };

  const handleCancel = (identifier, isLGA = false) => {
    if (isLGA) {
      setEditingLGAs(prev => {
        const newSet = new Set(prev);
        newSet.delete(identifier);
        return newSet;
      });
      setTempLGAValues(prev => {
        const { [identifier]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setEditingStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(identifier);
        return newSet;
      });
      setTempValues(prev => {
        const { [identifier]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSave = async (identifier, isLGA = false) => {
    const newFee = isLGA ? tempLGAValues[identifier] : tempValues[identifier];
    
    if (newFee === undefined || newFee < 0) {
      showNotification('error', 'Please enter a valid delivery fee');
      return;
    }

    setSaving(true);
    try {
      const endpoint = isLGA 
        ? '/admin/lgas-delivery-fees/update' 
        : '/admin/update-delivery-fees';
      
      const formData = new FormData();
      formData.append(identifier, newFee);

      const response = await api.postFormData(endpoint, formData);
      const data = response.data;

      if (data.code !== 200) {
        throw new Error(data.message || 'Update failed');
      }

      showNotification('success', data.message || 'Update successful');
      handleCancel(identifier, isLGA);
      fetchData();

    } catch (error) {
      console.error('Error updating delivery fee:', error);
      showNotification('error', error.response?.data?.message || error.message || 'Failed to update delivery fee');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async (isLGA = false) => {
    const values = isLGA ? tempLGAValues : tempValues;
    
    if (Object.keys(values).length === 0) {
      showNotification('error', `No ${isLGA ? 'LGA' : 'state'} changes to save`);
      return;
    }

    setSaving(true);
    try {
      const endpoint = isLGA 
        ? '/admin/lgas-delivery-fees/update' 
        : '/admin/update-delivery-fees';
      
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await api.postFormData(endpoint, formData);
      const data = response.data;

      if (data.code !== 200) {
        throw new Error(data.message || 'Bulk update failed');
      }

      showNotification('success', data.message || 'Bulk update successful');
      
      if (isLGA) {
        setEditingLGAs(new Set());
        setTempLGAValues({});
      } else {
        setEditingStates(new Set());
        setTempValues({});
      }
      
      fetchData();

    } catch (error) {
      console.error('Error bulk updating fees:', error);
      showNotification('error', error.response?.data?.message || error.message || 'Failed to bulk update fees');
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
    fee.state && fee.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLGAs = lagosLGAs.filter(lga =>
    lga.lga && lga.lga.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEditing = editingStates.size + editingLGAs.size;
  const isLagosState = (state) => state.toLowerCase() === 'lagos';

  const EditableField = ({ value, tempValue, onChange, onSave, onCancel, onEdit, isEditing, disabled, identifier }) => (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <span className="text-gray-500 text-xs">₦</span>
          <input
            key={`input-${identifier}`} // Add unique key to prevent React from reusing elements
            type="number"
            value={tempValue || ''}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
            className="w-20 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            min="0"
            step="100"
            autoFocus
          />
          <button onClick={onSave} disabled={disabled} className="text-green-600 hover:text-green-700 disabled:opacity-50">
            <Save className="w-3 h-3" />
          </button>
          <button onClick={onCancel} disabled={disabled} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <X className="w-3 h-3" />
          </button>
        </>
      ) : (
        <>
          <span className="text-xs font-medium text-gray-900">{formatPrice(value)}</span>
          <button onClick={onEdit} className="text-blue-600 hover:text-blue-700">
            <Edit2 className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      {notification && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 text-sm ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-pink-100 rounded-lg">
            <Truck className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Delivery Fee Management</h1>
            <p className="text-sm text-gray-600">Manage delivery fees for all Nigerian states and Lagos LGAs</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            How to Use This Admin Panel
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>1.</strong> Hello sleeping beauty, here are three (3) points on how to use this Delivery Fee Management panel</p>
            <p><strong>1.</strong> Click the edit icon (✏️) next to any state or Lagos LGA to modify its delivery fee</p>
            <p><strong>2.</strong> Enter the new fee amount and click save (✓) to update individually, or make multiple changes and use bulk save buttons</p>
            <p><strong>3.</strong> For Lagos LGAs, click the arrow (▶️) next to Lagos state to expand and view all local government areas</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-auto flex-grow max-w-md">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search states or LGAs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>

            {editingLGAs.size > 0 && (
              <button
                onClick={() => handleBulkUpdate(true)}
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                {saving ? 'Saving...' : `Save LGA Changes (${editingLGAs.size})`}
              </button>
            )}

            {editingStates.size > 0 && (
              <button
                onClick={() => handleBulkUpdate(false)}
                disabled={saving}
                className="px-4 py-2 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : `Save State Changes (${editingStates.size})`}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Total States', value: deliveryFees.length, icon: MapPin, color: 'blue' },
          { label: 'Lagos LGAs', value: lagosLGAs.length, icon: Building2, color: 'purple' },
          { label: 'Pending Changes', value: totalEditing, icon: Edit2, color: 'yellow' }
        ].map((stat, index) => (
          <div key={index} className={`bg-white p-5 rounded-lg shadow-sm border-l-4 border-${stat.color}-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Delivery Fees by State
            {searchTerm && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (showing results for "{searchTerm}")
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading delivery fees...</p>
          </div>
        ) : filteredFees.length === 0 && deliveryFees.length > 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No states found matching "{searchTerm}"</p>
          </div>
        ) : deliveryFees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No delivery fees found.</p>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              <strong>Note:</strong> The API did not return any delivery fee data. Please check the backend configuration.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Fee</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFees.map((fee) => (
                  <React.Fragment key={fee.state}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {isLagosState(fee.state) && (
                            <button
                              onClick={() => setExpandedLagos(!expandedLagos)}
                              className="p-1 hover:bg-gray-200 rounded-full mr-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                              {expandedLagos ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                            </button>
                          )}
                          <div className="text-sm font-medium text-gray-900">{fee.state}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStates.has(fee.state) ? (
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">₦</span>
                            <input
                              key={`state-${fee.state}`}
                              type="number"
                              value={tempValues[fee.state] || ''}
                              onChange={(e) => setTempValues(prev => ({ ...prev, [fee.state]: parseInt(e.target.value, 10) || 0 }))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                              min="0"
                              step="100"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900 font-medium">
                            {formatPrice(fee.delivery_fee)}
                            {isLagosState(fee.state) && <span className="ml-2 text-xs text-gray-500">(Base)</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingStates.has(fee.state) ? (
                          <div className="flex justify-end gap-3">
                            <button onClick={() => handleSave(fee.state)} disabled={saving} className="text-green-600 hover:text-green-800 disabled:opacity-50" title="Save">
                              <Save className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleCancel(fee.state)} disabled={saving} className="text-gray-500 hover:text-gray-700 disabled:opacity-50" title="Cancel">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleEdit(fee.state)} className="text-pink-600 hover:text-pink-800" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {isLagosState(fee.state) && expandedLagos && (
                      <tr>
                        <td colSpan="3" className="p-0">
                          <div className="px-4 py-4 bg-pink-50/50">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 ml-2">Lagos State LGAs</h4>
                            {lagosLGAs.length === 0 ? (
                              <div className="text-center py-4 text-gray-500">
                                <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                                <p>No Lagos LGAs found.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredLGAs.map((lgaItem) => (
                                  <div key={lgaItem.lga} className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-700">{lgaItem.lga}</span>
                                      <EditableField
                                        value={lgaItem.delivery_fee}
                                        tempValue={tempLGAValues[lgaItem.lga]}
                                        onChange={(value) => setTempLGAValues(prev => ({ ...prev, [lgaItem.lga]: value }))}
                                        onSave={() => handleSave(lgaItem.lga, true)}
                                        onCancel={() => handleCancel(lgaItem.lga, true)}
                                        onEdit={() => handleEdit(lgaItem.lga, true)}
                                        isEditing={editingLGAs.has(lgaItem.lga)}
                                        disabled={saving}
                                        identifier={lgaItem.lga}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
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
    </div>
  );
};

export default DeliveryFeeAdmin;