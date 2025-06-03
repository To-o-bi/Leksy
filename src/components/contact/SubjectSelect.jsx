import React from 'react';

const SubjectSelect = ({ 
  value, 
  onChange, 
  error, 
  isCustomSubject, 
  onCustomSubjectToggle 
}) => {
  const subjectOptions = [
    "Product Inquiry",
    "Order Support",
    "Skincare Consultation",
    "Product Review",
    "Wholesale/Partnership",
    "Shipping & Delivery",
    "Return/Exchange",
    "Technical Support",
    "Feedback & Suggestions"
  ];

  const handleSubjectChange = (e) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === 'Other') {
      onCustomSubjectToggle(true);
      onChange({
        target: {
          name: 'subject',
          value: ''
        }
      });
    } else {
      onCustomSubjectToggle(false);
      onChange(e);
    }
  };

  if (isCustomSubject) {
    return (
      <div className="relative">
        <input
          id="subject"
          name="subject"
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Enter your custom subject"
          maxLength={100}
          className={`w-full px-4 py-3 pr-20 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors`}
          aria-describedby={error ? "subject-error" : "subject-count"}
          required
          autoFocus
        />
        <button
          type="button"
          onClick={() => {
            onCustomSubjectToggle(false);
            onChange({
              target: {
                name: 'subject',
                value: ''
              }
            });
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Switch back to dropdown"
          title="Switch back to dropdown"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <select
      id="subject"
      name="subject"
      value={value}
      onChange={handleSubjectChange}
      className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-white`}
      aria-describedby={error ? "subject-error" : undefined}
      required
    >
      <option value="">Select a subject</option>
      {subjectOptions.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
      <option value="Other">Other</option>
    </select>
  );
};
export default SubjectSelect;