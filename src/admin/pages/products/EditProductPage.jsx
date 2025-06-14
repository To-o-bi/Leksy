import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { productService } from '../../../api';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [productNotFound, setProductNotFound] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    slashed_price: '',
    description: '',
    quantity: '',
    category: '',
  });
  
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Available product categories from API
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
      if (!id) {
        setProductNotFound(true);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching product with ID:', id);
        
        const response = await productService.fetchProduct(id);
        console.log('Product fetch response:', response);
        
        if (!response || response.code !== 200 || !response.product) {
          setProductNotFound(true);
          return;
        }
        
        const productData = response.product;
        console.log('Product data:', productData);
        
        // Store original data for comparison
        setOriginalData(productData);
        
        // Set form data from API response
        setFormData({
          name: productData.name || '',
          price: productData.price ? productData.price.toString() : '',
          slashed_price: productData.slashed_price ? productData.slashed_price.toString() : '',
          category: productData.category || '',
          quantity: productData.available_qty !== undefined ? productData.available_qty.toString() : '',
          description: productData.description || '',
        });
        
        // Set existing images
        setExistingImages(Array.isArray(productData.images) ? productData.images : []);
        
      } catch (error) {
        console.error('Error fetching product:', error);
        
        if (error.message.includes('not found') || error.status === 404) {
          setProductNotFound(true);
        } else if (error.message.includes('Authentication')) {
          setSubmitError('Please log in again to continue.');
          setTimeout(() => navigate('/admin/login'), 2000);
        } else {
          setSubmitError('Failed to load product data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id, navigate]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (submitError) setSubmitError('');
  };
  
  // Validate image file
  const validateImageFile = (file) => {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 2MB' };
    }
    
    return { valid: true };
  };
  
  // Handle file selection for new images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total image limit (existing + new)
    if (existingImages.length + newImages.length + files.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 5 images allowed per product'
      }));
      return;
    }
    
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      const validation = validateImageFile(file);
      
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({
          name: file.name,
          reason: validation.error
        });
      }
    });
    
    // Show validation errors
    if (invalidFiles.length > 0) {
      const errorMessage = invalidFiles.map(f => `${f.name}: ${f.reason}`).join(', ');
      setErrors(prev => ({
        ...prev,
        images: errorMessage
      }));
    }
    
    // Add valid files
    if (validFiles.length > 0) {
      setNewImages(prev => [...prev, ...validFiles]);
      
      // Generate preview URLs
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
      
      // Clear image error if we have valid files
      if (errors.images && validFiles.length > 0) {
        setErrors(prev => ({
          ...prev,
          images: ''
        }));
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove a new image
  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  // Remove an existing image
  const handleRemoveExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Product name must be at least 2 characters';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price greater than 0';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Please enter a valid quantity (0 or greater)';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    } else if (!productCategories.includes(formData.category)) {
      newErrors.category = 'Invalid category selected';
    }
    
    // Optional slashed price validation
    if (formData.slashed_price && (isNaN(formData.slashed_price) || parseFloat(formData.slashed_price) <= 0)) {
      newErrors.slashed_price = 'Please enter a valid original price';
    }
    
    // Validate slashed price is greater than current price
    if (formData.slashed_price && formData.price) {
      const slashedPrice = parseFloat(formData.slashed_price);
      const currentPrice = parseFloat(formData.price);
      if (slashedPrice <= currentPrice) {
        newErrors.slashed_price = 'Original price must be greater than current price';
      }
    }
    
    // At least one image required (existing or new)
    if (existingImages.length === 0 && newImages.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Check if form has changes
  const hasChanges = () => {
    if (!originalData) return false;
    
    return (
      formData.name !== originalData.name ||
      parseFloat(formData.price) !== originalData.price ||
      parseFloat(formData.slashed_price || 0) !== (originalData.slashed_price || 0) ||
      formData.description !== originalData.description ||
      parseInt(formData.quantity) !== originalData.available_qty ||
      formData.category !== originalData.category ||
      newImages.length > 0 ||
      existingImages.length !== (originalData.images?.length || 0)
    );
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitError('Please correct the errors above and try again.');
      return;
    }
    
    if (!hasChanges()) {
      setSubmitError('No changes detected. Please make some changes before saving.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);
    
    try {
      // Prepare data for submission - only include changed fields
      const productData = {};
      
      // Add changed text fields
      if (formData.name !== originalData.name) {
        productData.name = formData.name.trim();
      }
      if (parseFloat(formData.price) !== originalData.price) {
        productData.price = parseFloat(formData.price);
      }
      if (formData.description !== originalData.description) {
        productData.description = formData.description.trim();
      }
      if (parseInt(formData.quantity) !== originalData.available_qty) {
        productData.quantity = parseInt(formData.quantity, 10);
      }
      if (formData.category !== originalData.category) {
        productData.category = formData.category;
      }
      
      // Handle slashed price
      const newSlashedPrice = formData.slashed_price ? parseFloat(formData.slashed_price) : null;
      const originalSlashedPrice = originalData.slashed_price || null;
      if (newSlashedPrice !== originalSlashedPrice) {
        if (newSlashedPrice) {
          productData.slashed_price = newSlashedPrice;
        }
      }
      
      // Add new images if any
      if (newImages.length > 0) {
        productData.images = newImages;
      }
      
      console.log('Submitting update with data:', {
        productId: id,
        changes: Object.keys(productData),
        hasNewImages: newImages.length > 0,
        existingImagesCount: existingImages.length
      });
      
      // Make the API call
      const response = await productService.updateProduct(id, productData);
      console.log('Update response:', response);
      
      if (response && response.code === 200) {
        setSubmitSuccess(true);
        
        // Navigate back after showing success message
        setTimeout(() => {
          navigate('/admin/products', {
            state: {
              notification: {
                type: 'success',
                message: `Product "${formData.name}" has been updated successfully.`
              }
            }
          });
        }, 2000);
      } else {
        throw new Error(response?.message || 'Failed to update product');
      }
      
    } catch (error) {
      console.error('Error updating product:', error);
      
      if (error.message.includes('Authentication')) {
        setSubmitError('Please log in again to continue.');
        setTimeout(() => navigate('/admin/login'), 2000);
      } else {
        setSubmitError(error.message || 'An error occurred while updating the product.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle navigate back
  const handleGoBack = () => {
    if (hasChanges() && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/admin/products');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Product not found state
  if (productNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/admin/products')}
                  className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
                >
                  <ChevronLeft size={20} />
                  <span className="ml-1">Back</span>
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Product Not Found</h1>
              </div>
            </div>
            
            <div className="px-6 py-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
                <div className="flex items-center">
                  <AlertCircle size={20} className="mr-3 text-red-500 flex-shrink-0" />
                  <p className="text-red-800">
                    The product you are looking for does not exist or has been removed.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => navigate('/admin/products')}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                >
                  Return to Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleGoBack}
                  className="flex items-center text-gray-600 hover:text-gray-800 mr-4 transition-colors"
                  disabled={isSubmitting}
                >
                  <ChevronLeft size={20} />
                  <span className="ml-1">Back</span>
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-6">
            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircle size={20} className="mr-3 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium">Product updated successfully!</p>
                    <p className="text-green-700 text-sm mt-1">
                      Redirecting to products list...
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle size={20} className="mr-3 text-red-500 flex-shrink-0" />
                  <p className="text-red-800">{submitError}</p>
                </div>
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {productCategories.map((category) => (
                      <option key={category} value={category}>
                        {category.split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>
                
                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₦</span>
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>
                
                {/* Slashed Price */}
                <div>
                  <label htmlFor="slashed_price" className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₦</span>
                    </div>
                    <input
                      type="number"
                      id="slashed_price"
                      name="slashed_price"
                      value={formData.slashed_price}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.slashed_price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.slashed_price && (
                    <p className="mt-1 text-sm text-red-600">{errors.slashed_price}</p>
                  )}
                </div>
                
                {/* Quantity */}
                <div className="md:col-span-2">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.quantity ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter available quantity"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>
                
                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter product description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Images ({existingImages.length})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {existingImages.map((imageUrl, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={imageUrl}
                              alt={`Product image ${index + 1}`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          </div>
                          {!isSubmitting && (
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Upload New Images */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {existingImages.length > 0 ? 'Add More Images' : 'Product Images'}{' '}
                    {existingImages.length === 0 && <span className="text-red-500">*</span>}
                  </label>
                  
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <label
                        htmlFor="images"
                        className="cursor-pointer text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Choose files
                        <input
                          id="images"
                          name="images"
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isSubmitting}
                        />
                      </label>
                      <p className="text-gray-500">or drag and drop</p>
                      <p className="text-sm text-gray-400">
                        PNG, JPG, WebP up to 2MB each (max 5 total)
                      </p>
                    </div>
                  </div>
                  
                  {errors.images && (
                    <p className="mt-2 text-sm text-red-600">{errors.images}</p>
                  )}
                  
                  {/* New Image Previews */}
                  {newImagePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        New Images ({newImages.length}):
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {newImagePreviews.map((url, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                              <img
                                src={url}
                                alt={`New image ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            {!isSubmitting && (
                              <button
                                type="button"
                                onClick={() => handleRemoveNewImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={16} />
                              </button>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              New
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !hasChanges()}
                  className={`px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white transition-colors ${
                    isSubmitting || !hasChanges()
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating Product...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save size={18} className="mr-2" />
                      Save Changes
                      {!hasChanges() && <span className="ml-2 text-xs">(No changes)</span>}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;