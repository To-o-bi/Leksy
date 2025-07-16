import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { productService } from '../../../api';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const PRODUCT_CATEGORIES = [ 'serums', 'moisturizers', 'bathe and body', 'sunscreens', 'toners', 'face cleansers' ];
const CONCERN_OPTIONS = [ { value: "anti_aging", label: "Anti-Aging" }, { value: "oily_skin", label: "Oily Skin" }, { value: "dry_skin", label: "Dry Skin" }, { value: "acne", label: "Acne" }, { value: "hyperpigmentation", label: "Hyperpigmentation" }, { value: "sensitive_skin", label: "Sensitive Skin" } ];
const IMAGE_CONFIG = { maxSize: 2 * 1024 * 1024, validTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], maxCount: 5 };
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const formatCategoryName = (category) => category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
const parseApiResponse = (response) => {
  if (typeof response === 'string' && response.includes('<br />')) {
    try { const jsonMatch = response.match(/\{.*\}$/); if (jsonMatch) return JSON.parse(jsonMatch[0]); if (response.includes('"code":200')) return { code: 200, message: 'Product updated successfully!' }; } catch (e) { console.warn('Could not parse response JSON:', e); }
  }
  return response;
};
const validateImageFile = (file) => {
  if (!IMAGE_CONFIG.validTypes.includes(file.type)) return { valid: false, error: 'Invalid file type.' };
  if (file.size > IMAGE_CONFIG.maxSize) return { valid: false, error: `File is too large (max 2MB).` };
  return { valid: true };
};

const FormField = React.memo(({ label, name, type = 'text', required = false, placeholder, currency = false, rows, options, className = '', value, error, onChange, disabled, ...props }) => {
  const baseClasses = `w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${error ? 'border-red-300' : 'border-gray-300'}`;
  return (
    <div className={className}><label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
      {type === 'select' ? (<select id={name} name={name} value={value} onChange={onChange} disabled={disabled} className={baseClasses} {...props}><option value="">{placeholder}</option>{options?.map((option) => (<option key={option} value={option}>{formatCategoryName(option)}</option>))}</select>) 
      : type === 'textarea' ? (<textarea id={name} name={name} value={value} onChange={onChange} disabled={disabled} rows={rows || 4} className={baseClasses} placeholder={placeholder} {...props} />) 
      : (<div className={currency ? 'relative' : ''}>{currency && (<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500">₦</span></div>)}<input type={type} id={name} name={name} value={value} onChange={onChange} disabled={disabled} className={`${baseClasses} ${currency ? 'pl-8' : ''}`} placeholder={placeholder} {...props} /></div>)}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

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
  
  const [formData, setFormData] = useState({ name: '', price: '', slashed_price: '', description: '', quantity: '', category: '', concern_options: [] });
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  const hasChanges = useCallback(() => {
    if (!originalData) return false;
    const areArraysEqual = (a, b) => { const arrA = a || [], arrB = b || []; if (arrA.length !== arrB.length) return false; return [...arrA].sort().join() === [...arrB].sort().join(); };
    return (formData.name !== originalData.name || parseFloat(formData.price) !== originalData.price || parseFloat(formData.slashed_price || 0) !== (originalData.slashed_price || 0) || formData.description !== originalData.description || parseInt(formData.quantity, 10) !== originalData.available_qty || formData.category !== originalData.category || !areArraysEqual(formData.concern_options, originalData.concern_options) || newImages.length > 0 || removedImages.length > 0);
  }, [formData, originalData, newImages, removedImages]);

  const handleError = useCallback((error, defaultMessage) => { console.error('Error:', error); if (error.message?.includes('Authentication')) { setSubmitError('Please log in again to continue.'); setTimeout(() => navigate('/admin/login'), 2000); } else if (error.message?.includes('not found') || error.status === 404) { setProductNotFound(true); } else { setSubmitError(error.message || defaultMessage); } }, [navigate]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) { setProductNotFound(true); setLoading(false); return; }
      try {
        const response = await productService.fetchProduct(id);
        if (!response || response.code !== 200 || !response.product) { setProductNotFound(true); setLoading(false); return; }
        const productData = response.product;
        let fetchedConcerns = [];
        if (typeof productData.concern_options === 'string') { try { const parsed = JSON.parse(productData.concern_options); fetchedConcerns = Array.isArray(parsed) ? parsed : []; } catch { fetchedConcerns = productData.concern_options.split(',').map(c => c.trim()).filter(Boolean); } }
        else if (Array.isArray(productData.concern_options)) { fetchedConcerns = productData.concern_options; }
        setOriginalData({ ...productData, concern_options: fetchedConcerns });
        setFormData({ name: productData.name || '', price: productData.price?.toString() || '', slashed_price: productData.slashed_price?.toString() || '', category: productData.category || '', quantity: productData.available_qty?.toString() || '', description: productData.description || '', concern_options: fetchedConcerns });
        setExistingImages(Array.isArray(productData.images) ? productData.images : []);
      } catch (error) { handleError(error, 'Failed to load product data.'); }
      finally { setLoading(false); }
    };
    fetchProductData();
  }, [id, handleError]);
  
  const handleChange = useCallback((e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' })); if (submitError) setSubmitError(''); }, [errors, submitError]);
  const handleConcernToggle = useCallback((concernValue) => { setFormData(prev => { const currentConcerns = prev.concern_options || []; const updatedConcerns = currentConcerns.includes(concernValue) ? currentConcerns.filter(c => c !== concernValue) : [...currentConcerns, concernValue]; return { ...prev, concern_options: updatedConcerns }; }); if (errors.concern_options) setErrors(prev => ({ ...prev, concern_options: '' })); if (submitError) setSubmitError(''); }, [errors.concern_options, submitError]);

  const handleImageChange = useCallback((e) => {
    if (existingImages.length + newImages.length + e.target.files.length > IMAGE_CONFIG.maxCount) { setErrors(prev => ({ ...prev, images: `Maximum ${IMAGE_CONFIG.maxCount} images allowed.` })); return; }
    const validFiles = [], invalidFiles = [];
    Array.from(e.target.files).forEach(file => { const validation = validateImageFile(file); if (validation.valid) validFiles.push(file); else invalidFiles.push({ name: file.name, reason: validation.error }); });
    if (invalidFiles.length > 0) setErrors(prev => ({ ...prev, images: invalidFiles.map(f => `${f.name}: ${f.reason}`).join(', ') }));
    if (validFiles.length > 0) { setNewImages(prev => [...prev, ...validFiles]); if (errors.images) setErrors(prev => ({ ...prev, images: '' })); if (submitError) setSubmitError('');
      const newPreviews = [];
      validFiles.forEach(file => { const reader = new FileReader(); reader.onloadend = () => { newPreviews.push(reader.result); if (newPreviews.length === validFiles.length) setNewImagePreviews(prev => [...prev, ...newPreviews]); }; reader.readAsDataURL(file); });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [existingImages.length, newImages.length, errors, submitError]);

  const handleRemoveImage = useCallback((index, type) => { if (type === 'new') { setNewImages(prev => prev.filter((_, i) => i !== index)); setNewImagePreviews(prev => prev.filter((_, i) => i !== index)); } else { setRemovedImages(prev => [...prev, existingImages[index]]); setExistingImages(prev => prev.filter((_, i) => i !== index)); } }, [existingImages]); 

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) newErrors.name = 'Product name is required (min 2 chars)';
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) newErrors.price = 'Please enter a valid price';
    if (!formData.description.trim() || formData.description.trim().length < 10) newErrors.description = 'Description is required (min 10 chars)';
    if (formData.quantity === '' || isNaN(formData.quantity) || parseInt(formData.quantity, 10) < 0) newErrors.quantity = 'Please enter a valid quantity';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.concern_options || formData.concern_options.length === 0) newErrors.concern_options = 'At least one skin concern must be selected';
    if (formData.slashed_price && (isNaN(formData.slashed_price) || parseFloat(formData.slashed_price) <= 0 || parseFloat(formData.slashed_price) <= parseFloat(formData.price))) newErrors.slashed_price = 'Original price must be greater than current price';
    if (existingImages.length === 0 && newImages.length === 0) newErrors.images = 'At least one product image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, existingImages.length, newImages.length]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) { setSubmitError('Please correct the errors and try again.'); return; }
    if (!hasChanges()) { setSubmitError('No changes detected.'); return; }
    setSubmitting(true); setSubmitError(''); setSubmitSuccess(false);
    try {
      const productData = {}; const areArraysEqual = (a, b) => (a || []).sort().join() === (b || []).sort().join();
      if (formData.name !== originalData.name) productData.name = formData.name.trim();
      if (parseFloat(formData.price) !== originalData.price) productData.price = parseFloat(formData.price);
      if (formData.description !== originalData.description) productData.description = formData.description.trim();
      if (parseInt(formData.quantity, 10) !== originalData.available_qty) productData.available_qty = parseInt(formData.quantity, 10);
      if (formData.category !== originalData.category) productData.category = formData.category;
      if (!areArraysEqual(formData.concern_options, originalData.concern_options)) productData.concern_options = formData.concern_options;
      const newSlashed = formData.slashed_price ? parseFloat(formData.slashed_price) : null;
      if (newSlashed !== (originalData.slashed_price || null)) productData.slashed_price = newSlashed;
      if (newImages.length > 0) productData.images = newImages;
      if (removedImages.length > 0) productData.removed_images = removedImages;
      
      const response = await productService.updateProduct(id, productData); const parsed = parseApiResponse(response);
      if (parsed && (parsed.code === 200 || parsed.code === '200')) { setSubmitSuccess(true); setTimeout(() => navigate('/admin/products/stock', { state: { notification: { type: 'success', message: `Product "${formData.name}" updated.` } } }), 2000); }
      else { throw new Error(parsed?.message || 'Failed to update product'); }
    } catch (error) { handleError(error, 'An error occurred while updating.'); }
    finally { setSubmitting(false); }
  }, [validateForm, hasChanges, formData, originalData, newImages, removedImages, id, navigate, handleError]);

  const handleGoBack = useCallback(() => { if (hasChanges()) setIsLeaveModalOpen(true); else navigate('/admin/products/stock'); }, [hasChanges, navigate]);
  const handleConfirmLeave = () => { setIsLeaveModalOpen(false); navigate('/admin/products/stock'); };
  const handleCloseModal = () => setIsLeaveModalOpen(false);

  const StatusMessage = ({ type, message, submessage }) => (<div className={`mb-6 p-4 border rounded-md ${type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}><div className="flex items-center">{type === 'success' ? (<CheckCircle size={20} className="mr-3 text-green-500" />) : (<AlertCircle size={20} className="mr-3 text-red-500" />)}<div><p className={`${type === 'success' ? 'text-green-800' : 'text-red-800'} font-medium`}>{message}</p>{submessage && (<p className={`${type === 'success' ? 'text-green-700' : 'text-red-700'} text-sm mt-1`}>{submessage}</p>)}</div></div></div>);
  const ImageGrid = React.memo(({ images, type, onRemove, submitting }) => (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">{images.map((image, index) => (<div key={`${type}-${index}`} className="relative group"><div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100"><img src={image} alt={`${type} image ${index + 1}`} className="h-full w-full object-cover" onError={(e) => { e.target.src = FALLBACK_IMAGE; }} /></div>{!submitting && (<button type="button" onClick={() => onRemove(index, type)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 opacity-0 group-hover:opacity-100"><X size={16} /></button>)}{type === 'new' && (<div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">New</div>)}</div>))}</div>));

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (productNotFound) return <div className="max-w-4xl mx-auto py-8 text-center"><AlertCircle size={48} className="mx-auto text-red-400 mb-4" /><h1 className="text-2xl font-semibold mb-2">Product Not Found</h1><p className="text-red-800 bg-red-50 p-3 rounded-md">The product you are looking for does not exist.</p><button onClick={() => navigate('/admin/products/stock')} className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Return to Products</button></div>;
  
  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-white px-6 py-4 border-b border-gray-200"><div className="flex items-center"><button onClick={handleGoBack} className="flex items-center text-gray-600 hover:text-gray-800 mr-4" disabled={submitting}><ChevronLeft size={20} /><span className="ml-1">Back</span></button><h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1></div></div>
          <div className="px-6 py-6">
            {submitSuccess && <StatusMessage type="success" message="Product updated successfully!" submessage="Redirecting..." />}
            {submitError && <StatusMessage type="error" message={submitError} />}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField key="name" label="Product Name" name="name" required value={formData.name} error={errors.name} onChange={handleChange} disabled={submitting} />
                <FormField key="category" label="Category" name="category" type="select" required placeholder="Select Category" options={PRODUCT_CATEGORIES} value={formData.category} error={errors.category} onChange={handleChange} disabled={submitting} />
                <FormField key="price" label="Price" name="price" type="number" required currency min="0" step="0.01" value={formData.price} error={errors.price} onChange={handleChange} disabled={submitting} />
                <FormField key="slashed_price" label="Original Price (Optional)" name="slashed_price" type="number" currency min="0" step="0.01" value={formData.slashed_price} error={errors.slashed_price} onChange={handleChange} disabled={submitting} />
                <FormField key="quantity" label="Quantity" name="quantity" type="number" required min="0" value={formData.quantity} error={errors.quantity} onChange={handleChange} disabled={submitting} />
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Skin Concerns <span className="text-red-500">*</span></label><div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 border rounded-md ${errors.concern_options ? 'border-red-300' : 'border-gray-300'}`}>{CONCERN_OPTIONS.map(c => { const isSelected = formData.concern_options.includes(c.value); return (<label key={c.value} className={`flex items-center p-2 rounded-md border cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}><input type="checkbox" checked={isSelected} onChange={() => handleConcernToggle(c.value)} disabled={submitting} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><span className={`ml-3 text-sm font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>{c.label}</span></label>); })}</div>{errors.concern_options && <p className="mt-1 text-sm text-red-600">{errors.concern_options}</p>}</div>
                <FormField key="description" label="Description" name="description" type="textarea" required className="md:col-span-2" value={formData.description} error={errors.description} onChange={handleChange} disabled={submitting} />
                {existingImages.length > 0 && (<div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-3">Current Images ({existingImages.length})</label><ImageGrid images={existingImages} type="existing" onRemove={handleRemoveImage} submitting={submitting} /></div>)}
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">{existingImages.length > 0 ? 'Add More Images' : 'Product Images'} {existingImages.length === 0 && <span className="text-red-500">*</span>}</label><div className={`border-2 border-dashed rounded-lg p-6 text-center ${errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}><Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" /><div className="space-y-2"><label htmlFor="images" className="cursor-pointer text-blue-600 hover:text-blue-500 font-medium">Choose files<input id="images" name="images" type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageChange} disabled={submitting} /></label><p className="text-gray-500">or drag and drop</p><p className="text-sm text-gray-400">PNG, JPG, WebP up to 2MB (max {IMAGE_CONFIG.maxCount})</p></div></div>{errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}{newImagePreviews.length > 0 && (<div className="mt-4"><p className="text-sm font-medium text-gray-700 mb-3">New Images ({newImages.length}):</p><ImageGrid images={newImagePreviews} type="new" onRemove={handleRemoveImage} submitting={submitting} /></div>)}</div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button type="button" onClick={handleGoBack} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" disabled={submitting}>Cancel</button>
                <button type="submit" disabled={submitting || !hasChanges()} className={`px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white flex items-center justify-center ${submitting || !hasChanges() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>{submitting ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Updating...</>) : (<><Save size={18} className="mr-2" />Save Changes</>)}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ConfirmationModal isOpen={isLeaveModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmLeave} title="Unsaved Changes" message="Are you sure you want to leave? Your changes will be lost." confirmText="Leave Page" cancelText="Stay"/>
    </>
  );
};

export default EditProductPage;