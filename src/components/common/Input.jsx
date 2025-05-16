// src/components/common/Input.jsx
import React from 'react';

const Input = ({
  type = 'text',
  name,
  id,
  value,
  onChange,
  placeholder,
  className = '',
  error,
  ...props
}) => {
  const baseClasses = 'transition-colors focus:outline-none';
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '';

  return (
    <div className="w-full">
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;