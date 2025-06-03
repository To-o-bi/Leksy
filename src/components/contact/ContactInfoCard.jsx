import React from 'react';

const ContactInfoCard = ({ 
  icon, 
  title, 
  content, 
  href, 
  isAddress = false,
  className = "",
  target = "_self"
}) => {
  const cardContent = (
    <div className={`
      bg-pink-50 bg-opacity-60 rounded-lg p-4 
      flex items-start space-x-4 
      hover:bg-pink-100 hover:bg-opacity-70 hover:shadow-md hover:-translate-y-0.5
      transition-all duration-300 ease-out
      border border-transparent hover:border-pink-200
      group
      ${href && !isAddress ? 'cursor-pointer' : ''}
      ${className}
    `}>
      <div className="text-pink-500 flex-shrink-0 mt-1 transition-all duration-300 ease-out group-hover:scale-110 group-hover:text-pink-600 group-hover:rotate-3">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-gray-600 font-medium text-sm mb-1 uppercase tracking-wide transition-colors duration-300 group-hover:text-pink-700">
          {title}
        </h3>
        {isAddress ? (
          <address className="text-gray-800 not-italic font-medium leading-relaxed transition-colors duration-300 group-hover:text-gray-900">
            {content}
          </address>
        ) : (
          <div className="text-gray-800 font-medium leading-relaxed break-words transition-colors duration-300 group-hover:text-gray-900">
            {content}
          </div>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-pink-400 group-hover:text-pink-500 self-center">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  if (href && !isAddress) {
    return (
      <a 
        href={href} 
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className="block hover:text-pink-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 rounded-lg hover:scale-[1.02] active:scale-[0.98]"
        aria-label={`Contact via ${title}: ${content}`}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div 
      className="focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 rounded-lg"
      tabIndex={isAddress ? 0 : -1}
      role={isAddress ? "region" : undefined}
      aria-label={isAddress ? `Address: ${content}` : undefined}
    >
      {cardContent}
    </div>
  );
};

export default ContactInfoCard;