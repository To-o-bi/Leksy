import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Upload, X, AlertCircle } from 'lucide-react';
import productService from '../../../api/services/productService';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [productNotFound, setProductNotFound] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    slashed_price: '',
    description: '',
    quantity: '',
    category: '',
    images: []
  });
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Available product categories
  const productCategories = [
    'serums',
    'moisturizers',
    'bathe and body',
    'sunscreens',
    'toners',
    'face cleansers'
  ];
  
  // Fetch product data on component mount
  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        if (!id) {
          throw new Error('No product ID provided');
        }
        
        console.log('Fetching product with ID:', id);
        
        // Call the real API to fetch product data
        const productData = await productService.fetchProduct(id);
        
        if (!productData) {
          setProductNotFound(true);
          throw new Error('Product not found');
        }
        
        console.log('Product data fetched:', productData);
        
        // Set form data from API response
        setFormData({
          name: productData.name || '',
          price: productData.price ? productData.price.toString() : '',
          slashed_price: productData.slashed_price ? productData.slashed_price.toString() : '',
          category: productData.category || '',
          quantity: productData.quantity ? productData.quantity.toString() : '',
          description: productData.description || '',
          images: [] // New images will be added here
        });
        
        // Set existing images from API response
        setExistingImages(
          productData.images || 
          (productData.image_url ? [productData.image_url] : [])
        );
        
      } catch (error) {
        console.error('Error fetching product:', error);
        setSubmitError('Failed to load product data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);
  
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
  
  // Remove a new image from the selection
  const handleRemoveNewImage = (index) => {
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
  
  // Remove an existing image
  const handleRemoveExistingImage = (index) => {
    const updatedExistingImages = [...existingImages];
    updatedExistingImages.splice(index, 1);
    setExistingImages(updatedExistingImages);
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
    
    // At least one image required (either existing or new)
    if (existingImages.length === 0 && formData.images.length === 0) {
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
      // Prepare data for submission
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        quantity: parseInt(formData.quantity, 10),
        category: formData.category,
        images: formData.images,
        existing_images: existingImages
      };
      
      // Add slashed_price if provided
      if (formData.slashed_price) {
        productData.slashed_price = parseFloat(formData.slashed_price);
      }
      
      console.log('Submitting update with data:', productData);
      
      // Make the API call to update the product
      const response = await productService.editProduct(id, productData);
      
      console.log('Update response:', response);
      setSubmitSuccess(true);
      
      // Navigate back to products list after short delay
      setTimeout(() => {
        navigate('/admin/products/stock', {
          state: {
            notification: {
              type: 'success',
              message: `Product "${formData.name}" has been updated successfully.`
            }
          }
        });
      }, 1500);
    } catch (error) {
      console.error('Error updating product:', error);
      setSubmitError(error.message || 'An error occurred while updating the product.');
      setIsSubmitting(false);
    }
  };
  
  // Handle navigate back to products page
  const handleGoBack = () => {
    navigate('/admin/products/stock');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  
  if (productNotFound) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">Product Not Found</h1>
          </div>
        </div>
        
        <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-md mb-6">
          <p className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            The product you are looking for does not exist or has been removed.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
          >
            Return to Products
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">Edit Product</h1>
        </div>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
        >
          Back to Products
        </button>
      </div>
      
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-md flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Product updated successfully! Redirecting to products list...</span>
        </div>
      )}
      
      {submitError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center">
          <AlertCircle size={20} className="mr-2" />
          <span>{submitError}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
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
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Images
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {existingImages.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                      <img
                        src={imageUrl}
                        alt={`Product image ${index + 1}`}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload New Images */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {existingImages.length > 0 ? 'Add More Images' : 'Product Images'} {existingImages.length === 0 && <span className="text-red-500">*</span>}
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
                    htmlFor="images[]"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                  >
                    <span>Upload images</span>
                    {/* Important: Use the correct field name expected by the backend */}
                    <input
                      id="images[]"
                      name="images[]"
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
            
            {/* New image previews */}
            {imagePreviewUrls.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">New Images:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                        <img
                          src={url}
                          alt={`New image ${index + 1}`}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
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
            onClick={handleGoBack}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            disabled={isSubmitting}
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
                Updating Product...
              </div>
            ) : (
              <>
                <Save size={18} className="mr-2 inline" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;