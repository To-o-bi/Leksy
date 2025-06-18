import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { getCategories, getCategoryDisplayName, getSkinConcerns } from '../../utils/api';

export default function ProductFilters({ selectedFilters, onFilterChange, horizontal = false, compact = false }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('category');
  const [skinConcerns, setSkinConcerns] = useState({});
  
  const filterRef = useRef(null);

  // Get categories and concerns from utils
  const categories = getCategories();
  const availableConcerns = getSkinConcerns();

  // Initialize skin concerns state
  useEffect(() => {
    const initialConcerns = {};
    availableConcerns.forEach(concern => {
      initialConcerns[concern] = false;
    });
    setSkinConcerns(initialConcerns);
  }, []);

  // Update skinConcerns state when selectedFilters.concerns changes
  useEffect(() => {
    if (selectedFilters.concerns && selectedFilters.concerns.length > 0) {
      const newConcernState = {};
      
      // Initialize all concerns to false
      availableConcerns.forEach(concern => {
        newConcernState[concern] = false;
      });
      
      // Set selected ones to true
      selectedFilters.concerns.forEach(concern => {
        if (availableConcerns.includes(concern)) {
          newConcernState[concern] = true;
        }
      });
      
      setSkinConcerns(newConcernState);
    } else {
      // Reset all concerns if none are selected
      const resetConcerns = {};
      availableConcerns.forEach(concern => {
        resetConcerns[concern] = false;
      });
      setSkinConcerns(resetConcerns);
    }
  }, [selectedFilters.concerns, availableConcerns]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFilter = useCallback(() => {
    setIsFilterOpen(prev => {
      if (!prev) {
        // Default to category tab when opening
        setActiveTab('category');
      }
      return !prev;
    });
  }, []);

  const selectCategory = useCallback((category) => {
    onFilterChange({ category });
    setIsFilterOpen(false);
  }, [onFilterChange]);

  const toggleConcern = useCallback((concern) => {
    setSkinConcerns(prevState => {
      const newConcernState = {
        ...prevState,
        [concern]: !prevState[concern]
      };
      
      // Update selected concerns in parent component
      const selectedConcerns = Object.entries(newConcernState)
        .filter(([_, isSelected]) => isSelected)
        .map(([concernName]) => concernName);
        
      onFilterChange({ concerns: selectedConcerns });
      
      return newConcernState;
    });
  }, [onFilterChange]);

  const removeConcern = useCallback((concernToRemove) => {
    const updatedConcerns = selectedFilters.concerns.filter(concern => concern !== concernToRemove);
    onFilterChange({ concerns: updatedConcerns });
  }, [onFilterChange, selectedFilters.concerns]);

  // Check if any filters are applied
  const hasCategory = selectedFilters.category && selectedFilters.category !== '';
  const hasConcerns = selectedFilters.concerns && selectedFilters.concerns.length > 0;
  const hasFilters = hasCategory || hasConcerns;

  // Determine what to display in the filter button
  const getButtonLabel = useCallback(() => {
    if (hasCategory && !hasConcerns) {
      return getCategoryDisplayName(selectedFilters.category);
    } else if (!hasCategory && hasConcerns) {
      return `${selectedFilters.concerns.length} Concern${selectedFilters.concerns.length > 1 ? 's' : ''}`;
    } else if (hasCategory && hasConcerns) {
      const categoryName = getCategoryDisplayName(selectedFilters.category);
      return `${categoryName} + ${selectedFilters.concerns.length} Concern${selectedFilters.concerns.length > 1 ? 's' : ''}`;
    } else {
      return 'All Products';
    }
  }, [hasCategory, hasConcerns, selectedFilters.category, selectedFilters.concerns]);

  return (
    <div className={`font-sans ${horizontal ? 'flex flex-wrap items-start gap-4' : 'p-4'}`}>
      {/* Combined Filter Dropdown */}
      <div className="relative" ref={filterRef}>
        <button
          onClick={toggleFilter}
          className={`flex items-center justify-between px-4 py-2 bg-white border ${
            hasFilters ? 'border-pink-300 bg-pink-50' : 'border-gray-300'
          } rounded-md shadow-sm hover:border-pink-400 transition-colors ${
            horizontal ? 'w-auto min-w-40' : 'w-64'
          } focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300`}
          aria-haspopup="true"
          aria-expanded={isFilterOpen}
        >
          <span className={`${hasFilters ? 'text-pink-600' : 'text-gray-600'} truncate`}>
            {getButtonLabel()}
          </span>
          <ChevronDown 
            className={`w-4 h-4 ${hasFilters ? 'text-pink-500' : 'text-gray-500'} ml-2 transition-transform ${
              isFilterOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Combined dropdown with tabs */}
        {isFilterOpen && (
          <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            {/* Tab headers */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('category')}
                className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
                  activeTab === 'category' 
                    ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveTab('concern')}
                className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
                  activeTab === 'concern' 
                    ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Concerns
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'category' ? (
              <div className="max-h-60 overflow-y-auto">
                {/* All Products option */}
                <button
                  onClick={() => selectCategory('')}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                    !selectedFilters.category || selectedFilters.category === '' 
                      ? 'bg-pink-100 text-pink-800 font-medium' 
                      : 'text-gray-700'
                  }`}
                >
                  All Products
                </button>
                
                {/* Category options */}
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => selectCategory(category)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                      selectedFilters.category === category 
                        ? 'bg-pink-100 text-pink-800 font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    {getCategoryDisplayName(category)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3">
                <p className="text-sm font-medium text-gray-700 mb-3">Select skin concerns:</p>
                <div className="space-y-2">
                  {availableConcerns.map((concern) => (
                    <label 
                      key={concern} 
                      className="flex items-center cursor-pointer hover:bg-gray-50 rounded p-1 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={skinConcerns[concern] || false}
                        onChange={() => toggleConcern(concern)}
                        className="w-4 h-4 mr-3 border-gray-300 rounded text-pink-500 focus:ring-pink-300 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 select-none">
                        {concern}
                      </span>
                    </label>
                  ))}
                </div>
                
                {/* Clear concerns button */}
                {hasConcerns && (
                  <button
                    onClick={() => onFilterChange({ concerns: [] })}
                    className="w-full mt-3 px-3 py-1 text-sm text-pink-600 hover:text-pink-800 hover:bg-pink-50 rounded transition-colors"
                  >
                    Clear all concerns
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Display selected filters on separate lines (when not compact) */}
      {!compact && hasFilters && (
        <div className={`flex flex-col ${horizontal ? 'ml-4' : 'mt-4'}`}>
          {hasCategory && (
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Category:</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-sm bg-pink-100 text-pink-800 rounded-full inline-flex items-center">
                  {getCategoryDisplayName(selectedFilters.category)}
                  <button 
                    onClick={() => onFilterChange({ category: '' })}
                    className="ml-2 text-pink-600 hover:text-pink-800 focus:outline-none"
                    aria-label={`Remove ${getCategoryDisplayName(selectedFilters.category)} filter`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          )}

          {hasConcerns && (
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Concerns:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedFilters.concerns.map((concern) => (
                  <span key={concern} className="px-3 py-1 text-sm bg-pink-100 text-pink-800 rounded-full inline-flex items-center">
                    {concern}
                    <button 
                      onClick={() => removeConcern(concern)}
                      className="ml-2 text-pink-600 hover:text-pink-800 focus:outline-none"
                      aria-label={`Remove ${concern} filter`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}