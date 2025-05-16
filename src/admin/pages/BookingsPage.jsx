import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Mock data - replace with actual API call
        const mockBookings = [
          {
            id: 'BK-1001',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            phone: '+1 (555) 123-4567',
            ageRange: '25-34',
            skinType: 'combination',
            skinConcerns: ['dryness', 'aging'],
            currentProducts: 'Cleanser and moisturizer',
            additionalInfo: 'Very sensitive to fragrances',
            service: 'Skincare Consultation',
            consultationDate: '2023-06-15',
            timeSlot: '10:00 AM',
            consultationFormat: 'video-call',
            termsAgreed: true,
            status: 'confirmed',
            concern: 'Dry skin, looking for hydration solutions',
            notes: 'Prefers organic products',
            createdAt: '2023-06-10T09:30:00Z'
          },
          {
            id: 'BK-1002',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            phone: '+1 (555) 987-6543',
            ageRange: '18-24',
            skinType: 'oily',
            skinConcerns: ['acne'],
            currentProducts: 'None currently',
            additionalInfo: 'Has tried salicylic acid before',
            service: 'Acne Treatment Plan',
            consultationDate: '2023-06-16',
            timeSlot: '2:30 PM',
            consultationFormat: 'whatsapp',
            termsAgreed: true,
            status: 'pending',
            concern: 'Persistent acne, needs routine advice',
            notes: 'Allergic to salicylic acid',
            createdAt: '2023-06-11T14:15:00Z'
          }
        ];
        
        setBookings(mockBookings);
        
        // If URL has an ID parameter, find and set that booking
        if (id) {
          const bookingToView = mockBookings.find(b => b.id === id);
          setSelectedBooking(bookingToView || null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [id]);

  const filteredBookings = bookings.filter(booking => {
    if (activeTab !== 'all' && booking.status !== activeTab) {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        booking.id.toLowerCase().includes(searchLower) ||
        `${booking.firstName} ${booking.lastName}`.toLowerCase().includes(searchLower) ||
        booking.email.toLowerCase().includes(searchLower) ||
        booking.service.toLowerCase().includes(searchLower) ||
        booking.phone.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const updateBookingStatus = (id, newStatus) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === id ? { ...booking, status: newStatus } : booking
    );
    
    setBookings(updatedBookings);
    
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  const statusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'confirmed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Confirmed</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case 'completed':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Completed</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  const formatConcerns = (concerns) => {
    if (!concerns) return 'None specified';
    if (typeof concerns === 'string') return concerns;
    return concerns.join(', ');
  };

  const formatConsultationFormat = (format) => {
    switch (format) {
      case 'video-call':
        return 'Video Call';
      case 'whatsapp':
        return 'WhatsApp';
      default:
        return format;
    }
  };

  const formatSkinType = (type) => {
    if (!type) return 'Not specified';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // If viewing a single booking
  if (id && selectedBooking) {
    return (
      <BookingDetail 
        booking={selectedBooking} 
        onBack={() => navigate('/admin/bookings')}
        onStatusChange={updateBookingStatus}
      />
    );
  }

  // Main list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Consultation Bookings</h1>
        <button 
          onClick={() => navigate('/admin/bookings/new')}
          className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
        >
          + New Booking
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  className={`px-3 py-1 text-sm rounded-md capitalize ${
                    activeTab === tab ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{booking.firstName} {booking.lastName}</div>
                      <div className="text-gray-500">{booking.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(booking.consultationDate).toLocaleDateString()}</div>
                      <div>{booking.timeSlot}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatConsultationFormat(booking.consultationFormat)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                        className="text-pink-600 hover:text-pink-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/admin/bookings/edit/${booking.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const BookingDetail = ({ booking, onBack, onStatusChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(booking.notes);

  const handleSave = () => {
    setIsEditing(false);
    onStatusChange(booking.id, booking.status, editedNotes);
  };

  const formatAgeRange = (range) => {
    switch (range) {
      case 'under18': return 'Under 18';
      case '18-24': return '18-24';
      case '25-34': return '25-34';
      case '35-44': return '35-44';
      case '45-54': return '45-54';
      case '55+': return '55+';
      default: return range;
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-gray-500 hover:text-gray-700"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to all bookings
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Booking #{booking.id}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.firstName} {booking.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Age Range</label>
                  <p className="mt-1 text-sm text-gray-900">{formatAgeRange(booking.ageRange)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Consultation Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Service</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.service}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date & Time</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(booking.consultationDate).toLocaleDateString()} at {booking.timeSlot}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Consultation Format</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {booking.consultationFormat === 'video-call' 
                      ? 'Video Call (Zoom/Google Meet)' 
                      : 'WhatsApp'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <select
                      value={booking.status}
                      onChange={(e) => onStatusChange(booking.id, e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Terms Agreed</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {booking.termsAgreed ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Skin Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Skin Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{booking.skinType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Primary Concerns</label>
                <p className="mt-1 text-sm text-gray-900">
                  {Array.isArray(booking.skinConcerns) 
                    ? booking.skinConcerns.join(', ') 
                    : booking.skinConcerns}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-500">Current Products Used</label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
              {booking.currentProducts || 'None specified'}
            </p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-500">Additional Information</label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
              {booking.additionalInfo || 'None provided'}
            </p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-500">Primary Concern Description</label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
              {booking.concern || 'None provided'}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Consultation Notes</h3>
            {isEditing ? (
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                placeholder="Add your notes about this consultation..."
              />
            ) : (
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                {editedNotes || 'No notes added'}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => alert(`Confirmation email sent to ${booking.email}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Send Reminder
            </button>
            <button
              onClick={() => alert(`Summary prepared for ${booking.firstName} ${booking.lastName}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Prepare Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;