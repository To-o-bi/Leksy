import React from 'react';

const FormField = ({ 
  label, 
  id, 
  error, 
  required = false, 
  children, 
  showCharCount = false, 
  currentLength = 0, 
  maxLength = 0 
}) => {
  return (
    <div className={showCharCount ? "flex-grow flex flex-col" : ""}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      {children}
      <div className="flex justify-between items-center mt-1">
        {error ? (
          <p id={`${id}-error`} className="text-red-500 text-sm" role="alert">
            {error}
          </p>
        ) : (
          <span></span>
        )}
        {showCharCount && (
          <span id={`${id}-count`} className="text-gray-400 text-sm">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default FormField;