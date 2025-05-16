import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Return null if there's only one page or less
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Logic to show limited page numbers with ellipsis for better UX
    if (totalPages <= 7) {
      // If 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Determine start and end of current page group
      let startPage, endPage;
      
      if (currentPage <= 3) {
        // Near the beginning
        startPage = 2;
        endPage = 5;
        pages.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('ellipsis');
        startPage = totalPages - 4;
        endPage = totalPages - 1;
        pages.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
        pages.push(totalPages);
      } else {
        // Somewhere in the middle
        pages.push('ellipsis');
        startPage = currentPage - 1;
        endPage = currentPage + 1;
        pages.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  // Get the array of page numbers to display
  const pages = getPageNumbers();
  
  return (
    <div className="flex items-center justify-center space-x-1">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-pink-100'
        }`}
        aria-label="Previous page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      
      {/* Page numbers */}
      {pages.map((page, index) => (
        <React.Fragment key={index}>
          {page === 'ellipsis' ? (
            <span className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-md ${
                currentPage === page
                  ? 'bg-pink-500 text-white font-medium'
                  : 'text-gray-700 hover:bg-pink-100'
              }`}
              aria-current={currentPage === page ? 'page' : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
      
      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-pink-100'
        }`}
        aria-label="Next page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;