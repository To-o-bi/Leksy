import React, { useState } from 'react';

const ProductForm = ({ product = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    price: product?.price || '',
    piece: product?.piece || '',
    image: null,
    imagePreview: product?.image || null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for the changed field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);

      // Clear error for image if exists
      if (errors.image) {
        setErrors({
          ...errors,
          image: null
        });
      }
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.price) newErrors.price = 'Price is required';
    else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!formData.piece) newErrors.piece = 'Stock quantity is required';
    else if (isNaN(parseInt(formData.piece)) || parseInt(formData.piece) < 0) {
      newErrors.piece = 'Stock quantity must be a non-negative number';
    }
    if (!product && !formData.image) newErrors.image = 'Product image is required';

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, you would upload the image to a server and get a URL back
      
      // Prepare form data for submission
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        piece: parseInt(formData.piece),
        // In a real app, you would include the image URL here
      };
      
      // Call the submit handler passed from parent
      await onSubmit(productData);
      
    } catch (error) {
      console.error('Error submitting product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Serum', 'Cleanser', 'Moisturizer', 'Toner', 'Mask', 'Sunscreen'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">
          {errors.submit}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (₦)
            </label>
            <input
              type="number"
              step="0.01"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          {/* Stock Quantity */}
          <div>
            <label htmlFor="piece" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              id="piece"
              name="piece"
              value={formData.piece}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.piece ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
              placeholder="0"
            />
            {errors.piece && (
              <p className="mt-1 text-sm text-red-500">{errors.piece}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Product Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-4 text-center">
                {formData.imagePreview ? (
                  <div className="relative">
                    <img
                      src={formData.imagePreview}
                      alt="Product preview"
                      className="mx-auto h-40 w-40 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, image: null, imagePreview: null})}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg 
                      className="mx-auto h-12 w-12 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    <p className="text-sm text-gray-500">
                      Drag and drop an image, or{" "}
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer text-pink-500 hover:text-pink-600"
                      >
                        <span>browse</span>
                        <input
                          id="image-upload"
                          name="image"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </>
                )}
              </div>
            </div>
            {errors.image && (
              <p className="mt-1 text-sm text-red-500">{errors.image}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              {product ? 'Update Product' : 'Add Product'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;