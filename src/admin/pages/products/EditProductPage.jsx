// EditProductPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { productService } from '../../../api';

// Constants
const PRODUCT_CATEGORIES = [
  'serums', 'moisturizers', 'bathe and body', 
  'sunscreens', 'toners', 'face cleansers'
];

const IMAGE_CONFIG = {
  maxSize: 2 * 1024 * 1024, // 2MB
  validTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxCount: 5
};

const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

// Utility functions
const formatCategoryName = (category) => 
  category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const parseApiResponse = (response) => {
  if (typeof response === 'string' && response.includes('<br />')) {
    try {
      const jsonMatch = response.match(/\{.*\}$/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      
      if (response.includes('"code":200') && response.includes('updated successfully')) {
        return { code: 200, message: 'Product updated successfully!' };
      }
    } catch (parseError) {
      console.warn('Could not parse response JSON:', parseError);
    }
  }
  return response;
};

// Move FormField component outside to prevent unnecessary re-renders
const FormField = React.memo(({ 
  label, 
  name, 
  type = 'text', 
  required = false, 
  placeholder, 
  currency = false,
  rows,
  options,
  className = '',
  value,
  error,
  onChange,
  disabled,
  ...props 
}) => {
  const baseClasses = `w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
    error ? 'border-red-300' : 'border-gray-300'
  }`;
  
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={baseClasses}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options?.map((option) => (
            <option key={option} value={option}>
              {formatCategoryName(option)}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={rows || 4}
          className={baseClasses}
          placeholder={placeholder}
          {...props}
        />
      ) : (
        <div className={currency ? 'relative' : ''}>
          {currency && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">₦</span>
            </div>
          )}
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${baseClasses} ${currency ? 'pl-8' : ''}`}
            placeholder={placeholder}
            {...props}
          />
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [productNotFound, setProductNotFound] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    slashed_price: '',
    description: '',
    quantity: '', // Using quantity as the field name
    category: '',
  });
  
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  
  // Memoized functions
  const hasChanges = useCallback(() => {
    if (!originalData) return false;
    
    return (
      formData.name !== originalData.name ||
      parseFloat(formData.price) !== originalData.price ||
      parseFloat(formData.slashed_price || 0) !== (originalData.slashed_price || 0) ||
      formData.description !== originalData.description ||
      parseInt(formData.quantity, 10) !== originalData.available_qty || // Compare with available_qty
      formData.category !== originalData.category ||
      newImages.length > 0 ||
      existingImages.length !== (originalData.images?.length || 0)
    );
  }, [formData, originalData, newImages, existingImages]);

  const handleError = useCallback((error, defaultMessage) => {
    console.error('Error:', error);
    
    if (error.message?.includes('Authentication')) {
      setSubmitError('Please log in again to continue.');
      setTimeout(() => navigate('/admin/login'), 2000);
    } else if (error.message?.includes('not found') || error.status === 404) {
      setProductNotFound(true);
    } else {
      setSubmitError(error.message || defaultMessage);
    }
  }, [navigate]);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) {
        setProductNotFound(true);
        setLoading(false);
        return;
      }
      
      try {
        const response = await productService.fetchProduct(id);
        
        if (!response || response.code !== 200 || !response.product) {
          setProductNotFound(true);
          setLoading(false);
          return;
        }
        
        const productData = response.product;
        setOriginalData(productData);
        setFormData({
          name: productData.name || '',
          price: productData.price?.toString() || '',
          slashed_price: productData.slashed_price?.toString() || '',
          category: productData.category || '',
          quantity: productData.available_qty?.toString() || '', // Map to quantity field
          description: productData.description || '',
        });
        setExistingImages(Array.isArray(productData.images) ? productData.images : []);
        setLoading(false);
        
      } catch (error) {
        handleError(error, 'Failed to load product data. Please try again.');
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, handleError]);
  
  // Event handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (submitError) {
      setSubmitError('');
    }
  }, [errors, submitError]);

  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    
    if (existingImages.length + newImages.length + files.length > IMAGE_CONFIG.maxCount) {
      setErrors(prev => ({ 
        ...prev, 
        images: `Maximum ${IMAGE_CONFIG.maxCount} images allowed per product` 
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
        invalidFiles.push({ name: file.name, reason: validation.error });
      }
    });
    
    if (invalidFiles.length > 0) {
      const errorMessage = invalidFiles.map(f => `${f.name}: ${f.reason}`).join(', ');
      setErrors(prev => ({ ...prev, images: errorMessage }));
    }
    
    if (validFiles.length > 0) {
      setNewImages(prev => [...prev, ...validFiles]);
      
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: '' }));
      }
      
      if (submitError) {
        setSubmitError('');
      }
      
      // Create previews
      const newPreviews = [];
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === validFiles.length) {
            setNewImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [existingImages.length, newImages.length, errors, submitError]);

  const handleRemoveImage = useCallback((index, type) => {
    if (type === 'new') {
      setNewImages(prev => prev.filter((_, i) => i !== index));
      setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    const validations = {
      name: {
        required: true,
        minLength: 2,
        message: 'Product name is required and must be at least 2 characters'
      },
      price: {
        required: true,
        type: 'number',
        min: 0.01,
        message: 'Please enter a valid price greater than 0'
      },
      description: {
        required: true,
        minLength: 10,
        message: 'Description is required and must be at least 10 characters'
      },
      quantity: { // Keep as quantity for validation
        required: true,
        type: 'integer',
        min: 0,
        message: 'Please enter a valid quantity (0 or greater)'
      },
      category: {
        required: true,
        enum: PRODUCT_CATEGORIES,
        message: 'Please select a valid category'
      }
    };
    
    Object.entries(validations).forEach(([field, rules]) => {
      const value = formData[field]?.trim();
      
      if (rules.required && !value) {
        newErrors[field] = rules.message;
        return;
      }
      
      if (value) {
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[field] = rules.message;
        } else if (rules.type === 'number' && (isNaN(value) || parseFloat(value) < (rules.min || 0))) {
          newErrors[field] = rules.message;
        } else if (rules.type === 'integer' && (isNaN(value) || parseInt(value, 10) < (rules.min || 0))) {
          newErrors[field] = rules.message;
        } else if (rules.enum && !rules.enum.includes(value)) {
          newErrors[field] = rules.message;
        }
      }
    });
    
    // Slashed price validation
    if (formData.slashed_price) {
      const slashedPrice = parseFloat(formData.slashed_price);
      if (isNaN(slashedPrice) || slashedPrice <= 0) {
        newErrors.slashed_price = 'Please enter a valid original price';
      } else if (formData.price && slashedPrice <= parseFloat(formData.price)) {
        newErrors.slashed_price = 'Original price must be greater than current price';
      }
    }
    
    // Image validation
    if (existingImages.length === 0 && newImages.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, existingImages.length, newImages.length]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitError('Please correct the errors above and try again.');
      return;
    }
    
    if (!hasChanges()) {
      setSubmitError('No changes detected. Please make some changes before saving.');
      return;
    }
    
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);
    
    try {
      const productData = {};
      
      // Add only changed fields
      if (formData.name !== originalData.name) productData.name = formData.name.trim();
      if (parseFloat(formData.price) !== originalData.price) productData.price = parseFloat(formData.price);
      if (formData.description !== originalData.description) productData.description = formData.description.trim();
      
      // CORRECTED: Use 'quantity' for API parameter
      if (parseInt(formData.quantity, 10) !== originalData.available_qty) {
        productData.quantity = parseInt(formData.quantity, 10);
      }
      
      if (formData.category !== originalData.category) productData.category = formData.category;
      
      const newSlashedPrice = formData.slashed_price ? parseFloat(formData.slashed_price) : null;
      const originalSlashedPrice = originalData.slashed_price || null;
      if (newSlashedPrice !== originalSlashedPrice) {
        productData.slashed_price = newSlashedPrice;
      }
      
      if (newImages.length > 0) productData.images = newImages;
      
      // DEBUG: Log the payload being sent
      console.log('Updating product with data:', productData);
      
      const response = await productService.updateProduct(id, productData);
      const parsedResponse = parseApiResponse(response);
      
      if (parsedResponse && (parsedResponse.code === 200 || parsedResponse.code === '200')) {
        setSubmitSuccess(true);
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
        throw new Error(parsedResponse?.message || 'Failed to update product');
      }
      
    } catch (error) {
      handleError(error, 'An error occurred while updating the product.');
    } finally {
      setSubmitting(false);
    }
  }, [validateForm, hasChanges, formData, originalData, newImages, id, navigate, handleError]);

  const handleGoBack = useCallback(() => {
    if (hasChanges() && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/admin/products');
  }, [hasChanges, navigate]);

  // Render components
  const LoadingSpinner = () => (
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
  
  const NotFoundPage = () => (
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
  
  const StatusMessage = ({ type, message, submessage }) => (
    <div className={`mb-6 p-4 border rounded-md ${
      type === 'success' 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center">
        {type === 'success' ? (
          <CheckCircle size={20} className="mr-3 text-green-500 flex-shrink-0" />
        ) : (
          <AlertCircle size={20} className="mr-3 text-red-500 flex-shrink-0" />
        )}
        <div>
          <p className={`${type === 'success' ? 'text-green-800' : 'text-red-800'} font-medium`}>
            {message}
          </p>
          {submessage && (
            <p className={`${type === 'success' ? 'text-green-700' : 'text-red-700'} text-sm mt-1`}>
              {submessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
  
  const ImageGrid = React.memo(({ images, type, onRemove, submitting }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <div key={`${type}-${index}`} className="relative group">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={image}
              alt={`${type === 'new' ? 'New' : 'Product'} image ${index + 1}`}
              className="h-full w-full object-cover"
              onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
            />
          </div>
          {!submitting && (
            <button
              type="button"
              onClick={() => onRemove(index, type)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          )}
          {type === 'new' && (
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              New
            </div>
          )}
        </div>
      ))}
    </div>
  ));

  // Main render
  if (loading) return <LoadingSpinner />;
  if (productNotFound) return <NotFoundPage />;
  
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <button
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-gray-800 mr-4 transition-colors"
                disabled={submitting}
              >
                <ChevronLeft size={20} />
                <span className="ml-1">Back</span>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
            </div>
          </div>
          
          <div className="px-6 py-6">
            {/* Status Messages */}
            {submitSuccess && (
              <StatusMessage 
                type="success" 
                message="Product updated successfully!" 
                submessage="Redirecting to products list..."
              />
            )}
            
            {submitError && (
              <StatusMessage type="error" message={submitError} />
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  key="name"
                  label="Product Name"
                  name="name"
                  required
                  placeholder="Enter product name"
                  value={formData.name}
                  error={errors.name}
                  onChange={handleChange}
                  disabled={submitting}
                />
                
                <FormField
                  key="category"
                  label="Category"
                  name="category"
                  type="select"
                  required
                  placeholder="Select Category"
                  options={PRODUCT_CATEGORIES}
                  value={formData.category}
                  error={errors.category}
                  onChange={handleChange}
                  disabled={submitting}
                />
                
                <FormField
                  key="price"
                  label="Price"
                  name="price"
                  type="number"
                  required
                  currency
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  error={errors.price}
                  onChange={handleChange}
                  disabled={submitting}
                />
                
                <FormField
                  key="slashed_price"
                  label="Original Price (Optional)"
                  name="slashed_price"
                  type="number"
                  currency
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.slashed_price}
                  error={errors.slashed_price}
                  onChange={handleChange}
                  disabled={submitting}
                />
                
                <FormField
                  key="quantity" // Using quantity as field name
                  label="Quantity"
                  name="quantity" // Using quantity as field name
                  type="number"
                  required
                  placeholder="Enter available quantity"
                  min="0"
                  className="md:col-span-2"
                  value={formData.quantity}
                  error={errors.quantity}
                  onChange={handleChange}
                  disabled={submitting}
                />
                
                <FormField
                  key="description"
                  label="Description"
                  name="description"
                  type="textarea"
                  required
                  placeholder="Enter product description"
                  className="md:col-span-2"
                  value={formData.description}
                  error={errors.description}
                  onChange={handleChange}
                  disabled={submitting}
                />
                
                {/* Images Section */}
                {existingImages.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Images ({existingImages.length})
                    </label>
                    <ImageGrid 
                      images={existingImages} 
                      type="existing" 
                      onRemove={handleRemoveImage}
                      submitting={submitting}
                    />
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {existingImages.length > 0 ? 'Add More Images' : 'Product Images'}{' '}
                    {existingImages.length === 0 && <span className="text-red-500">*</span>}
                  </label>
                  
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <label htmlFor="images" className="cursor-pointer text-blue-600 hover:text-blue-500 font-medium">
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
                          disabled={submitting}
                        />
                      </label>
                      <p className="text-gray-500">or drag and drop</p>
                      <p className="text-sm text-gray-400">
                        PNG, JPG, WebP up to 2MB each (max {IMAGE_CONFIG.maxCount} total)
                      </p>
                    </div>
                  </div>
                  
                  {errors.images && (
                    <p className="mt-2 text-sm text-red-600">{errors.images}</p>
                  )}
                  
                  {newImagePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        New Images ({newImages.length}):
                      </p>
                      <ImageGrid 
                        images={newImagePreviews} 
                        type="new" 
                        onRemove={handleRemoveImage}
                        submitting={submitting}
                      />
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
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !hasChanges()}
                  className={`px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white transition-colors ${
                    submitting || !hasChanges()
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {submitting ? (
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

export default EditProductPage
