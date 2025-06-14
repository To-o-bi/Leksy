import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, AlertCircle, Calendar, Phone, Mail, User } from 'lucide-react';
import { contactService } from '../../api/services';

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
  
  const bookingsPerPage = 10;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'completed':
        return 'bg-blue-100 text-blue-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Fetch bookings (using contact submissions as consultation bookings)
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.fetchSubmissions();
      
      if (response && response.code === 200) {
        const bookingsData = response.submissions || [];
        
        // Format contact submissions as consultation bookings
        const formattedBookings = bookingsData.map((submission, index) => ({
          id: submission.id || `BK-${1000 + index}`,
          firstName: submission.name?.split(' ')[0] || 'Unknown',
          lastName: submission.name?.split(' ').slice(1).join(' ') || '',
          fullName: submission.name || 'Unknown Customer',
          email: submission.email || '',
          phone: submission.phone || '',
          subject: submission.subject || 'General Consultation',
          message: submission.message || '',
          service: submission.subject || 'Skincare Consultation',
          consultationDate: submission.created_at || new Date().toISOString(),
          status: submission.status || 'pending',
          concern: submission.message || 'No specific concern mentioned',
          notes: '',
          createdAt: submission.created_at,
          rawData: submission
        }));
        
        setBookings(formattedBookings);
      } else {
        throw new Error(response?.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  const filterBookings = () => {
    let filtered = [...bookings];
    
    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(booking => booking.status === activeTab);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.id?.toLowerCase().includes(query) ||
        booking.fullName?.toLowerCase().includes(query) ||
        booking.email?.toLowerCase().includes(query) ||
        booking.phone?.toLowerCase().includes(query) ||
        booking.service?.toLowerCase().includes(query)
      );
    }
    
    setFilteredBookings(filtered);
  };

  // Update booking status (placeholder - you'd need to implement this API endpoint)
  const updateBookingStatus = async (id, newStatus) => {
    try {
      // This would be your API call to update booking status
      // await bookingService.updateStatus(id, newStatus);
      
      setBookings(prev => prev.map(booking => 
        booking.id === id ? { ...booking, status: newStatus } : booking
      ));
      
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
      
      setNotification({
        type: 'success',
        message: `Booking status updated to "${newStatus}"`
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Failed to update booking status'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // View booking details
  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

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
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchBookings}
            className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600"
          >
            Try Again
          </button>
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
              {loading ? 'Loading...' : `${filteredBookings.length} of ${bookings.length} bookings`}
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
              placeholder="Search bookings by ID, name, email, phone, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex space-x-2 overflow-x-auto">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm rounded-md capitalize whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
              >
                {tab} {tab !== 'all' && `(${bookings.filter(b => b.status === tab).length})`}
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
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">SERVICE</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">DATE</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">STATUS</th>
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
                  <td className="py-4 text-sm">{booking.service}</td>
                  <td className="py-4 text-sm">{formatDate(booking.consultationDate)}</td>
                  <td className="py-4">
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer font-medium ${getStatusBadgeStyle(booking.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
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
                    <p className="text-lg font-medium">No bookings found</p>
                    <p className="text-sm mt-1">
                      {activeTab !== 'all' ? `No ${activeTab} bookings` : 'No consultation bookings yet'}
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
              Showing {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} bookings
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
              <h3 className="text-xl font-semibold">Booking Details - {selectedBooking.id}</h3>
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
                        <p className="text-gray-900">{selectedBooking.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Consultation Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Service Type</label>
                      <p className="text-gray-900">{selectedBooking.service}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Subject</label>
                      <p className="text-gray-900">{selectedBooking.subject}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date Submitted</label>
                      <p className="text-gray-900">{formatDate(selectedBooking.consultationDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeStyle(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Content */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Customer Message</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedBooking.message || 'No message provided'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Consultation Notes</h4>
                  <textarea
                    value={selectedBooking.notes}
                    onChange={(e) => setSelectedBooking({ ...selectedBooking, notes: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Add your consultation notes here..."
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => alert(`Confirmation email would be sent to ${selectedBooking.email}`)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      Send Confirmation Email
                    </button>
                    <button
                      onClick={() => alert(`Reminder would be sent to ${selectedBooking.email}`)}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
                    >
                      Send Reminder
                    </button>
                    <button
                      onClick={() => alert('Consultation summary would be generated')}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                    >
                      Generate Summary
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
              <button 
                onClick={() => {
                  // Save notes functionality would go here
                  setNotification({ type: 'success', message: 'Notes saved successfully' });
                  setTimeout(() => setNotification(null), 3000);
                }}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;