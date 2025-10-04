import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex py-3 sm:py-4 mb-3 sm:mb-4 px-2 sm:px-4 lg:px-6 text-xs sm:text-sm" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 mx-0.5 sm:mx-1 text-gray-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {index === items.length - 1 ? (
              <span className="text-gray-500 truncate max-w-[120px] sm:max-w-none">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="text-pink-500 hover:text-pink-600 truncate max-w-[80px] sm:max-w-none"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;