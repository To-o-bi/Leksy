// src/components/Message.jsx
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Message = ({ 
  show, 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(show);
    setIsExiting(false);
    
    let timer;
    if (show && duration > 0) {
      timer = setTimeout(() => {
        handleClose();
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, duration]);

  const handleClose = () => {
    setIsExiting(true);
    
    // Small delay to allow exit animation to play
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const messageIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

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
        fixed top-4 right-4 p-4 rounded-md shadow-lg z-50
        border-l-4 max-w-md w-full md:w-96
        flex items-start gap-3
        transform transition-all duration-300 ease-in-out
        ${messageClasses[type] || messageClasses.info}
        ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${iconClasses[type] || iconClasses.info}`}>
        {messageIcon()}
      </div>
      
      <div className="flex-grow">
        <p className="font-medium">{message}</p>
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