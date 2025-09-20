import React, { useState, useEffect, useRef } from 'react';
import { 
  X,
  Send,
  Edit,
  Eye,
  FileText,
  Upload,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';

const ComposeEmailModal = ({ 
  isOpen, 
  onClose, 
  onSend, 
  subscribers, 
  selectedEmails = [] 
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const [images, setImages] = useState([]);
  const [imageType, setImageType] = useState('banner');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Calculate recipient count
  useEffect(() => {
    if (sendToAll) {
      setRecipientCount(subscribers.length);
    } else {
      setRecipientCount(selectedEmails.length);
    }
  }, [sendToAll, subscribers.length, selectedEmails.length]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setMessage('');
      setSendToAll(selectedEmails.length === 0);
      setPreviewMode(false);
      setIsLoading(false);
      setImages([]);
      setImageType('banner');
      setDragActive(false);
    }
  }, [isOpen, selectedEmails.length]);

  // Handle file selection
  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      return;
    }

    setIsLoading(true);
    
    const newsletterData = {
      title: title.trim(),
      message: message.trim(),
      images: images.map(img => img.file),
      image_type: imageType,
      recipients: sendToAll ? [] : selectedEmails
    };

    try {
      await onSend(newsletterData);
      // Clean up image previews
      images.forEach(img => URL.revokeObjectURL(img.preview));
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const isFormValid = title.trim() && message.trim() && recipientCount > 0;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-auto transform transition-all max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Compose Newsletter
                </h3>
                <p className="text-sm text-gray-500">
                  {recipientCount} recipient{recipientCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                disabled={isLoading}
              >
                {previewMode ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm">{previewMode ? 'Edit' : 'Preview'}</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto">
            {!previewMode ? (
              <div className="space-y-6">
                {/* Recipient Selection */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Recipients</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipients"
                        checked={sendToAll}
                        onChange={() => setSendToAll(true)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-700">
                        Send to all subscribers ({subscribers.length})
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipients"
                        checked={!sendToAll}
                        onChange={() => setSendToAll(false)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                        disabled={isLoading || selectedEmails.length === 0}
                      />
                      <span className="text-sm text-gray-700">
                        Send to selected subscribers ({selectedEmails.length})
                        {selectedEmails.length === 0 && (
                          <span className="text-gray-400 ml-1">(select subscribers first)</span>
                        )}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Newsletter Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter newsletter title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/200 characters</p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your newsletter content here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={8}
                    disabled={isLoading}
                    maxLength={10000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{message.length}/10,000 characters</p>
                </div>

                {/* Image Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="imageType"
                        value="banner"
                        checked={imageType === 'banner'}
                        onChange={(e) => setImageType(e.target.value)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-700">Banner</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="imageType"
                        value="flier"
                        checked={imageType === 'flier'}
                        onChange={(e) => setImageType(e.target.value)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-700">Flier</span>
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images (Optional)
                  </label>
                  
                  {/* Drag and Drop Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop images here, or{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                        disabled={isLoading}
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports: JPEG, PNG, GIF, WebP (Max 5MB each)
                    </p>
                  </div>

                  {/* Image Previews */}
                  {images.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Selected Images ({images.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {images.map((image, index) => (
                          <div key={index} className="relative bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <img
                                src={image.preview}
                                alt={image.name}
                                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {image.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(image.size)}
                                </p>
                              </div>
                              <button
                                onClick={() => removeImage(index)}
                                className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Newsletter Preview</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    This is how your newsletter will appear to {recipientCount} recipient{recipientCount !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Newsletter Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="text-sm">
                      <div className="text-gray-600">Title:</div>
                      <div className="font-medium text-gray-900 mt-1 text-lg">
                        {title || 'No title'}
                      </div>
                    </div>
                    {imageType && (
                      <div className="mt-2 text-xs text-gray-500">
                        Image Type: {imageType.charAt(0).toUpperCase() + imageType.slice(1)}
                      </div>
                    )}
                  </div>
                  
                  {/* Newsletter Body */}
                  <div className="p-6 bg-white">
                    {/* Images Preview */}
                    {images.length > 0 && (
                      <div className="mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image.preview}
                                alt={image.name}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                {image.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Content */}
                    <div className="prose max-w-none">
                      {message ? (
                        <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                          {message}
                        </div>
                      ) : (
                        <div className="text-gray-400 italic">No content</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-2 sm:gap-0">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!isFormValid || isLoading}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Newsletter</span>
                  </>
                )}
              </button>
            </div>
            {!isFormValid && recipientCount > 0 && (
              <p className="text-sm text-red-600 mt-2">
                Please fill in both title and message fields.
              </p>
            )}
            {recipientCount === 0 && (
              <p className="text-sm text-red-600 mt-2">
                Please select recipients or choose "Send to all subscribers".
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmailModal;