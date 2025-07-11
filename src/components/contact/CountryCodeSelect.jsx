import React from 'react';

const CountryCodeSelect = ({ value, onChange }) => {
  const countryOptions = [
    { code: '+234', flag: '🇳🇬', country: 'Nigeria' },
    { code: '+1', flag: '🇺🇸', country: 'United States' },
    { code: '+44', flag: '🇬🇧', country: 'United Kingdom' },
    { code: '+1', flag: '🇨🇦', country: 'Canada' },
    { code: '+27', flag: '🇿🇦', country: 'South Africa' },
    { code: '+233', flag: '🇬🇭', country: 'Ghana' },
    { code: '+254', flag: '🇰🇪', country: 'Kenya' }
  ];

  return (
    <div className="relative">
      <select
        name="countryCode"
        value={value}
        onChange={onChange}
        className="appearance-none pl-3 pr-8 py-3 border border-gray-300 rounded-l-lg bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
        aria-label="Country code"
      >
        {countryOptions.map(option => (
          <option key={`${option.code}-${option.country}`} value={option.code}>
            {option.flag} {option.code}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
};

export default CountryCodeSelect;