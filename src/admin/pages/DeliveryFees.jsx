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
      api.get('/fetch-delivery-fees'),
      api.get('/fetch-lgas-delivery-fees?state=Lagos')
    ]);

    if (feesResponse.status === 'fulfilled' && feesResponse.value.data.code === 200) {
      const data = feesResponse.value.data;
      
      // Enhanced debugging
      console.log('=== API DEBUG INFO ===');
      console.log('Full API Response:', JSON.stringify(data, null, 2));
      console.log('Response Code:', data.code);
      console.log('Response Message:', data.message);
      console.log('Raw delivery_fees array:', data.delivery_fees);
      console.log('Array length:', data.delivery_fees?.length || 0);
      
      // Check first few items in detail
      if (data.delivery_fees && data.delivery_fees.length > 0) {
        console.log('First 3 items detailed:');
        data.delivery_fees.slice(0, 3).forEach((item, index) => {
          console.log(`Item ${index}:`, item);
          console.log(`  - Keys:`, Object.keys(item));
          console.log(`  - Values:`, Object.values(item));
          console.log(`  - Has state:`, !!item.state);
          console.log(`  - Has delivery_fee:`, !!item.delivery_fee);
          console.log(`  - State value:`, item.state);
          console.log(`  - Fee value:`, item.delivery_fee);
        });
      }
      
      // Check if items have different property names
      const sampleItem = data.delivery_fees?.[0];
      if (sampleItem) {
        console.log('Sample item properties:', Object.keys(sampleItem));
        console.log('Sample item:', sampleItem);
      }
      
      // More flexible filtering - check for different possible property names
      const validFees = data.delivery_fees?.filter(fee => {
        if (!fee) return false;
        
        // Check for common property variations
        const hasState = fee.state || fee.name || fee.State || fee.location;
        const hasFee = fee.delivery_fee !== undefined || fee.fee !== undefined || fee.price !== undefined;
        
        console.log('Item validation:', { fee, hasState, hasFee });
        return hasState && hasFee;
      }) || [];
      
      console.log('Valid fees after filtering:', validFees);
      console.log('=== END DEBUG INFO ===');
      
      if (validFees.length === 0 && data.delivery_fees?.length > 0) {
        console.error('❌ API DATA ISSUE: All items filtered out');
        console.error('This suggests the API is returning empty objects or using different property names');
        
        // Try to use raw data if it exists
        const rawData = data.delivery_fees || [];
        setDeliveryFees(rawData);
        showNotification('error', `API returned ${rawData.length} items but they appear to be empty. Check console for details.`);
      } else {
        setDeliveryFees(validFees);
        showNotification('success', data.message || `Loaded ${validFees.length} delivery fees`);
      }
    } else {
      throw new Error('Failed to fetch delivery fees');
    }

    // Similar debugging for LGAs
    if (lgasResponse.status === 'fulfilled' && lgasResponse.value.data.code === 200) {
      const lgaData = lgasResponse.value.data;
      console.log('Lagos LGAs Response:', JSON.stringify(lgaData, null, 2));
      
      const validLGAs = lgaData.delivery_fees?.filter(lga => {
        const hasLGA = lga && (lga.lga || lga.name);
        const hasFee = lga.delivery_fee !== undefined;
        return hasLGA && hasFee;
      }) || [];
      
      console.log('Valid LGAs after filtering:', validLGAs);
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
      setEditingLGAs(prev => new Set([...prev, identifier]));
      setTempLGAValues(prev => ({ ...prev, [identifier]: currentFee }));
    } else {
      setEditingStates(prev => new Set([...prev, identifier]));
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
    
    if (newFee < 0) {
      showNotification('error', 'Please enter a valid delivery fee');
      return;
    }

    setSaving(true);
    try {
      const endpoint = isLGA 
        ? '/admin/lgas-delivery-fees/update' 
        : '/admin/update-delivery-fees';
      
      const requestData = { [identifier]: newFee };
      const response = await api.post(endpoint, requestData);
      
      const data = response.data;
      console.log('API Response:', data);
      
      if (data.code === 200) {
        // Always update the local state immediately with the new value
        // Don't rely on the API response data structure since it seems inconsistent
        if (isLGA) {
          setLagosLGAs(prev => prev.map(item => 
            item.lga === identifier 
              ? { ...item, delivery_fee: parseInt(newFee) } 
              : item
          ));
        } else {
          setDeliveryFees(prev => prev.map(fee => 
            fee.state === identifier 
              ? { ...fee, delivery_fee: parseInt(newFee) } 
              : fee
          ));
        }
        
        handleCancel(identifier, isLGA);
        showNotification('success', data.message || `Updated ${isLGA ? 'LGA' : 'state'} delivery fee successfully`);
        
        // Don't auto-refresh since we've already updated the state
        // Only refresh manually if user clicks refresh button
        
      } else {
        throw new Error(data.message || 'Failed to update delivery fee');
      }
    } catch (error) {
      console.error('Error updating delivery fee:', error);
      showNotification('error', error.response?.data?.message || 'Failed to update delivery fee');
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
      
      const response = await api.post(endpoint, values);
      
      const data = response.data;
      console.log('Bulk Update API Response:', data);
      
      if (data.code === 200) {
        // Always update the local state immediately with the new values
        // Don't rely on the API response data structure since it seems inconsistent
        if (isLGA) {
          setLagosLGAs(prev => prev.map(item => 
            values[item.lga] !== undefined 
              ? { ...item, delivery_fee: parseInt(values[item.lga]) } 
              : item
          ));
          setEditingLGAs(new Set());
          setTempLGAValues({});
        } else {
          setDeliveryFees(prev => prev.map(fee => 
            values[fee.state] !== undefined 
              ? { ...fee, delivery_fee: parseInt(values[fee.state]) } 
              : fee
          ));
          setEditingStates(new Set());
          setTempValues({});
        }
        
        showNotification('success', data.message || `All ${isLGA ? 'LGA' : 'state'} fees updated successfully`);
        
        // Don't auto-refresh since we've already updated the state
        // Only refresh manually if user clicks refresh button
        
      } else {
        throw new Error(data.message || 'Failed to update fees');
      }
    } catch (error) {
      console.error('Error updating fees:', error);
      showNotification('error', error.response?.data?.message || 'Failed to update fees');
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

  const filteredLGAs = lagosLGAs.filter(lga =>
    lga.lga.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEditing = editingStates.size + editingLGAs.size;
  const isLagosState = (state) => state.toLowerCase() === 'lagos';

  const EditableField = ({ value, tempValue, onChange, onSave, onCancel, onEdit, isEditing, disabled }) => (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <span className="text-gray-500 text-xs">₦</span>
          <input
            type="number"
            value={tempValue || ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="w-16 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            min="0"
            step="100"
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
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 text-gray-500 hover:text-gray-700">
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
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>

            {editingLGAs.size > 0 && (
              <button
                onClick={() => handleBulkUpdate(true)}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                {saving ? 'Saving...' : `Save LGA Changes (${editingLGAs.size})`}
              </button>
            )}

            {editingStates.size > 0 && (
              <button
                onClick={() => handleBulkUpdate(false)}
                disabled={saving}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : `Save State Changes (${editingStates.size})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Total States', value: deliveryFees.length, icon: MapPin, color: 'blue' },
          { label: 'Lagos LGAs', value: lagosLGAs.length, icon: Building2, color: 'purple' },
          { label: 'Pending Changes', value: totalEditing, icon: Edit2, color: 'yellow' }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
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
            {deliveryFees.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Troubleshooting:</strong> If you're seeing this message, the API may be returning empty objects. 
                  Check the browser console for debugging information.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
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
                              className="p-1 hover:bg-gray-200 rounded mr-2"
                            >
                              {expandedLagos ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                            </button>
                          )}
                          <div className="p-1 bg-gray-100 rounded mr-3">
                            <MapPin className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{fee.state}</div>
                            {isLagosState(fee.state) && (
                              <div className="text-xs text-gray-500">{lagosLGAs.length} LGAs available</div>
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
                              onChange={(e) => setTempValues(prev => ({ ...prev, [fee.state]: parseInt(e.target.value) || 0 }))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                              min="0"
                              step="100"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900 font-medium">
                            {formatPrice(fee.delivery_fee)}
                            {isLagosState(fee.state) && <span className="ml-2 text-xs text-gray-500">(Base rate)</span>}
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
                    {isLagosState(fee.state) && expandedLagos && (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Lagos State LGAs</h4>
                            {lagosLGAs.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No Lagos LGAs found. They may not be configured yet.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredLGAs.map((lgaItem) => (
                                  <div key={lgaItem.lga} className="bg-white p-3 rounded border border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-sm font-medium text-gray-700">{lgaItem.lga}</span>
                                      </div>
                                      <EditableField
                                        value={lgaItem.delivery_fee}
                                        tempValue={tempLGAValues[lgaItem.lga]}
                                        onChange={(value) => setTempLGAValues(prev => ({ ...prev, [lgaItem.lga]: value }))}
                                        onSave={() => handleSave(lgaItem.lga, true)}
                                        onCancel={() => handleCancel(lgaItem.lga, true)}
                                        onEdit={() => handleEdit(lgaItem.lga, true)}
                                        isEditing={editingLGAs.has(lgaItem.lga)}
                                        disabled={saving}
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