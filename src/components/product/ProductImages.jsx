import React, { useState } from 'react';

const ProductImages = ({ images, name }) => {
  const [currentImage, setCurrentImage] = useState(0);

  // If there are no images, return a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-200 rounded-lg flex items-center justify-center w-full h-96">
        <span className="text-gray-500">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <img
          src={images[currentImage]}
          alt={`${name} - Image ${currentImage + 1}`}
          className="w-full h-96 object-contain"
        />
      </div>
      
      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto py-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={`border ${
                currentImage === index 
                  ? 'border-primary'
                  : 'border-gray-200 hover:border-gray-300'
              } rounded-md overflow-hidden w-20 h-20 flex-shrink-0`}
              onClick={() => setCurrentImage(index)}
            >
              <img
                src={image}
                alt={`${name} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;