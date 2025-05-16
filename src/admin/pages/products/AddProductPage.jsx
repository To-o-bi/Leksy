import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Image, Plus, X, AlertCircle } from 'lucide-react';

const AddProductPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    mainPrice: '',
    oldPrice: '',
    category: '',
    quantity: '',
    description: '',
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const categories = [
    { value: "Serum", label: "Serum" },
    { value: "Cleanser", label: "Face Cleansers" },
    { value: "Sunscreens", label: "Sunscreens" },
    { value: "Moisturizer", label: "Moisturizer" },
    { value: "Bathe", label: "Bathe and Body" }
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
    if (!formData.mainPrice) newErrors.mainPrice = "Main price is required";
    if (formData.mainPrice <= 0) newErrors.mainPrice = "Price must be greater than 0";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";
    
    // Validate old price is greater than main price if provided
    if (formData.oldPrice && Number(formData.oldPrice) <= Number(formData.mainPrice)) {
      newErrors.oldPrice = "Old price should be greater than main price";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would submit data to backend here
      // const formDataToSubmit = new FormData();
      // formData.images.forEach(file => formDataToSubmit.append("images", file));
      // Object.keys(formData).forEach(key => {
      //   if (key !== "images") formDataToSubmit.append(key, formData[key]);
      // });
      // await api.post('/products', formDataToSubmit);
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate back to product stock page with success notification
      navigate('/product-stock', { 
        state: { 
          notification: {
            type: 'success',
            message: `Product "${formData.name}" has been added successfully.`
          }
        }
      });
    } catch (error) {
      console.error('Error adding product:', error);
      // Handle errors here
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
      alert('Maximum 5 images allowed');
      return;
    }
    
    // Create preview URLs for the images
    const newPreviewImages = [...previewImages];
    const newImages = [...formData.images];
    
    Array.from(files).forEach(file => {
      // Only accept image files
      if (!file.type.startsWith('image/')) {
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

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button navigation */}
        <div className="mb-6">
          <button 
             onClick={() => navigate('/admin/products/stock')}
            className="flex items-center text-gray-600 hover:text-pink-500 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="ml-1">Back to Product Stock</span>
          </button>
        </div>
        
        <h1 className="text-2xl font-medium mb-6 md:mb-8">Add New Product</h1>
        
        <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row">
              {/* Image Upload Section */}
              <div className="w-full md:w-1/3 md:mr-8 mb-6 md:mb-0">
                <div
                  className={`${
                    isDragging ? 'border-pink-500 bg-pink-50' : 'border-gray-300 bg-gray-100'
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
                      >
                        Add Image
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img 
                        src={previewImages[0].url} 
                        alt="Product preview" 
                        className="h-full w-full object-contain rounded-lg" 
                      />
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
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, index) => {
                    const imageIndex = index + 1;
                    const hasImage = previewImages.length > imageIndex;
                    
                    return (
                      <div 
                        key={index}
                        className={`h-20 w-full bg-gray-100 rounded-md relative ${hasImage ? '' : 'flex items-center justify-center border border-gray-300 cursor-pointer'}`}
                        onClick={() => !hasImage && fileInputRef.current?.click()}
                      >
                        {hasImage ? (
                          <>
                            <img 
                              src={previewImages[imageIndex].url} 
                              alt={`Product thumbnail ${imageIndex}`} 
                              className="h-full w-full object-cover rounded-md" 
                            />
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
                    className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500`}
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
                    <label className="block text-gray-700 mb-2">Main Price*</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <span className="text-gray-700 font-bold">₦</span>
                      </div>
                      <input
                        type="number"
                        name="mainPrice"
                        value={formData.mainPrice}
                        onChange={handleInputChange}
                        className={`w-full border ${errors.mainPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500`}
                      />
                    </div>
                    {errors.mainPrice && (
                      <p className="mt-1 text-red-500 text-sm flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.mainPrice}
                      </p>
                    )}
                  </div>
                  
                  <div className="w-full sm:w-1/2">
                    <label className="block text-gray-700 mb-2">Old Price (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <span className="text-gray-700 font-bold">₦</span>
                      </div>
                      <input
                        type="number"
                        name="oldPrice"
                        value={formData.oldPrice}
                        onChange={handleInputChange}
                        className={`w-full border ${errors.oldPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500`}
                      />
                    </div>
                    {errors.oldPrice && (
                      <p className="mt-1 text-red-500 text-sm flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.oldPrice}
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
                    min="1"
                    className={`w-full border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-red-500 text-sm flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.quantity}
                    </p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Product Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Write detailed information about your product..."
                  ></textarea>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full ${isSubmitting ? 'bg-pink-400' : 'bg-pink-500 hover:bg-pink-600'} text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : "Add Product"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;