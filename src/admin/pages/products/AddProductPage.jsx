import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../../api/services/productService';
import { XCircle, Upload, Check, X } from 'lucide-react';

const AddProductPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    slashed_price: '',
    description: '',
    quantity: '',
    category: '',
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  
  // Available product categories
  const productCategories = [
    'serums',
    'moisturizers',
    'bathe and body',
    'sunscreens',
    'toners',
    'face cleansers'
  ];
  
  // Handle input changes for text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle file selection for images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (max 2MB each)
    const validFiles = files.filter(file => {
      const validSize = file.size <= 2 * 1024 * 1024; // 2MB
      const validType = file.type.startsWith('image/');
      
      if (!validSize) {
        setErrors(prev => ({
          ...prev,
          images: 'Image size should not exceed 2MB'
        }));
      }
      
      if (!validType) {
        setErrors(prev => ({
          ...prev,
          images: 'Only image files are allowed'
        }));
      }
      
      return validSize && validType;
    });
    
    if (validFiles.length > 0) {
      setFormData({
        ...formData,
        images: [...formData.images, ...validFiles]
      });
      
      // Generate image previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviewUrls(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
      
      // Clear error if valid files are selected
      if (errors.images) {
        setErrors({
          ...errors,
          images: ''
        });
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove an image from the selection
  const handleRemoveImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    
    const updatedPreviews = [...imagePreviewUrls];
    updatedPreviews.splice(index, 1);
    
    setFormData({
      ...formData,
      images: updatedImages
    });
    setImagePreviewUrls(updatedPreviews);
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.quantity.trim()) newErrors.quantity = 'Quantity is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    // Numeric validation
    if (formData.price && !/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      newErrors.price = 'Price must be a valid number';
    }
    
    if (formData.slashed_price && !/^\d+(\.\d{1,2})?$/.test(formData.slashed_price)) {
      newErrors.slashed_price = 'Original price must be a valid number';
    }
    
    if (formData.quantity && !/^\d+$/.test(formData.quantity)) {
      newErrors.quantity = 'Quantity must be a whole number';
    }
    
    // At least one image required
    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset submission states
    setSubmitSuccess(false);
    setSubmitError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert numeric values
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        slashed_price: formData.slashed_price ? parseFloat(formData.slashed_price) : '',
        quantity: parseInt(formData.quantity, 10)
      };
      
      const response = await productService.addProduct(productData);
      
      if (response && response.code === 200) {
        setSubmitSuccess(true);
        
        // Reset form after successful submission
        setFormData({
          name: '',
          price: '',
          slashed_price: '',
          description: '',
          quantity: '',
          category: '',
          images: []
        });
        setImagePreviewUrls([]);
        
        // Navigate to products page after short delay
        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      } else {
        setSubmitError(response.message || 'Failed to add product. Please try again.');
      }
    } catch (error) {
      setSubmitError(error.message || 'An error occurred while adding the product.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Add New Product</h1>
        <button
          onClick={() => navigate('/admin/products')}
          className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
        >
          Back to Products
        </button>
      </div>
      
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-md flex items-center">
          <Check size={20} className="mr-2" />
          <span>Product added successfully! Redirecting to products list...</span>
        </div>
      )}
      
      {submitError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center">
          <XCircle size={20} className="mr-2" />
          <span>{submitError}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Category</option>
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
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
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">₦</span>
              </div>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full pl-8 p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>
          
          {/* Slashed Price (Optional) */}
          <div>
            <label htmlFor="slashed_price" className="block text-sm font-medium text-gray-700 mb-1">
              Original Price (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">₦</span>
              </div>
              <input
                type="text"
                id="slashed_price"
                name="slashed_price"
                value={formData.slashed_price}
                onChange={handleChange}
                className={`w-full pl-8 p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                  errors.slashed_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.slashed_price && (
              <p className="mt-1 text-sm text-red-500">{errors.slashed_price}</p>
            )}
          </div>
          
          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter available quantity"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
            )}
          </div>
          
          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          
          {/* Product Images */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images <span className="text-red-500">*</span>
            </label>
            
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="images"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                  >
                    <span>Upload images</span>
                    <input
                      id="images"
                      name="images"
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 2MB each
                </p>
              </div>
            </div>
            
            {errors.images && (
              <p className="mt-1 text-sm text-red-500">{errors.images}</p>
            )}
            
            {/* Image previews */}
            {imagePreviewUrls.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Images:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                        <img
                          src={url}
                          alt={`Product preview ${index + 1}`}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting ? 'bg-pink-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Product...
              </div>
            ) : (
              'Add Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;