import React, { useState, useRef } from 'react';
import { ChevronLeft, Image, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { productService } from '../../../api/services';

const AddProductPage = () => {
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    slashed_price: '',
    category: '',
    quantity: '',
    description: '',
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState(null);

  // Categories from your API config
  const categories = [
    { value: "serums", label: "Serums" },
    { value: "face cleansers", label: "Face Cleansers" },
    { value: "sunscreens", label: "Sunscreens" },
    { value: "moisturizers", label: "Moisturizers" },
    { value: "bathe and body", label: "Bathe and Body" },
    { value: "toners", label: "Toners" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    if (formData.quantity < 0) newErrors.quantity = "Quantity must be 0 or greater";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.images.length === 0) newErrors.images = "At least one product image is required";
    
    // Validate slashed price is greater than main price if provided
    if (formData.slashed_price && Number(formData.slashed_price) <= Number(formData.price)) {
      newErrors.slashed_price = "Original price should be greater than current price";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please correct the errors above and try again.'
      });
      return;
    }
    
    setIsSubmitting(true);
    setNotification(null);
    
    try {
      // Create FormData manually to ensure proper field names for your API
      const formDataToSend = new FormData();
      
      // Add basic product data
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('quantity', parseInt(formData.quantity, 10));
      formDataToSend.append('category', formData.category);
      
      // Add slashed price if provided
      if (formData.slashed_price) {
        formDataToSend.append('slashed_price', parseFloat(formData.slashed_price));
      }
      
      // IMPORTANT: Add images with proper field name (images[] as expected by API)
      formData.images.forEach((file) => {
        formDataToSend.append('images[]', file);
      });
      
      console.log('Submitting product with FormData...');
      console.log('Image files count:', formData.images.length);
      
      // Use direct API call instead of productService to ensure proper FormData handling
      const authToken = localStorage.getItem('authToken') || 
                       document.cookie.match(/auth=([^;]+)/)?.[1] ? 
                       atob(document.cookie.match(/auth=([^;]+)/)[1]) : null;
      
      const response = await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formDataToSend // Send FormData directly
      });
      
      const result = await response.json();
      
      console.log('Product added successfully:', result);
      
      if (result && result.code === 200) {
        setNotification({
          type: 'success',
          message: `Product "${formData.name}" has been added successfully!`
        });
        
        // Reset form and redirect after successful submission
        setTimeout(() => {
          // In real app, navigate to product stock page
          window.location.href = '/admin/products/stock';
          // Or if using React Router: navigate('/admin/products/stock');
        }, 2000);
      } else {
        throw new Error(result?.message || 'Failed to add product');
      }
      
    } catch (error) {
      console.error('Error adding product:', error);
      
      // Handle specific API errors
      if (error.message.includes('Validation failed')) {
        setNotification({
          type: 'error',
          message: error.message
        });
      } else if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        setNotification({
          type: 'error',
          message: 'Please log in again to continue.'
        });
      } else {
        setNotification({
          type: 'error',
          message: error.message || 'Failed to add product. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    handleFileSelection(files);
  };
  
  const handleFileSelection = (files) => {
    // Limit to maximum 5 images
    const totalImages = previewImages.length + files.length;
    if (totalImages > 5) {
      setNotification({
        type: 'error',
        message: 'Maximum 5 images allowed per product'
      });
      return;
    }
    
    // Create preview URLs for the images
    const newPreviewImages = [...previewImages];
    const newImages = [...formData.images];
    
    Array.from(files).forEach(file => {
      // Only accept image files
      if (!file.type.startsWith('image/')) {
        setNotification({
          type: 'error',
          message: 'Only image files are allowed'
        });
        return;
      }
      
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setNotification({
          type: 'error',
          message: `File ${file.name} is too large. Maximum size is 2MB`
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviewImages.push({
          url: e.target.result,
          file: file
        });
        setPreviewImages([...newPreviewImages]);
      };
      reader.readAsDataURL(file);
      
      newImages.push(file);
    });
    
    setFormData({
      ...formData,
      images: newImages
    });
    
    // Clear image error if we now have images
    if (errors.images && newImages.length > 0) {
      setErrors({
        ...errors,
        images: null
      });
    }
  };
  
  const removeImage = (index) => {
    const newPreviewImages = [...previewImages];
    const newImages = [...formData.images];
    
    newPreviewImages.splice(index, 1);
    newImages.splice(index, 1);
    
    setPreviewImages(newPreviewImages);
    setFormData({
      ...formData,
      images: newImages
    });
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleBack = () => {
    const hasChanges = Object.values(formData).some(value => 
      typeof value === 'string' ? value.trim() !== '' : value.length > 0
    );
    
    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    
    // In real app: navigate('/admin/products');
    console.log('Would navigate back to products list...');
  };

  // Auto-hide notification after 5 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 max-w-md ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle size={20} className="mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(null)} 
              className="ml-4 text-xl font-bold hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Back button navigation */}
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-pink-500 transition-colors"
            disabled={isSubmitting}
          >
            <ChevronLeft size={20} />
            <span className="ml-1">Back to Products</span>
          </button>
        </div>
        
        <h1 className="text-2xl font-medium mb-6 md:mb-8">Add New Product</h1>
        
        <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* Image Upload Section */}
            <div className="w-full md:w-1/3 md:mr-8 mb-6 md:mb-0">
              <div
                className={`${
                  isDragging ? 'border-pink-500 bg-pink-50' : errors.images ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-100'
                } border-2 border-dashed h-64 rounded-lg flex items-center justify-center mb-4 transition-all cursor-pointer`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {previewImages.length === 0 ? (
                  <div className="text-center p-4">
                    <div className="mx-auto bg-white p-4 rounded-full mb-2 inline-flex">
                      <Image size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">Drag and drop images here or click to browse</p>
                    <button 
                      type="button" 
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm"
                      disabled={isSubmitting}
                    >
                      Add Image
                    </button>
                    <p className="text-xs text-gray-400 mt-2">Max 5 images, 2MB each</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <img 
                      src={previewImages[0].url} 
                      alt="Product preview" 
                      className="h-full w-full object-contain rounded-lg" 
                    />
                    {!isSubmitting && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(0);
                        }}
                        className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-100"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                  disabled={isSubmitting}
                />
              </div>
              
              {errors.images && (
                <p className="mb-4 text-red-500 text-sm flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.images}
                </p>
              )}
              
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, index) => {
                  const imageIndex = index + 1;
                  const hasImage = previewImages.length > imageIndex;
                  
                  return (
                    <div 
                      key={index}
                      className={`h-20 w-full bg-gray-100 rounded-md relative ${hasImage ? '' : 'flex items-center justify-center border border-gray-300 cursor-pointer'}`}
                      onClick={() => !hasImage && !isSubmitting && fileInputRef.current?.click()}
                    >
                      {hasImage ? (
                        <>
                          <img 
                            src={previewImages[imageIndex].url} 
                            alt={`Product thumbnail ${imageIndex}`} 
                            className="h-full w-full object-cover rounded-md" 
                          />
                          {!isSubmitting && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(imageIndex);
                              }}
                              className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-100"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </>
                      ) : (
                        <Plus size={20} className="text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              {/* Product Details */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Product Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
                <div className="w-full sm:w-1/2">
                  <label className="block text-gray-700 mb-2">Current Price*</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="text-gray-700 font-bold">₦</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      min="0"
                      step="0.01"
                      className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-red-500 text-sm flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.price}
                    </p>
                  )}
                </div>
                
                <div className="w-full sm:w-1/2">
                  <label className="block text-gray-700 mb-2">Original Price (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="text-gray-700 font-bold">₦</span>
                    </div>
                    <input
                      type="number"
                      name="slashed_price"
                      value={formData.slashed_price}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      min="0"
                      step="0.01"
                      className={`w-full border ${errors.slashed_price ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.slashed_price && (
                    <p className="mt-1 text-red-500 text-sm flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.slashed_price}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Category*</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                {errors.category && (
                  <p className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Available Quantity*</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  min="0"
                  className={`w-full border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.quantity}
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Product Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  rows="5"
                  className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  placeholder="Write detailed information about your product..."
                />
                {errors.description && (
                  <p className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>
              
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full ${isSubmitting ? 'bg-pink-400 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'} text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Product...
                    </>
                  ) : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;