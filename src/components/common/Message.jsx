import React, { useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Message = ({ 
  message, 
  type = 'success', 
  count = 1,
  onClose 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // Triggers the exit animation and then calls the parent's onClose handler.
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // This duration should match the exit animation time.
  }, [onClose]);

  // Helper to select the correct icon based on message type
  const messageIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': default: return <Info className="w-5 h-5" />;
    }
  };

  // Tailwind CSS classes for different message types
  const messageClasses = {
    success: 'bg-green-50 border-green-500 text-green-700',
    error: 'bg-red-50 border-red-500 text-red-700',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-700',
    info: 'bg-blue-50 border-blue-500 text-blue-700'
  };

  const iconClasses = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  return (
    <div 
      className={`
        p-4 rounded-md shadow-lg
        border-l-4 max-w-md w-full md:w-96
        flex items-start gap-3
        transform transition-all duration-300 ease-in-out
        ${messageClasses[type] || messageClasses.info}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${iconClasses[type] || iconClasses.info}`}>
        {messageIcon()}
      </div>
      
      <div className="flex-grow flex items-center gap-2">
        <p className="font-medium">{message}</p>
        {/* Display a counter badge if the message has been triggered more than once */}
        {count > 1 && (
          <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
            x{count}
          </span>
        )}
      </div>
      
      <button 
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Message;
