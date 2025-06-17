// PersonalInformationStep.js
import React from 'react';
import { AGE_RANGES } from '../../components/consultation/constants'; // Assuming constants.js is in the same folder

const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  { value: 'other', label: 'Other' }
];

const PersonalInformationStep = ({ register, errors }) => (
  <div className="space-y-4 sm:space-y-6">
    <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8">Tell Us About Yourself</h2>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Name</label>
      <input
        type="text"
        {...register('name', { 
          required: 'Full name is required',
          minLength: { value: 2, message: 'Name must be at least 2 characters' },
          pattern: { value: /^[a-zA-Z\s]+$/, message: 'Name can only contain letters and spaces' }
        })}
        placeholder="Enter your full name"
        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
      />
      {errors.name && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.name.message}</span>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
      <input
        type="email"
        {...register('email', {
          required: 'Email is required',
          pattern: { 
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
            message: 'Please enter a valid email address' 
          }
        })}
        placeholder="your.email@example.com"
        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
      />
      {errors.email && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.email.message}</span>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Phone Number</label>
      <input
        type="tel"
        {...register('phone', { 
          required: 'Phone number is required',
          pattern: { 
            value: /^[\+]?[\d\s\-\(\)]+$/, 
            message: 'Please enter a valid phone number' 
          },
          minLength: { value: 10, message: 'Phone number must be at least 10 digits' }
        })}
        placeholder="+234 xxx xxx xxxx"
        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
      />
      {errors.phone && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.phone.message}</span>}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Age Range</label>
        <select
          {...register('age_range', { required: 'Age range is required' })}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
        >
          <option value="">Select age range</option>
          {AGE_RANGES.map(age => (
            <option key={age.value} value={age.value}>{age.label}</option>
          ))}
        </select>
        {errors.age_range && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.age_range.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Gender</label>
        <select
          {...register('gender', { required: 'Gender is required' })}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
        >
          <option value="">Select gender</option>
          {GENDER_OPTIONS.map(gender => (
            <option key={gender.value} value={gender.value}>{gender.label}</option>
          ))}
        </select>
        {errors.gender && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.gender.message}</span>}
      </div>
    </div>
  </div>
);

export default PersonalInformationStep;