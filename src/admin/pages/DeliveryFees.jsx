import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Truck, MapPin, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Building2, Tag } from 'lucide-react';
import api from '../../api/axios';

const DeliveryFeeAdmin = () => {
  const [deliveryFees, setDeliveryFees] = useState([]);
  const [lagosLGAs, setLagosLGAs] = useState([]);
  const [deliveryDiscounts, setDeliveryDiscounts] = useState([]);
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
      const [feesResponse, lgasResponse, discountsResponse] = await Promise.allSettled([
        api.post('/fetch-delivery-fees'),
        api.post('/fetch-lgas-delivery-fees', { state: 'Lagos' }),
        api.post('/admin/manage-delivery-discounts', 'action=fetch', {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      ]);

      if (feesResponse.status === 'fulfilled' && feesResponse.value.data.code === 200) {
        const data = feesResponse.value.data;
        const validFees = data.delivery_fees?.filter(fee => fee && fee.state && fee.delivery_fee !== undefined) || [];
        setDeliveryFees(validFees);
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

      if (discountsResponse.status === 'fulfilled' && discountsResponse.value.data.code === 200) {
        const discountData = discountsResponse.value.data;
        const validDiscounts = Array.isArray(discountData.discount_data) 
          ? discountData.discount_data 
          : discountData.discount_data ? [discountData.discount_data] : [];
        setDeliveryDiscounts(validDiscounts);
      } else {
        setDeliveryDiscounts([]);
      }
    } catch (error) {
      showNotification('error', error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getDiscountForState = (stateName) => {
    const normalizedState = stateName?.toLowerCase();
    return deliveryDiscounts.find(d => d.state?.toLowerCase() === normalizedState);
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

  const calculateDiscountedPrice = (originalPrice, discountPercent) => {
    const discount = (originalPrice * discountPercent) / 100;
    return originalPrice - discount;
  };

  const handleEdit = (identifier, isLGA = false) => {
    const collection = isLGA ? lagosLGAs : deliveryFees;
    const key = isLGA ? 'lga' : 'state';
    const currentItem = collection.find(item => item[key] === identifier);
    const currentFee = currentItem?.original_delivery_fee || currentItem?.delivery_fee || 0;
    
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

  const hasDiscount = (item) => {
    return item.discount_percent > 0 && item.delivery_fee < item.original_delivery_fee;
  };

  const filteredFees = deliveryFees.filter(fee =>
    fee.state && fee.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLGAs = lagosLGAs.filter(lga =>
    lga.lga && lga.lga.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEditing = editingStates.size + editingLGAs.size;
  const isLagosState = (state) => state.toLowerCase() === 'lagos';
  
  // Count active delivery discounts
  const totalDiscounted = deliveryDiscounts.filter(d => isDiscountActive(d)).length;

  const EditableField = ({ item, tempValue, onChange, onSave, onCancel, onEdit, isEditing, disabled, identifier, lagosDiscount }) => {
    const isLagosDiscountActive = lagosDiscount ? isDiscountActive(lagosDiscount) : false;
    const originalPrice = item.original_delivery_fee || item.delivery_fee;
    
    return (
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-gray-500 text-sm">₦</span>
            <input
              key={`input-${identifier}`}
              type="number"
              value={tempValue || ''}
              onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
              className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="100"
              autoFocus
            />
            <button onClick={onSave} disabled={disabled} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
            </button>
            <button onClick={onCancel} disabled={disabled} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1 flex-1">
              {lagosDiscount && isLagosDiscountActive ? (
                <>
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(calculateDiscountedPrice(originalPrice, lagosDiscount.discount_percent))}
                  </span>
                </>
              ) : (
                <span className="text-base font-semibold text-gray-900">{formatPrice(item.delivery_fee)}</span>
              )}
            </div>
            <button onClick={onEdit} className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors ml-2">
              <Edit2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 text-sm w-11/12 max-w-md sm:w-auto sm:top-5 sm:right-5 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className='flex-grow'>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="p-3 bg-pink-100 rounded-lg">
            <Truck className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Delivery Fee Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage delivery fees for all Nigerian states and Lagos LGAs</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            How to Use This Panel
          </h3>
          <div className="text-sm text-blue-800 space-y-2 pl-7">
            <p><strong>1. Edit:</strong> Click the edit icon (✏️) next to any location to modify its delivery fee.</p>
            <p><strong>2. Save:</strong> Enter the new amount and click save (✓) to update individually, or use the bulk save buttons for multiple changes.</p>
            <p><strong>3. Discounts:</strong> Active discounts are shown with strikethrough original prices and green discounted prices with percentage badges.</p>
            <p><strong>4. Expand:</strong> For Lagos, click the arrow (▶️) to view and manage fees for all its Local Government Areas (LGAs).</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-auto flex-grow max-w-md">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search states or LGAs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap w-full sm:w-auto justify-start">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {[
          { label: 'Total States', value: deliveryFees.length, icon: MapPin, color: 'blue' },
          { label: 'Lagos LGAs', value: lagosLGAs.length, icon: Building2, color: 'purple' },
          { label: 'Active Discounts', value: totalDiscounted, icon: Tag, color: 'green' },
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
      
      {/* Main Content: States & LGAs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
         <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
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
          <div>
            {/* Mobile: Discount Info Banner for Other States */}
            {deliveryDiscounts.length > 0 && deliveryDiscounts.some(d => d.state !== 'lagos' && isDiscountActive(d)) && (
              <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3 mx-4 mt-4 mb-2">
                <div className="text-xs font-medium text-blue-900 mb-1">Other States Discount Info:</div>
                {(() => {
                  const otherStatesDiscount = deliveryDiscounts.find(d => d.state !== 'lagos' && isDiscountActive(d));
                  if (otherStatesDiscount) {
                    return (
                      <div className="text-xs text-blue-800 space-y-0.5">
                        <div>Valid: {formatDate(otherStatesDiscount.valid_from)} - {formatDate(otherStatesDiscount.valid_to)}</div>
                        {otherStatesDiscount.min_order_price_trigger > 0 && (
                          <div>Min. Order: {formatPrice(otherStatesDiscount.min_order_price_trigger)}</div>
                        )}
                        {otherStatesDiscount.isFirstTimeOnly && (
                          <div className="text-blue-700 font-medium">First-time customers only</div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* Desktop: Table Header */}
            <div className="hidden md:grid md:grid-cols-12 bg-gray-50 border-b border-gray-200 px-6 py-3 font-medium text-sm text-gray-700">
              <div className="col-span-3">State</div>
              <div className="col-span-3">Delivery Fee</div>
              <div className="col-span-4">
                <div className="flex flex-col gap-1">
                  <span>Active Discount</span>
                  {deliveryDiscounts.length > 0 && deliveryDiscounts.some(d => d.state !== 'lagos' && isDiscountActive(d)) && (
                    <div className="text-xs text-gray-500 font-normal">
                      {(() => {
                        const otherStatesDiscount = deliveryDiscounts.find(d => d.state !== 'lagos' && isDiscountActive(d));
                        if (otherStatesDiscount) {
                          return (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ● Active
                              </span>
                              <span className="text-sm font-semibold text-pink-600">{otherStatesDiscount.discount_percent}% OFF</span>
                              <span>• Valid: {formatDate(otherStatesDiscount.valid_from)} - {formatDate(otherStatesDiscount.valid_to)}</span>
                              {otherStatesDiscount.min_order_price_trigger > 0 && (
                                <span>• Min. Order: {formatPrice(otherStatesDiscount.min_order_price_trigger)}</span>
                              )}
                              {otherStatesDiscount.isFirstTimeOnly && (
                                <span className="text-blue-600">• First-time only</span>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Mobile: Card view. Desktop: Table view. */}
            {filteredFees.map((fee) => {
              const hasStateDiscount = hasDiscount(fee);
              const discount = getDiscountForState(fee.state);
              const isActive = discount ? isDiscountActive(discount) : false;
              
              return (
                <React.Fragment key={fee.state}>
                  <div className="flex flex-col md:grid md:grid-cols-12 md:items-center p-4 md:px-6 md:py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    {/* State Column */}
                    <div className="md:col-span-3">
                      <div className="flex items-center justify-between md:justify-start">
                          <div className="flex items-center gap-2">
                            {isLagosState(fee.state) && (
                              <button
                                onClick={() => setExpandedLagos(!expandedLagos)}
                                className="p-1 hover:bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                              >
                                {expandedLagos ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
                              </button>
                            )}
                            <div className="text-sm font-medium text-gray-900">{fee.state}</div>
                            {hasStateDiscount && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <Tag className="w-3 h-3 mr-1" />
                                Discounted
                              </span>
                            )}
                          </div>
                      </div>
                    </div>

                    {/* Delivery Fee Column */}
                    <div className="md:col-span-3 mt-2 md:mt-0">
                       <div className="flex items-center justify-between md:justify-start">
                          <span className="md:hidden text-sm text-gray-500">Fee</span>
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
                            <div className="flex flex-col items-start">
                              {hasStateDiscount ? (
                                <>
                                  <span className="text-xs text-gray-400 line-through">{formatPrice(fee.original_delivery_fee)}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-green-600">{formatPrice(fee.delivery_fee)}</span>
                                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">{`-${fee.discount_percent}%`}</span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-sm text-gray-900 font-medium">
                                  {formatPrice(fee.delivery_fee)}
                                  {isLagosState(fee.state) && <span className="ml-2 text-xs text-gray-500">(Base)</span>}
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Discount Column */}
                    <div className="md:col-span-4 mt-2 md:mt-0">
                      <div className="flex items-center justify-between md:justify-start">
                        <span className="md:hidden text-sm text-gray-500">Discount</span>
                        {discount ? (
                          <div className="flex flex-col gap-1">
                            {/* For Lagos, show full details on all screens */}
                            {isLagosState(fee.state) ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {isActive ? '● Active' : '○ Inactive'}
                                  </span>
                                  <span className="text-sm font-semibold text-pink-600">{`${discount.discount_percent}% OFF`}</span>
                                </div>
                                {isActive && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatPrice(fee.original_delivery_fee || fee.delivery_fee)}
                                    </span>
                                    <span className="text-sm font-semibold text-green-600">
                                      {formatPrice(calculateDiscountedPrice(fee.original_delivery_fee || fee.delivery_fee, discount.discount_percent))}
                                    </span>
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  {formatDate(discount.valid_from)} - {formatDate(discount.valid_to)}
                                </div>
                                {discount.min_order_price_trigger > 0 && (
                                  <div className="text-xs text-gray-500">
                                    Min: {formatPrice(discount.min_order_price_trigger)}
                                  </div>
                                )}
                                {discount.isFirstTimeOnly && (
                                  <span className="text-xs text-blue-600">First-time only</span>
                                )}
                              </>
                            ) : (
                              /* For other states, only show discounted price */
                              <>
                                {isActive && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatPrice(fee.original_delivery_fee || fee.delivery_fee)}
                                    </span>
                                    <span className="text-sm font-semibold text-green-600">
                                      {formatPrice(calculateDiscountedPrice(fee.original_delivery_fee || fee.delivery_fee, discount.discount_percent))}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No discount</span>
                        )}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="md:col-span-2 mt-2 md:mt-0">
                       <div className="flex items-center justify-between md:justify-end">
                         <span className="md:hidden text-sm text-gray-500">Actions</span>
                          {editingStates.has(fee.state) ? (
                            <div className="flex justify-end gap-3">
                              <button onClick={() => handleSave(fee.state)} disabled={saving} className="text-green-600 hover:text-green-800 disabled:opacity-50" title="Save">
                                <Save className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleCancel(fee.state)} disabled={saving} className="text-gray-500 hover:text-gray-700 disabled:opacity-50" title="Cancel">
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => handleEdit(fee.state)} className="text-pink-600 hover:text-pink-800" title="Edit">
                              <Edit2 className="w-5 h-5" />
                              </button>
                          )}
                       </div>
                    </div>
                  </div>
                  
                  {isLagosState(fee.state) && expandedLagos && (
                    <div className="col-span-full">
                      <div className="p-4 bg-pink-50/50 border-t border-b border-pink-200">
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Lagos State LGAs</h4>
                          {/* Lagos Discount Info - Show once at top */}
                          {(() => {
                            const lagosDiscount = getDiscountForState('lagos');
                            const isLagosDiscountActive = lagosDiscount ? isDiscountActive(lagosDiscount) : false;
                            if (lagosDiscount) {
                              return (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${isLagosDiscountActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                      {isLagosDiscountActive ? '● Active' : '○ Inactive'}
                                    </span>
                                    <span className="text-sm font-semibold text-pink-600">{lagosDiscount.discount_percent}% OFF</span>
                                    <span className="text-gray-600">
                                      • Valid: {formatDate(lagosDiscount.valid_from)} - {formatDate(lagosDiscount.valid_to)}
                                    </span>
                                    {lagosDiscount.min_order_price_trigger > 0 && (
                                      <span className="text-gray-600">
                                        • Min: {formatPrice(lagosDiscount.min_order_price_trigger)}
                                      </span>
                                    )}
                                    {lagosDiscount.isFirstTimeOnly && (
                                      <span className="text-blue-600 font-medium">• First-time only</span>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        {lagosLGAs.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                            <p>No Lagos LGAs found.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredLGAs.map((lgaItem) => {
                              const hasLGADiscount = hasDiscount(lgaItem);
                              const lagosDiscount = getDiscountForState('lagos');
                              
                              return (
                                <div key={lgaItem.lga} className={`bg-white p-4 rounded-lg border shadow-sm transition-all hover:shadow-md ${hasLGADiscount ? 'border-green-300' : 'border-gray-200'}`}>
                                  <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                      <span className="text-sm font-semibold text-gray-800">{lgaItem.lga}</span>
                                      {hasLGADiscount && (
                                        <Tag className="w-4 h-4 text-green-600" />
                                      )}
                                    </div>
                                    <EditableField
                                      item={lgaItem}
                                      tempValue={tempLGAValues[lgaItem.lga]}
                                      onChange={(value) => setTempLGAValues(prev => ({ ...prev, [lgaItem.lga]: value }))}
                                      onSave={() => handleSave(lgaItem.lga, true)}
                                      onCancel={() => handleCancel(lgaItem.lga, true)}
                                      onEdit={() => handleEdit(lgaItem.lga, true)}
                                      isEditing={editingLGAs.has(lgaItem.lga)}
                                      disabled={saving}
                                      identifier={lgaItem.lga}
                                      lagosDiscount={lagosDiscount}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryFeeAdmin;