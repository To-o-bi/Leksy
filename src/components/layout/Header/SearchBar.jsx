import React, { useState } from 'react';

const SearchBar = () => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search logic
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        placeholder="Search products..."
        className="py-1 pl-3 pr-8 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 w-48"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;