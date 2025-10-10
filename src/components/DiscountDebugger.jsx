import React, { useEffect } from 'react';
import { useDiscounts } from '../contexts/DiscountContext';

const DiscountDebugger = () => {
  const discountContext = useDiscounts();
  
  useEffect(() => {
    console.log('🐛 [DEBUG] Full context:', discountContext);
    console.log('🐛 [DEBUG] Discounts:', discountContext?.discounts);
    console.log('🐛 [DEBUG] Has discounts:', discountContext?.hasDiscounts);
    console.log('🐛 [DEBUG] Loading:', discountContext?.loading);
    console.log('🐛 [DEBUG] Error:', discountContext?.error);
  }, [discountContext]);
  
  if (!discountContext) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border-2 border-red-500 p-4 rounded-lg shadow-lg z-50 max-w-md text-xs">
        <h3 className="font-bold mb-2">⚠️ Discount Context NOT FOUND</h3>
        <p>The DiscountProvider is not wrapping this component!</p>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-500 p-4 rounded-lg shadow-lg z-50 max-w-md text-xs overflow-auto max-h-96">
      <h3 className="font-bold mb-2">🐛 Discount Context Debug</h3>
      <div className="space-y-1">
        <p><strong>Loading:</strong> <span className={discountContext?.loading ? 'text-orange-600' : 'text-green-600'}>{String(discountContext?.loading)}</span></p>
        <p><strong>Has Discounts:</strong> <span className={discountContext?.hasDiscounts ? 'text-green-600' : 'text-red-600'}>{String(discountContext?.hasDiscounts)}</span></p>
        <p><strong>Discount Count:</strong> <span className="font-bold">{discountContext?.discounts?.length || 0}</span></p>
        <p><strong>Error:</strong> <span className={discountContext?.error ? 'text-red-600' : 'text-green-600'}>{discountContext?.error || 'None'}</span></p>
        
        {discountContext?.discounts && discountContext.discounts.length > 0 ? (
          <div className="mt-2 border-t pt-2">
            <strong>Active Discounts:</strong>
            {discountContext.discounts.map((d, i) => (
              <div key={i} className="ml-2 mt-1 text-[10px] bg-white p-1 rounded">
                <div>• <strong>Category:</strong> {d.category}</div>
                <div className="ml-2">
                  <strong>Percent:</strong> {d.discount_percent}%
                </div>
                <div className="ml-2">
                  <strong>Active:</strong> {String(d.isActive)}
                </div>
                <div className="ml-2">
                  <strong>Dates:</strong> {d.valid_from} to {d.valid_to}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 border-t pt-2">
            <p className="text-red-600 font-bold">❌ No active discounts loaded</p>
            <button 
              onClick={() => discountContext?.refreshDiscounts?.()} 
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
            >
              Refresh Discounts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountDebugger;