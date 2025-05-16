import React from 'react';

const ProductInfo = ({ product }) => {
  return (
    <div className="space-y-4">
      {/* Short description */}
      {product.shortDescription && (
        <p className="text-gray-600">{product.shortDescription}</p>
      )}
      
      {/* Features/Highlights */}
      {product.features && product.features.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-2">Key Benefits</h3>
          <ul className="list-disc list-inside space-y-1">
            {product.features.map((feature, index) => (
              <li key={index} className="text-gray-600">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Product Specs */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-2">Specifications</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex items-start">
                <span className="text-gray-500 mr-2">{key}:</span>
                <span className="text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* SKU and Category */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {product.sku && (
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">SKU:</span>
            <span className="text-gray-700">{product.sku}</span>
          </div>
        )}
        {product.category && (
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">Category:</span>
            <span className="text-gray-700">{product.category}</span>
          </div>
        )}
      </div>
      
      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductInfo;