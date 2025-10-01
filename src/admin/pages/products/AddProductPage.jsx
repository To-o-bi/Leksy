import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Image, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { productService } from '../../../api/services';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const AddProductPage = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', 
        price: '', 
        category: '', 
        quantity: '',
        description: '', 
        concern_options: [], 
        images: []
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    const categories = [
        { value: "serum", label: "Serums" },
        { value: "cleanser", label: "Cleansers" },
        { value: "toner", label: "Toners" },
        { value: "mask", label: "Masks" },
        { value: "sunscreen", label: "Sunscreens" },
        { value: "moisturizer", label: "Moisturizers" },
        { value: "body-and-bath", label: "Body and Bath" },
        { value: "eye-cream", label: "Eye Creams" },
        { value: "perfume", label: "Perfumes" },
        { value: "beauty", label: "Beauty" }
    ];

    const concernOptions = [
        { value: "anti_aging", label: "Anti-Aging" },
        { value: "oily_skin", label: "Oily Skin" },
        { value: "dry_skin", label: "Dry Skin" },
        { value: "acne", label: "Acne" },
        { value: "hyperpigmentation", label: "Hyperpigmentation" },
        { value: "sensitive_skin", label: "Sensitive Skin" }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const handleConcernToggle = (concernValue) => {
        const updatedConcerns = formData.concern_options.includes(concernValue)
            ? formData.concern_options.filter(c => c !== concernValue)
            : [...formData.concern_options, concernValue];
        setFormData({ ...formData, concern_options: updatedConcerns });
        if (errors.concern_options) setErrors({ ...errors, concern_options: null });
    };

    const validateForm = () => {
        const newErrors = {};
        const { name, price, category, quantity, description, images } = formData;

        if (!name.trim()) newErrors.name = "Product name is required";
        if (!price || price <= 0) newErrors.price = "Price must be greater than 0";
        if (!category) newErrors.category = "Category is required";
        if (quantity === '' || quantity < 0) newErrors.quantity = "Quantity must be 0 or greater";
        if (!description.trim()) newErrors.description = "Description is required";
        if (images.length === 0) newErrors.images = "At least one product image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setNotification({ type: 'error', message: 'Please correct the errors and try again.' });
            return;
        }
        
        setIsSubmitting(true);
        setNotification(null);
        
        try {
            const productData = {
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                description: formData.description.trim(),
                quantity: parseInt(formData.quantity, 10),
                category: formData.category,
                concern_options: formData.concern_options,
                images: formData.images
            };

            const result = await productService.addProduct(productData);

            if (result && result.code === 200) {
                setNotification({ type: 'success', message: `Product "${formData.name}" added successfully!` });
                setTimeout(() => navigate('/admin/products/stock'), 2000);
            } else {
                throw new Error(result?.message || `API returned code: ${result?.code || 'unknown'}`);
            }
        } catch (error) {
            let errorMessage = error.message || 'Failed to add product. Please try again.';
            
            if (error.response) {
                const status = error.response.status;
                const responseData = error.response.data;
                
                switch (status) {
                    case 400:
                        errorMessage = `Bad Request: ${responseData?.message || 'Invalid data sent to server'}`;
                        break;
                    case 401:
                        errorMessage = 'Authentication required. Please log in again.';
                        break;
                    case 403:
                        errorMessage = 'You do not have permission to add products.';
                        break;
                    case 413:
                        errorMessage = 'File too large. Please use smaller images.';
                        break;
                    case 422:
                        errorMessage = `Validation Error: ${responseData?.message || 'Server validation failed'}`;
                        break;
                    case 500:
                        errorMessage = 'Internal server error. Please try again later.';
                        break;
                    default:
                        errorMessage = `Server Error (${status}): ${responseData?.message || error.message}`;
                }
            } else if (error.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Request timed out. Please try again.';
            } else if (error.message.includes('Authentication')) {
                errorMessage = 'Please log in again to continue.';
            }
            
            setNotification({ type: 'error', message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelection = (files) => {
        if (previewImages.length + files.length > 5) {
            setNotification({ type: 'error', message: 'Maximum 5 images allowed' });
            return;
        }
        
        const newPreviewImages = [...previewImages];
        const newImages = [...formData.images];

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                setNotification({ type: 'error', message: `${file.name} is not a valid image file` });
                return;
            }
            
            if (file.size > 2 * 1024 * 1024) {
                setNotification({ type: 'error', message: `${file.name} is too large (max 2MB)` });
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviewImages.push({ url: e.target.result, file: file });
                setPreviewImages([...newPreviewImages]);
            };
            reader.readAsDataURL(file);
            newImages.push(file);
        });

        setFormData({ ...formData, images: newImages });
        if (errors.images && newImages.length > 0) setErrors({ ...errors, images: null });
    };

    const handleImageUpload = (e) => handleFileSelection(e.target.files);

    const removeImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) handleFileSelection(e.dataTransfer.files);
    };

    const handleBack = () => {
        const hasChanges = Object.values(formData).some(value =>
            typeof value === 'string' ? value.trim() !== '' :
                Array.isArray(value) ? value.length > 0 : false
        );
        if (hasChanges) setIsLeaveModalOpen(true);
        else navigate('/admin/products/stock');
    };

    const handleConfirmLeave = () => {
        setIsLeaveModalOpen(false);
        navigate('/admin/products/stock');
    };

    const handleCloseModal = () => setIsLeaveModalOpen(false);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    return (
        <div className="min-h-screen bg-gray-50">
            {notification && (
                <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 w-11/12 max-w-md ${
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
                            <span className="text-sm">{notification.message}</span>
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <button
                                onClick={handleBack}
                                className="flex items-center text-gray-600 hover:text-pink-500 transition-colors mr-4"
                                disabled={isSubmitting}
                            >
                                <ChevronLeft size={20} />
                                <span className="ml-1 hidden sm:inline">Back</span>
                            </button>
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Add New Product</h1>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row lg:gap-8">
                            <div className="w-full lg:w-1/3 mb-8 lg:mb-0">
                                <div
                                    className={`${
                                        isDragging
                                            ? 'border-pink-500 bg-pink-50'
                                            : errors.images
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-300 bg-gray-100'
                                    } border-2 border-dashed min-h-64 rounded-lg flex items-center justify-center mb-4 transition-all cursor-pointer`}
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
                                            <p className="text-gray-500 mb-2">Drag & drop or click</p>
                                            <p className="text-xs text-gray-400 mt-2">Max 5 images, 2MB each</p>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-64 p-2">
                                            <img
                                                src={previewImages[0].url}
                                                alt="Product preview"
                                                className="h-full w-full object-contain rounded-lg"
                                            />
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
                                    {[...Array(4)].map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-20 w-full bg-gray-100 rounded-md relative ${
                                                previewImages[index + 1]
                                                    ? ''
                                                    : 'flex items-center justify-center border border-gray-300 cursor-pointer'
                                            }`}
                                            onClick={() => !previewImages[index + 1] && !isSubmitting && fileInputRef.current?.click()}
                                        >
                                            {previewImages[index + 1] ? (
                                                <>
                                                    <img
                                                        src={previewImages[index + 1].url}
                                                        alt={`Thumb ${index + 1}`}
                                                        className="h-full w-full object-cover rounded-md"
                                                    />
                                                    {!isSubmitting && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeImage(index + 1);
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
                                    ))}
                                </div>
                            </div>

                            <div className="w-full lg:w-2/3">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name*</label>
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Price*</label>
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Category*</label>
                                            <div className="relative">
                                                <select 
                                                    name="category" 
                                                    value={formData.category} 
                                                    onChange={handleInputChange} 
                                                    disabled={isSubmitting} 
                                                    className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Available Quantity*</label>
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
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Skin Concerns (Optional)</label>
                                        <p className="text-xs text-gray-500 mb-3">Select applicable skin concerns. Leave empty for products like perfumes or items without specific skin concerns.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {concernOptions.map(concern => (
                                                <label 
                                                    key={concern.value} 
                                                    className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                                                        formData.concern_options.includes(concern.value) 
                                                            ? 'bg-pink-50 border-pink-300' 
                                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={formData.concern_options.includes(concern.value)} 
                                                        onChange={() => handleConcernToggle(concern.value)} 
                                                        disabled={isSubmitting} 
                                                        className="sr-only" 
                                                    />
                                                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center flex-shrink-0 ${
                                                        formData.concern_options.includes(concern.value) 
                                                            ? 'bg-pink-500 border-pink-500' 
                                                            : 'border-gray-300'
                                                    }`}>
                                                        {formData.concern_options.includes(concern.value) && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm font-medium ${
                                                        formData.concern_options.includes(concern.value) 
                                                            ? 'text-pink-700' 
                                                            : 'text-gray-700'
                                                    }`}>
                                                        {concern.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Description*</label>
                                        <textarea 
                                            name="description" 
                                            value={formData.description} 
                                            onChange={handleInputChange} 
                                            disabled={isSubmitting} 
                                            rows="5" 
                                            className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-vertical`} 
                                            placeholder="Write detailed information..." 
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-red-500 text-sm flex items-center">
                                                <AlertCircle size={16} className="mr-1" />
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t">
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting} 
                                            className={`w-full ${
                                                isSubmitting 
                                                    ? 'bg-pink-400 cursor-not-allowed' 
                                                    : 'bg-pink-500 hover:bg-pink-600'
                                            } text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Adding Product...
                                                </>
                                            ) : (
                                                "Add Product"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isLeaveModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmLeave}
                title="Unsaved Changes"
                message="Are you sure you want to leave? The product information you've entered will not be saved."
                confirmText="Leave Page"
                cancelText="Stay"
            />
        </div>
    );
};

export default AddProductPage;