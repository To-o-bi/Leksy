import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button component for Leksy Cosmetics
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Button style variant (primary, secondary, outline, text)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {Function} props.onClick - Click handler function
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ReactNode} props.leftIcon - Icon to display before button text
 * @param {React.ReactNode} props.rightIcon - Icon to display after button text
 * @param {string} props.type - Button type attribute (button, submit, reset)
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  leftIcon,
  rightIcon,
  type = 'button',
  className = '',
  ...rest
}) => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-pink-500 text-white hover:bg-pink-600 active:bg-pink-700 disabled:bg-pink-300',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400',
    outline: 'bg-transparent border border-gray-300 text-gray-800 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-400',
    text: 'bg-transparent text-pink-500 hover:bg-pink-50 active:bg-pink-100 disabled:text-pink-300',
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm py-1.5 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-6',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combined classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${widthClasses}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default Button;