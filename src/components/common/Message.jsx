import React, { useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Message = ({ 
  message, 
  type = 'success', 
  count = 1,
  onClose 
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Trigger entrance animation
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 300);
    return () => clearTimeout(timer);
  }, []);

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
      case 'success': return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'error': return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'info': default: return <Info className="w-4 h-4 sm:w-5 sm:h-5" />;
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

  // Determine animation state
  const getAnimationClass = () => {
    if (isExiting) return 'opacity-0 translate-x-full';
    if (isEntering) return 'translate-x-full';
    return 'opacity-100 translate-x-0';
  };

  return (
    <div 
      className={`
        p-3 sm:p-4 rounded-md shadow-lg
        border-l-4 w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-md md:w-96
        flex items-start gap-2 sm:gap-3
        transform transition-all duration-300 ease-out
        ${messageClasses[type] || messageClasses.info}
        ${getAnimationClass()}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 mt-0.5 sm:mt-0 ${iconClasses[type] || iconClasses.info}`}>
        {messageIcon()}
      </div>
      
      <div className="flex-grow flex items-center gap-2 min-w-0">
        <p className="font-medium text-sm sm:text-base break-words">{message}</p>
        {/* Display a counter badge if the message has been triggered more than once */}
        {count > 1 && (
          <span className="bg-gray-200 text-gray-600 text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            x{count}
          </span>
        )}
      </div>
      
      <button 
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition touch-manipulation min-w-[24px] min-h-[24px] flex items-center justify-center -mr-1 sm:mr-0"
        aria-label="Close"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default Message;