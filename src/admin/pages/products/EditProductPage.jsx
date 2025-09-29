import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { productService } from '../../../api';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

// --- Constants and Helpers ---
const PRODUCT_CATEGORIES = [ 'serum', 'cleanser', 'toner', 'mask', 'sunscreen', 'moisturizer', 'body-and-bath', 'eye-cream', 'beauty', 'perfume' ];
const CONCERN_OPTIONS = [ { value: "anti_aging", label: "Anti-Aging" }, { value: "oily_skin", label: "Oily Skin" }, { value: "dry_skin", label: "Dry Skin" }, { value: "acne", label: "Acne" }, { value: "hyperpigmentation", label: "Hyperpigmentation" }, { value: "sensitive_skin", label: "Sensitive Skin" } ];
const IMAGE_CONFIG = { maxSize: 2 * 1024 * 1024, validTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], maxCount: 5 };
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const formatCategoryName = (category) => category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const parseApiResponse = (response) => {
    console.log('🔍 Parsing API response:', response);
    console.log('🔍 Response type:', typeof response);
    
    if (typeof response === 'string' && response.includes('<br />')) {
        console.log('📝 Response contains HTML break tags, attempting to extract JSON...');
        try { 
            const jsonMatch = response.match(/\{.*\}$/); 
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log('✅ Successfully extracted JSON from HTML response:', parsed);
                return parsed;
            }
            if (response.includes('"code":200')) {
                console.log('✅ Found success indicator in HTML response');
                return { code: 200, message: 'Product updated successfully!' };
            }
        } catch (e) { 
            console.error('❌ Failed to parse JSON from HTML response:', e);
            return response; 
        }
    }
    
    console.log('📋 Returning original response (no parsing needed)');
    return response;
};

const validateImageFile = (file) => {
    if (!IMAGE_CONFIG.validTypes.includes(file.type)) return { valid: false, error: 'Invalid file type.' };
    if (file.size > IMAGE_CONFIG.maxSize) return { valid: false, error: `File is too large (max 2MB).` };
    return { valid: true };
};

// --- Reusable Components ---
const FormField = React.memo(({ label, name, type = 'text', required = false, placeholder, currency = false, rows, options, className = '', value, error, onChange, disabled, ...props }) => {
    const baseClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none transition-colors ${error ? 'border-red-500' : 'border-gray-300'}`;
    return (
        <div className={className}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === 'select' ? (
                <div className="relative">
                    <select id={name} name={name} value={value} onChange={onChange} disabled={disabled} className={`${baseClasses} appearance-none`} {...props}>
                        <option value="">{placeholder}</option>
                        {options?.map((option) => (
                            <option key={option} value={option}>{formatCategoryName(option)}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>
            ) : type === 'textarea' ? (
                <textarea 
                    id={name} 
                    name={name} 
                    value={value} 
                    onChange={onChange} 
                    disabled={disabled} 
                    rows={rows || 5} 
                    className={`${baseClasses} resize-vertical`} 
                    placeholder={placeholder} 
                    {...props} 
                />
            ) : (
                <div className={currency ? 'relative' : ''}>
                    {currency && (
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <span className="text-gray-700 font-bold">₦</span>
                        </div>
                    )}
                    <input 
                        type={type} 
                        id={name} 
                        name={name} 
                        value={value} 
                        onChange={onChange} 
                        disabled={disabled} 
                        className={`${baseClasses} ${currency ? 'pl-10' : ''}`} 
                        placeholder={placeholder} 
                        {...props} 
                    />
                </div>
            )}
            {error && (
                <p className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-1" />{error}
                </p>
            )}
        </div>
    );
});

const StatusMessage = ({ type, message, submessage }) => (
    <div className={`mb-6 p-4 border rounded-md ${type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center">
            {type === 'success' ? (
                <CheckCircle size={20} className="mr-3 text-green-500" />
            ) : (
                <AlertCircle size={20} className="mr-3 text-red-500" />
            )}
            <div>
                <p className={`${type === 'success' ? 'text-green-800' : 'text-red-800'} font-medium`}>{message}</p>
                {submessage && (
                    <p className={`${type === 'success' ? 'text-green-700' : 'text-red-700'} text-sm mt-1`}>{submessage}</p>
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
                        alt={`${type} image ${index + 1}`} 
                        className="h-full w-full object-cover" 
                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }} 
                    />
                </div>
                {!submitting && (
                    <button 
                        type="button" 
                        onClick={() => onRemove(index, type)} 
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 opacity-0 group-hover:opacity-100"
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

// --- Main Edit Product Page Component ---
const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [productNotFound, setProductNotFound] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    const [formData, setFormData] = useState({ 
        name: '', 
        price: '', 
        slashed_price: '', 
        description: '', 
        quantity: '', 
        category: '', 
        concern_options: [] 
    });
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);

    const decodeHtmlEntities = (text) => {
        if (typeof text !== 'string' || !text.includes('&')) {
            return text;
        }
        let currentText = text;
        let previousText = '';
        let i = 0;
        while (currentText !== previousText && i < 5) {
            previousText = currentText;
            try {
                if (typeof window !== 'undefined') {
                    const textarea = document.createElement('textarea');
                    textarea.innerHTML = previousText;
                    currentText = textarea.value;
                } else {
                    break;
                }
            } catch (e) {
                return text;
            }
            i++;
        }
        return currentText;
    };

    const hasChanges = useCallback(() => {
        if (!originalData) return false;
        const areArraysEqual = (a, b) => { 
            const arrA = a || [], arrB = b || []; 
            if (arrA.length !== arrB.length) return false; 
            return [...arrA].sort().join() === [...arrB].sort().join(); 
        };

        const changes = {
            name: formData.name !== originalData.name,
            price: parseFloat(formData.price) !== originalData.price,
            slashed_price: parseFloat(formData.slashed_price || 0) !== (originalData.slashed_price || 0),
            description: formData.description !== originalData.description,
            quantity: parseInt(formData.quantity, 10) !== originalData.available_qty,
            category: formData.category !== originalData.category,
            concern_options: !areArraysEqual(formData.concern_options, originalData.concern_options),
            images: newImages.length > 0 || removedImages.length > 0
        };

        console.log('🔍 Change detection:', changes);
        console.log('📊 Current vs Original concern_options:', {
            current: formData.concern_options,
            original: originalData.concern_options,
            changed: changes.concern_options
        });

        return Object.values(changes).some(Boolean);
    }, [formData, originalData, newImages, removedImages]);

    const handleError = useCallback((error, defaultMessage) => {
        console.error('❌ Error occurred:', error);
        if (error.message?.includes('Authentication')) { 
            setSubmitError('Please log in again to continue.'); 
            setTimeout(() => navigate('/admin/login'), 2000); 
        } else if (error.message?.includes('not found') || error.status === 404) { 
            setProductNotFound(true); 
        } else { 
            setSubmitError(error.message || defaultMessage); 
        } 
    }, [navigate]);

    useEffect(() => {
        const fetchProductData = async () => {
            console.log('🚀 Starting fetchProductData for ID:', id);
            
            if (!id) { 
                console.error('❌ No product ID provided');
                setProductNotFound(true); 
                setLoading(false); 
                return; 
            }
            
            try {
                console.log('📡 Calling productService.fetchProduct...');
                const response = await productService.fetchProduct(id);
                
                console.log('📥 Raw fetchProduct response in component:', response);
                console.log('📥 Response structure:', {
                    hasResponse: !!response,
                    code: response?.code,
                    hasProduct: !!response?.product,
                    productKeys: response?.product ? Object.keys(response.product) : 'N/A'
                });
                
                if (!response || response.code !== 200 || !response.product) { 
                    console.error('❌ Invalid response structure:', { response, code: response?.code, hasProduct: !!response?.product });
                    setProductNotFound(true); 
                    setLoading(false); 
                    return; 
                }
                
                const productData = response.product;
                console.log('📋 Raw product data:', productData);
                console.log('📋 Product concern_options (raw):', {
                    value: productData.concern_options,
                    type: typeof productData.concern_options,
                    isArray: Array.isArray(productData.concern_options),
                    length: productData.concern_options?.length,
                    stringified: JSON.stringify(productData.concern_options)
                });

                const decodedName = decodeHtmlEntities(productData.name || '');
                const decodedDescription = decodeHtmlEntities(productData.description || '');

                // ENHANCED CONCERN OPTIONS PROCESSING WITH DEBUG
                let fetchedConcerns = [];
                console.log('🔄 Processing concern_options...');
                
                if (typeof productData.concern_options === 'string') { 
                    console.log('📝 concern_options is string:', productData.concern_options);
                    
                    // Handle empty string case
                    if (productData.concern_options.trim() === '') {
                        console.log('✅ Empty string detected - setting to empty array');
                        fetchedConcerns = [];
                    } else {
                        try { 
                            const parsed = JSON.parse(productData.concern_options); 
                            if (Array.isArray(parsed)) {
                                fetchedConcerns = parsed;
                                console.log('✅ Parsed JSON array:', fetchedConcerns);
                            } else {
                                console.log('⚠️ Parsed JSON but not array:', parsed);
                                fetchedConcerns = [];
                            }
                        } catch (parseError) { 
                            console.log('⚠️ JSON parse failed, trying comma split:', parseError.message);
                            fetchedConcerns = productData.concern_options.split(',').map(c => c.trim()).filter(Boolean); 
                            console.log('✅ Comma split result:', fetchedConcerns);
                        } 
                    }
                } else if (Array.isArray(productData.concern_options)) { 
                    fetchedConcerns = productData.concern_options; 
                    console.log('✅ Already array:', fetchedConcerns);
                } else if (productData.concern_options === null || productData.concern_options === undefined) {
                    fetchedConcerns = [];
                    console.log('✅ Null/undefined detected - setting to empty array');
                } else {
                    console.log('⚠️ Unexpected concern_options type:', typeof productData.concern_options, productData.concern_options);
                    fetchedConcerns = [];
                }

                console.log('🎯 Final processed concerns:', fetchedConcerns);

                const fullOriginalData = { 
                    ...productData, 
                    name: decodedName,
                    description: decodedDescription,
                    concern_options: fetchedConcerns
                };
                
                console.log('💾 Setting originalData:', fullOriginalData);
                console.log('💾 originalData concern_options:', fullOriginalData.concern_options);
                
                setOriginalData(fullOriginalData);

                const newFormData = {
                    name: decodedName,
                    price: productData.price?.toString() || '',
                    slashed_price: productData.slashed_price?.toString() || '',
                    category: productData.category || '',
                    quantity: productData.available_qty?.toString() || '',
                    description: decodedDescription,
                    concern_options: fetchedConcerns
                };
                
                console.log('📝 Setting formData:', newFormData);
                console.log('📝 formData concern_options:', newFormData.concern_options);
                
                setFormData(newFormData);

                const productImages = Array.isArray(productData.images) ? productData.images : [];
                console.log('🖼️ Setting existing images:', productImages);
                setExistingImages(productImages);
                
                console.log('✅ Component initialization complete');
                
            } catch (error) { 
                console.error('❌ Error in fetchProductData:', error);
                handleError(error, 'Failed to load product data.'); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchProductData();
    }, [id, handleError]);

    const handleChange = useCallback((e) => { 
        const { name, value } = e.target; 
        console.log(`📝 Form field changed: ${name} = ${value}`);
        setFormData(prev => ({ ...prev, [name]: value })); 
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' })); 
        if (submitError) setSubmitError(''); 
    }, [errors, submitError]);

    const handleConcernToggle = useCallback((concernValue) => { 
        console.log('🎯 Toggling concern:', concernValue);
        console.log('🎯 Current concerns before toggle:', formData.concern_options);
        
        setFormData(prev => { 
            const currentConcerns = prev.concern_options || []; 
            const isCurrentlySelected = currentConcerns.includes(concernValue);
            const updatedConcerns = isCurrentlySelected 
                ? currentConcerns.filter(c => c !== concernValue) 
                : [...currentConcerns, concernValue]; 
                
            console.log('🎯 Updated concerns after toggle:', updatedConcerns);
            console.log('🎯 Toggle action:', isCurrentlySelected ? 'REMOVED' : 'ADDED');
            
            return { ...prev, concern_options: updatedConcerns }; 
        }); 
        
        if (errors.concern_options) setErrors(prev => ({ ...prev, concern_options: '' })); 
        if (submitError) setSubmitError(''); 
    }, [formData.concern_options, errors.concern_options, submitError]);

    const handleImageChange = useCallback((e) => {
        if (existingImages.length + newImages.length + e.target.files.length > IMAGE_CONFIG.maxCount) { 
            setErrors(prev => ({ ...prev, images: `Maximum ${IMAGE_CONFIG.maxCount} images allowed.` })); 
            return; 
        }
        const validFiles = [], invalidFiles = [];
        Array.from(e.target.files).forEach(file => { 
            const validation = validateImageFile(file); 
            if (validation.valid) validFiles.push(file); 
            else invalidFiles.push({ name: file.name, reason: validation.error }); 
        });
        if (invalidFiles.length > 0) setErrors(prev => ({ ...prev, images: invalidFiles.map(f => `${f.name}: ${f.reason}`).join(', ') }));
        if (validFiles.length > 0) { 
            setNewImages(prev => [...prev, ...validFiles]); 
            if (errors.images) setErrors(prev => ({ ...prev, images: '' })); 
            if (submitError) setSubmitError('');
            const newPreviews = [];
            validFiles.forEach(file => { 
                const reader = new FileReader(); 
                reader.onloadend = () => { 
                    newPreviews.push(reader.result); 
                    if (newPreviews.length === validFiles.length) setNewImagePreviews(prev => [...prev, ...newPreviews]); 
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
            setRemovedImages(prev => [...prev, existingImages[index]]); 
            setExistingImages(prev => prev.filter((_, i) => i !== index)); 
        } 
    }, [existingImages]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        const { name, price, slashed_price, description, quantity, category } = formData;
        
        if (!name.trim() || name.trim().length < 2) newErrors.name = 'Product name is required (min 2 chars)';
        if (!price || isNaN(price) || parseFloat(price) <= 0) newErrors.price = 'Please enter a valid price';
        if (!description.trim() || description.trim().length < 10) newErrors.description = 'Description is required (min 10 chars)';
        if (quantity === '' || isNaN(quantity) || parseInt(quantity, 10) < 0) newErrors.quantity = 'Please enter a valid quantity';
        if (!category) newErrors.category = 'Please select a category';
        
        // Skin concerns are optional
        
        // Only validate slashed price if it has a value
        if (slashed_price && slashed_price.toString().trim() !== '') {
            const slashedPriceNum = parseFloat(slashed_price);
            const currentPriceNum = parseFloat(price);
            
            if (isNaN(slashedPriceNum) || slashedPriceNum <= 0) {
                newErrors.slashed_price = 'Please enter a valid slashed price';
            } else if (slashedPriceNum <= currentPriceNum) {
                newErrors.slashed_price = 'Slashed price should be greater than current price';
            }
        }
        
        const totalImages = existingImages.length + newImages.length;
        if (totalImages === 0) newErrors.images = 'At least one product image is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, existingImages.length, newImages.length]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        console.log('🚀 Form submission started');
        console.log('📋 Current formData:', formData);
        console.log('📋 Original data:', originalData);
        console.log('🎯 Current concern_options:', formData.concern_options);
        console.log('🎯 Original concern_options:', originalData?.concern_options);
        
        if (!validateForm()) { 
            console.error('❌ Form validation failed');
            setSubmitError('Please correct the errors and try again.'); 
            return; 
        }
        
        if (!hasChanges()) { 
            console.warn('⚠️ No changes detected');
            setSubmitError('No changes detected.'); 
            return; 
        }
        
        setSubmitting(true); 
        setSubmitError(''); 
        setSubmitSuccess(false);

        try {
            const productData = {}; 
            const areArraysEqual = (a, b) => (a || []).sort().join() === (b || []).sort().join();

            console.log('🔍 Analyzing changes...');

            if (formData.name !== originalData.name) {
                productData.name = formData.name.trim();
                console.log('📝 Name changed:', originalData.name, '->', productData.name);
            }
            if (parseFloat(formData.price) !== originalData.price) {
                productData.price = parseFloat(formData.price);
                console.log('💰 Price changed:', originalData.price, '->', productData.price);
            }
            if (formData.description !== originalData.description) {
                productData.description = formData.description.trim();
                console.log('📄 Description changed');
            }
            if (parseInt(formData.quantity, 10) !== originalData.available_qty) {
                productData.available_qty = parseInt(formData.quantity, 10);
                console.log('📦 Quantity changed:', originalData.available_qty, '->', productData.available_qty);
            }
            if (formData.category !== originalData.category) {
                productData.category = formData.category;
                console.log('🏷️ Category changed:', originalData.category, '->', productData.category);
            }

            // CRITICAL: Enhanced concern options change detection
            const concernsChanged = !areArraysEqual(formData.concern_options, originalData.concern_options);
            console.log('🎯 Concern options analysis:', {
                current: formData.concern_options,
                original: originalData.concern_options,
                currentSorted: (formData.concern_options || []).sort().join(),
                originalSorted: (originalData.concern_options || []).sort().join(),
                changed: concernsChanged
            });
            
            if (concernsChanged) {
                productData.concern_options = formData.concern_options;
                console.log('🎯 Concern options changed!');
                console.log('🎯 From:', originalData.concern_options);
                console.log('🎯 To:', formData.concern_options);
                console.log('🎯 Will send to backend:', productData.concern_options);
            } else {
                console.log('🎯 No concern options changes detected');
            }

            const newSlashed = formData.slashed_price ? parseFloat(formData.slashed_price) : null;
            if (newSlashed !== (originalData.slashed_price || null)) {
                productData.slashed_price = newSlashed;
                console.log('💸 Slashed price changed:', originalData.slashed_price, '->', productData.slashed_price);
            }

            if (newImages.length > 0) {
                productData.images = newImages;
                console.log('🖼️ New images added:', newImages.length);
            }
            if (removedImages.length > 0) {
                productData.removed_images = removedImages;
                console.log('🗑️ Images removed:', removedImages.length);
            }

            console.log('📤 Final productData being sent to API:', productData);

            const response = await productService.updateProduct(id, productData); 
            
            console.log('📥 Update response received:', response);
            
            const parsed = parseApiResponse(response);
            console.log('📋 Parsed response:', parsed);
            
            if (parsed && (parsed.code === 200 || parsed.code === '200')) { 
                console.log('✅ Update successful!');
                setSubmitSuccess(true); 
                
                // IMPORTANT: After successful update, re-fetch the product to verify the changes
                console.log('🔄 Re-fetching product to verify update...');
                try {
                    const verificationResponse = await productService.fetchProduct(id);
                    console.log('✅ Verification fetch response:', verificationResponse);
                    if (verificationResponse?.product?.concern_options !== undefined) {
                        console.log('🔍 Backend returned concern_options after update:', {
                            value: verificationResponse.product.concern_options,
                            type: typeof verificationResponse.product.concern_options,
                            expected: formData.concern_options,
                            matches: JSON.stringify(verificationResponse.product.concern_options) === JSON.stringify(formData.concern_options)
                        });
                    }
                } catch (verificationError) {
                    console.error('⚠️ Failed to verify update:', verificationError);
                }
                
                setTimeout(() => navigate('/admin/products/stock', { 
                    state: { 
                        notification: { 
                            type: 'success', 
                            message: `Product "${formData.name}" updated.` 
                        } 
                    } 
                }), 2000); 
            } else { 
                throw new Error(parsed?.message || 'Failed to update product'); 
            }
        } catch (error) { 
            console.error('❌ Submit error:', error);
            handleError(error, 'An error occurred while updating.'); 
        } finally { 
            setSubmitting(false); 
        }
    }, [validateForm, hasChanges, formData, originalData, newImages, removedImages, id, navigate, handleError]);

    const handleGoBack = useCallback(() => { 
        if (hasChanges()) setIsLeaveModalOpen(true); 
        else navigate('/admin/products/stock'); 
    }, [hasChanges, navigate]);
    
    const handleConfirmLeave = () => { 
        setIsLeaveModalOpen(false); 
        navigate('/admin/products/stock'); 
    };
    
    const handleCloseModal = () => setIsLeaveModalOpen(false);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
        </div>
    );
    
    if (productNotFound) return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">Product Not Found</h1>
            <p className="text-red-800 bg-red-50 p-3 rounded-md">The product you are looking for does not exist.</p>
            <button 
                onClick={() => navigate('/admin/products/stock')} 
                className="mt-6 px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md"
            >
                Return to Products
            </button>
        </div>
    );

    return (
        <>
            <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-white px-4 sm:px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <button 
                                onClick={handleGoBack} 
                                className="flex items-center text-gray-600 hover:text-gray-800 mr-4" 
                                disabled={submitting}
                            >
                                <ChevronLeft size={20} />
                                <span className="ml-1 hidden sm:inline">Back</span>
                            </button>
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Edit Product</h1>
                        </div>
                    </div>
                    
                    <div className="p-4 sm:p-6">
                        {submitSuccess && (
                            <StatusMessage 
                                type="success" 
                                message="Product updated successfully!" 
                                submessage="Redirecting..." 
                            />
                        )}
                        {submitError && <StatusMessage type="error" message={submitError} />}
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField 
                                    label="Product Name" 
                                    name="name" 
                                    required 
                                    value={formData.name} 
                                    error={errors.name} 
                                    onChange={handleChange} 
                                    disabled={submitting} 
                                />
                                <FormField 
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
                                    label="Current Price" 
                                    name="price" 
                                    type="number" 
                                    required 
                                    currency 
                                    min="0" 
                                    step="0.01" 
                                    value={formData.price} 
                                    error={errors.price} 
                                    onChange={handleChange} 
                                    disabled={submitting} 
                                />
                                <FormField 
                                    label="Slashed Price (Optional)" 
                                    name="slashed_price" 
                                    type="number" 
                                    currency 
                                    min="0" 
                                    step="0.01" 
                                    placeholder="0.00" 
                                    value={formData.slashed_price} 
                                    error={errors.slashed_price} 
                                    onChange={handleChange} 
                                    disabled={submitting} 
                                />
                                <FormField 
                                    label="Available Quantity" 
                                    name="quantity" 
                                    type="number" 
                                    required 
                                    min="0" 
                                    placeholder="Enter quantity" 
                                    value={formData.quantity} 
                                    error={errors.quantity} 
                                    onChange={handleChange} 
                                    disabled={submitting} 
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Skin Concerns (Optional)
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Select applicable skin concerns. Leave empty for products like perfumes or items without specific skin concerns.
                                    </p>
                                    
                                    {/* DEBUG INFO DISPLAY */}
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                                        <strong>DEBUG INFO:</strong><br/>
                                        Current: {JSON.stringify(formData.concern_options)}<br/>
                                        Original: {JSON.stringify(originalData?.concern_options)}<br/>
                                        Has Changes: {hasChanges().toString()}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {CONCERN_OPTIONS.map(c => { 
                                            const isSelected = formData.concern_options.includes(c.value); 
                                            return (
                                                <label 
                                                    key={c.value} 
                                                    className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                                                        isSelected 
                                                            ? 'bg-pink-50 border-pink-300' 
                                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected} 
                                                        onChange={() => handleConcernToggle(c.value)} 
                                                        disabled={submitting} 
                                                        className="sr-only" 
                                                    />
                                                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center flex-shrink-0 ${
                                                        isSelected ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
                                                    }`}>
                                                        {isSelected && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm font-medium ${
                                                        isSelected ? 'text-pink-700' : 'text-gray-700'
                                                    }`}>
                                                        {c.label}
                                                    </span>
                                                </label>
                                            ); 
                                        })}
                                    </div>
                                    {errors.concern_options && (
                                        <p className="mt-1 text-red-500 text-sm flex items-center">
                                            <AlertCircle size={16} className="mr-1" />
                                            {errors.concern_options}
                                        </p>
                                    )}
                                </div>
                                
                                <FormField 
                                    label="Description" 
                                    name="description" 
                                    type="textarea" 
                                    required 
                                    className="md:col-span-2" 
                                    value={formData.description} 
                                    error={errors.description} 
                                    onChange={handleChange} 
                                    disabled={submitting} 
                                />
                                
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
                                        {existingImages.length > 0 ? 'Add More Images' : 'Product Images'}
                                        {existingImages.length === 0 && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                                        errors.images ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                    }`}>
                                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <div className="space-y-2">
                                            <label htmlFor="images" className="cursor-pointer text-pink-600 hover:text-pink-500 font-medium">
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
                                                PNG, JPG, WebP up to 2MB (max {IMAGE_CONFIG.maxCount})
                                            </p>
                                        </div>
                                    </div>
                                    {errors.images && (
                                        <p className="mt-2 text-sm text-red-500 flex items-center">
                                            <AlertCircle size={16} className="mr-1" />
                                            {errors.images}
                                        </p>
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

                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                                <button 
                                    type="button" 
                                    onClick={handleGoBack} 
                                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" 
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting || !hasChanges()} 
                                    className={`w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg text-white font-medium flex items-center justify-center transition-colors ${
                                        submitting || !hasChanges() 
                                            ? 'bg-pink-400 cursor-not-allowed' 
                                            : 'bg-pink-500 hover:bg-pink-600'
                                    }`}
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Updating Product...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} className="mr-2" />
                                            Update Product
                                        </>
                                    )}
                                </button>
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
                message="Are you sure you want to leave? Your changes will be lost." 
                confirmText="Leave Page" 
                cancelText="Stay" 
            />
        </>
    );
};

export default EditProductPage;