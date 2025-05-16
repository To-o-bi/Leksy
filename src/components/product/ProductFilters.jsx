import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ProductFilters({ selectedFilters, onFilterChange, horizontal = false, compact = false }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('category'); // 'category' or 'concern'
  const [skinConcerns, setSkinConcerns] = useState({
    'Anti-Aging': false,
    'Oily Skin': false,
    'Dry Skin': false,
    'Acne': false,
    'Hyperpigmentation': false,
    'Sensitive skin': false
  });
  
  const filterRef = useRef(null);

  const categories = [
    'Serums',
    'Toners',
    'Moisturizers',
    'Sunscreens',
    'Bathe and Body',
    'Face Cleansers'
  ];

  // Update skinConcerns state when selectedFilters.concerns changes
  useEffect(() => {
    if (selectedFilters.concerns && selectedFilters.concerns.length > 0) {
      const newConcernState = { ...skinConcerns };
      
      // First reset all concerns to false
      Object.keys(newConcernState).forEach(key => {
        newConcernState[key] = false;
      });
      
      // Then set the selected ones to true
      selectedFilters.concerns.forEach(concern => {
        if (concern in newConcernState) {
          newConcernState[concern] = true;
        }
      });
      
      setSkinConcerns(newConcernState);
    } else {
      // Reset all concerns if none are selected
      const resetConcerns = { ...skinConcerns };
      Object.keys(resetConcerns).forEach(key => {
        resetConcerns[key] = false;
      });
      setSkinConcerns(resetConcerns);
    }
  }, [selectedFilters.concerns]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    // Default to category tab when opening
    if (!isFilterOpen) {
      setActiveTab('category');
    }
  };

  const selectCategory = (category) => {
    onFilterChange({ category });
    setIsFilterOpen(false);
  };

  const toggleConcern = (concern) => {
    const newConcernState = {
      ...skinConcerns,
      [concern]: !skinConcerns[concern]
    };
    
    setSkinConcerns(newConcernState);
    
    // Update selected concerns in parent component
    const selectedConcerns = Object.entries(newConcernState)
      .filter(([_, isSelected]) => isSelected)
      .map(([concern]) => concern);
      
    onFilterChange({ concerns: selectedConcerns });
  };

  // Check if any filters are applied
  const hasCategory = selectedFilters.category && selectedFilters.category !== '';
  const hasConcerns = selectedFilters.concerns && selectedFilters.concerns.length > 0;
  const hasFilters = hasCategory || hasConcerns;

  // Determine what to display in the filter button
  const getButtonLabel = () => {
    if (hasCategory && !hasConcerns) {
      return selectedFilters.category;
    } else if (!hasCategory && hasConcerns) {
      return `${selectedFilters.concerns.length} Concern${selectedFilters.concerns.length > 1 ? 's' : ''}`;
    } else if (hasCategory && hasConcerns) {
      return `${selectedFilters.category} + ${selectedFilters.concerns.length} Concern${selectedFilters.concerns.length > 1 ? 's' : ''}`;
    } else {
      return 'All Products';
    }
  };

  return (
    <div className={`font-sans ${horizontal ? 'flex flex-wrap items-start gap-4' : 'p-4'}`}>
      {/* Combined Filter Dropdown */}
      <div className="relative" ref={filterRef}>
        <button
          onClick={toggleFilter}
          className={`flex items-center justify-between px-4 py-2 bg-white border ${hasFilters ? 'border-pink-300 bg-pink-50' : 'border-gray-300'} rounded-md shadow-sm ${horizontal ? 'w-auto min-w-40' : 'w-64'}`}
        >
          <span className={`${hasFilters ? 'text-pink-600' : 'text-gray-600'}`}>
            {getButtonLabel()}
          </span>
          <ChevronDown className={`w-4 h-4 ${hasFilters ? 'text-pink-500' : 'text-gray-500'} ml-2`} />
        </button>

        {/* Combined dropdown with tabs */}
        {isFilterOpen && (
          <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            {/* Tab headers */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('category')}
                className={`flex-1 py-2 text-center text-sm font-medium ${
                  activeTab === 'category' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveTab('concern')}
                className={`flex-1 py-2 text-center text-sm font-medium ${
                  activeTab === 'concern' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-700'
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
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                    !selectedFilters.category ? 'bg-pink-100 text-gray-900' : 'text-gray-700'
                  }`}
                >
                  All Products
                </button>
                
                {/* Category options */}
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => selectCategory(category)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                      selectedFilters.category === category ? 'bg-pink-100 text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Select skin concerns:</p>
                {Object.keys(skinConcerns).map((concern, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`concern-${index}`}
                      checked={skinConcerns[concern]}
                      onChange={() => toggleConcern(concern)}
                      className="w-4 h-4 mr-2 border-gray-300 rounded accent-pink-500"
                    />
                    <label htmlFor={`concern-${index}`} className="text-gray-700">
                      {concern}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Display selected filters on separate lines */}
      {!compact && hasFilters && (
        <div className={`flex flex-col ${horizontal ? 'ml-4' : 'mt-4'}`}>
          {hasCategory && (
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-700">Selected Category:</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="px-2 py-1 text-sm bg-pink-100 rounded-md inline-flex items-center">
                  {selectedFilters.category}
                  <button 
                    onClick={() => onFilterChange({ category: '' })}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          )}

          {hasConcerns && (
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-700">Selected Concerns:</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedFilters.concerns.map((concern, index) => (
                  <span key={index} className="px-2 py-1 text-sm bg-pink-100 rounded-md inline-flex items-center">
                    {concern}
                    <button 
                      onClick={() => toggleConcern(concern)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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