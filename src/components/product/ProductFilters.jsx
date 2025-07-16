import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { getCategories, getCategoryDisplayName, getSkinConcerns } from '../../utils/api';

export default function ProductFilters({ selectedFilters, onFilterChange, horizontal = false, compact = false }) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('category');
    const filterRef = useRef(null);

    const categories = useMemo(() => getCategories(), []);
    const availableConcerns = useMemo(() => getSkinConcerns(), []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleFilter = useCallback(() => setIsFilterOpen(prev => !prev), []);

    const selectCategory = useCallback((category) => {
        onFilterChange({ category });
        setIsFilterOpen(false);
    }, [onFilterChange]);

    // Simplified concern toggle logic
    const toggleConcern = useCallback((concern) => {
        const currentConcerns = selectedFilters.concerns || [];
        const newConcerns = currentConcerns.includes(concern)
            ? currentConcerns.filter(c => c !== concern)
            : [...currentConcerns, concern];
        onFilterChange({ concerns: newConcerns });
    }, [onFilterChange, selectedFilters.concerns]);

    const hasCategory = useMemo(() => !!selectedFilters.category, [selectedFilters.category]);
    const hasConcerns = useMemo(() => selectedFilters.concerns && selectedFilters.concerns.length > 0, [selectedFilters.concerns]);
    const hasFilters = useMemo(() => hasCategory || hasConcerns, [hasCategory, hasConcerns]);

    const buttonLabel = useMemo(() => {
        if (hasCategory && !hasConcerns) {
            return getCategoryDisplayName(selectedFilters.category);
        } else if (!hasCategory && hasConcerns) {
            return `${selectedFilters.concerns.length} Concern${selectedFilters.concerns.length > 1 ? 's' : ''}`;
        } else if (hasCategory && hasConcerns) {
            return `${getCategoryDisplayName(selectedFilters.category)} + ${selectedFilters.concerns.length} Concern${selectedFilters.concerns.length > 1 ? 's' : ''}`;
        } else {
            return 'All Products';
        }
    }, [hasCategory, hasConcerns, selectedFilters.category, selectedFilters.concerns]);

    return (
        <div className={`font-sans ${horizontal ? 'flex flex-wrap items-start gap-4' : 'p-4'}`}>
            <div className="relative" ref={filterRef}>
                <button
                    onClick={toggleFilter}
                    className={`flex items-center justify-between px-4 py-2 bg-white border ${hasFilters ? 'border-pink-300 bg-pink-50' : 'border-gray-300'} rounded-md shadow-sm hover:border-pink-400 transition-colors ${horizontal ? 'w-auto min-w-40' : 'w-64'} focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300`}
                >
                    <span className={`${hasFilters ? 'text-pink-600' : 'text-gray-600'} truncate`}>{buttonLabel}</span>
                    <ChevronDown className={`w-4 h-4 ${hasFilters ? 'text-pink-500' : 'text-gray-500'} ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterOpen && (
                    <div className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg right-0">
                        <div className="flex border-b border-gray-200">
                            <button onClick={() => setActiveTab('category')} className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${activeTab === 'category' ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                                Categories
                            </button>
                            <button onClick={() => setActiveTab('concern')} className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${activeTab === 'concern' ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                                Concerns
                            </button>
                        </div>

                        {activeTab === 'category' ? (
                            <div className="max-h-60 overflow-y-auto">
                                <button onClick={() => selectCategory('')} className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${!selectedFilters.category ? 'bg-pink-100 text-pink-800 font-medium' : 'text-gray-700'}`}>
                                    All Products
                                </button>
                                {categories.map((category) => (
                                    <button key={category} onClick={() => selectCategory(category)} className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${selectedFilters.category === category ? 'bg-pink-100 text-pink-800 font-medium' : 'text-gray-700'}`}>
                                        {getCategoryDisplayName(category)}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-3">
                                <p className="text-sm font-medium text-gray-700 mb-3">Select skin concerns:</p>
                                <div className="space-y-2">
                                    {availableConcerns.map((concern) => (
                                        <label key={concern} className="flex items-center cursor-pointer hover:bg-gray-50 rounded p-1 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedFilters.concerns?.includes(concern) || false}
                                                onChange={() => toggleConcern(concern)}
                                                className="w-4 h-4 mr-3 border-gray-300 rounded text-pink-500 focus:ring-pink-300 focus:ring-2"
                                            />
                                            <span className="text-sm text-gray-700 select-none">{concern}</span>
                                        </label>
                                    ))}
                                </div>
                                
                                {hasConcerns && (
                                    <button onClick={() => onFilterChange({ concerns: [] })} className="w-full mt-3 px-3 py-1 text-sm text-pink-600 hover:text-pink-800 hover:bg-pink-50 rounded transition-colors">
                                        Clear all concerns
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}