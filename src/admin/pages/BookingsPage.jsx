import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, AlertCircle, Calendar, Phone, Mail, User, CheckCircle } from 'lucide-react';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const bookingsPerPage = 10;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Format time
  const formatTime = (timeRange) => {
    return timeRange || 'Time not specified';
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'in-session':
        return 'bg-blue-100 text-blue-600';
      case 'unheld':
        return 'bg-yellow-100 text-yellow-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Get payment status badge styling
  const getPaymentStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'successful':
        return 'bg-green-100 text-green-600';
      case 'unsuccessful':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Format price
  const formatPrice = (amount) => {
    if (!amount) return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch consultations/bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get admin token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Admin authentication required. Please log in as admin.');
      }

      const filters = {
        limit: 100
      };

      // Use fetch to call the consultations API
      const response = await fetch('https://leksycosmetics.com/api/fetch-consultations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in as admin.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.code === 200) {
        // Handle both coming and past consultations as per API structure
        const comingConsultations = data.coming_consultations || [];
        const pastConsultations = data.past_consultations || [];
        const allConsultations = [...comingConsultations, ...pastConsultations];
        
        const formattedBookings = allConsultations.map((consultation) => ({
          id: consultation.consultation_id || consultation.unique_id,
          uniqueId: consultation.unique_id,
          firstName: consultation.name?.split(' ')[0] || 'Unknown',
          lastName: consultation.name?.split(' ').slice(1).join(' ') || '',
          fullName: consultation.name || 'Unknown Customer',
          email: consultation.email || '',
          phone: consultation.phone || '',
          ageRange: consultation.age_range || '',
          gender: consultation.gender || '',
          skinType: consultation.skin_type || '',
          skinConcerns: consultation.skin_concerns || '',
          currentProducts: consultation.current_skincare_products || '',
          additionalDetails: consultation.additional_details || '',
          channel: consultation.channel || '',
          consultationDate: consultation.date || '',
          timeRange: consultation.time_range || '',
          sessionStatus: consultation.session_held_status || 'unheld',
          paymentStatus: consultation.payment_status?.toLowerCase() || 'unsuccessful',
          amountPaid: consultation.amount_paid || 0,
          amountCalculated: consultation.amount_calculated || 0,
          createdAt: consultation.created_at || '',
          apiRef: consultation.api_ref || '',
          rawData: consultation
        }));
        
        setBookings(formattedBookings);
      } else {
        throw new Error(data?.message || 'Failed to fetch consultation bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      
      let errorMessage = 'Failed to load consultation bookings';
      
      if (err.message.includes('Unauthorized') || 
          err.message.includes('authentication') ||
          err.message.includes('Admin')) {
        errorMessage = 'Admin authentication required. Please ensure you are logged in as an admin to view consultation bookings.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  const filterBookings = () => {
    let filtered = [...bookings];
    
    // Filter by status tab
    if (activeTab !== 'all') {
      if (activeTab === 'upcoming') {
        filtered = filtered.filter(booking => 
          booking.sessionStatus === 'unheld' && 
          booking.paymentStatus === 'successful'
        );
      } else if (activeTab === 'paid') {
        filtered = filtered.filter(booking => booking.paymentStatus === 'successful');
      } else if (activeTab === 'unpaid') {
        filtered = filtered.filter(booking => booking.paymentStatus === 'unsuccessful');
      } else {
        filtered = filtered.filter(booking => booking.sessionStatus === activeTab);
      }
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.id?.toLowerCase().includes(query) ||
        booking.fullName?.toLowerCase().includes(query) ||
        booking.email?.toLowerCase().includes(query) ||
        booking.phone?.toLowerCase().includes(query) ||
        booking.skinConcerns?.toLowerCase().includes(query)
      );
    }
    
    setFilteredBookings(filtered);
  };

  // Update session status
  const updateSessionStatus = async (id, newStatus) => {
    try {
      setIsUpdating(true);
      
      // Update local state immediately for better UX
      setBookings(prev => prev.map(booking => 
        booking.id === id ? { ...booking, sessionStatus: newStatus } : booking
      ));
      
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, sessionStatus: newStatus });
      }
      
      setNotification({
        type: 'success',
        message: `Session status updated to "${newStatus}"`
      });
      
      // Here you would make the actual API call to update the status
      // await updateConsultationStatus(id, newStatus);
      
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Failed to update session status'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // View booking details
  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings when dependencies change
  useEffect(() => {
    filterBookings();
  }, [bookings, activeTab, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  if (loading && bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {error.includes('authentication') || error.includes('Admin') ? 'Authentication Required' : 'Error Loading Bookings'}
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {error.includes('authentication') || error.includes('Admin') ? (
            <button 
              onClick={() => window.location.href = '/admin/login'}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 mr-2"
            >
              Go to Login
            </button>
          ) : (
            <button 
              onClick={fetchBookings}
              className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 text-xl">×</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Consultation Bookings</h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Loading...' : `${filteredBookings.length} of ${bookings.length} consultations`}
            </p>
          </div>
          <button 
            onClick={fetchBookings}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search consultations by ID, name, email, phone, or skin concerns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { key: 'all', label: 'All' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'paid', label: 'Paid' },
              { key: 'unpaid', label: 'Unpaid' },
              { key: 'completed', label: 'Completed' },
              { key: 'in-session', label: 'In Session' },
              { key: 'unheld', label: 'Unheld' }
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 text-sm rounded-md whitespace-nowrap ${
                  activeTab === tab.key 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">ID</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">CUSTOMER</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">CONSULTATION</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">PAYMENT</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">SESSION</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.length > 0 ? currentBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 text-sm font-mono">{booking.id}</td>
                  <td className="py-4">
                    <div>
                      <div className="text-sm font-medium">{booking.fullName}</div>
                      <div className="text-xs text-gray-500">{booking.email}</div>
                      <div className="text-xs text-gray-500">{booking.phone}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div>
                      <div className="text-sm font-medium">{formatDate(booking.consultationDate)}</div>
                      <div className="text-xs text-gray-500">{formatTime(booking.timeRange)}</div>
                      <div className="text-xs text-gray-500 capitalize">{booking.channel}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPaymentStatusStyle(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatPrice(booking.amountPaid)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <select
                      value={booking.sessionStatus}
                      onChange={(e) => updateSessionStatus(booking.id, e.target.value)}
                      disabled={isUpdating}
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer font-medium ${getStatusBadgeStyle(booking.sessionStatus)}`}
                    >
                      <option value="unheld">Unheld</option>
                      <option value="in-session">In Session</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="py-4">
                    <button 
                      className="text-pink-500 border border-pink-500 rounded-lg px-4 py-2 text-sm hover:bg-pink-50 flex items-center"
                      onClick={() => viewBookingDetails(booking)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-lg font-medium">No consultation bookings found</p>
                    <p className="text-sm mt-1">
                      {activeTab !== 'all' ? `No ${activeTab} consultations` : 'No consultation bookings yet'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} consultations
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 flex justify-center items-center rounded border border-gray-200 disabled:opacity-50"
              >
                ‹
              </button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 flex justify-center items-center rounded border border-gray-200 disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold">Consultation Details - {selectedBooking.id}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Information */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900">{selectedBooking.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">{selectedBooking.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">{selectedBooking.phone}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Age Range</label>
                      <p className="text-gray-900">{selectedBooking.ageRange}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gender</label>
                      <p className="text-gray-900 capitalize">{selectedBooking.gender}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Skin Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Skin Type</label>
                      <p className="text-gray-900 capitalize">{selectedBooking.skinType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Skin Concerns</label>
                      <p className="text-gray-900">{selectedBooking.skinConcerns}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Products</label>
                      <p className="text-gray-900">{selectedBooking.currentProducts || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Consultation Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date</label>
                      <p className="text-gray-900">{formatDate(selectedBooking.consultationDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Time</label>
                      <p className="text-gray-900">{formatTime(selectedBooking.timeRange)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Channel</label>
                      <p className="text-gray-900 capitalize">{selectedBooking.channel}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Session Status</label>
                      <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeStyle(selectedBooking.sessionStatus)}`}>
                        {selectedBooking.sessionStatus}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Status</label>
                      <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getPaymentStatusStyle(selectedBooking.paymentStatus)}`}>
                        {selectedBooking.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Amount</label>
                      <p className="text-gray-900">{formatPrice(selectedBooking.amountPaid)}</p>
                    </div>
                  </div>
                </div>

                {selectedBooking.additionalDetails && (
                  <div>
                    <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Additional Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedBooking.additionalDetails}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => alert(`Meeting link would be sent to ${selectedBooking.email}`)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      Send Meeting Link
                    </button>
                    <button
                      onClick={() => alert(`Reminder would be sent to ${selectedBooking.email}`)}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
                    >
                      Send Reminder
                    </button>
                    <button
                      onClick={() => updateSessionStatus(selectedBooking.id, 'completed')}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center justify-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3 pt-4 border-t">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;