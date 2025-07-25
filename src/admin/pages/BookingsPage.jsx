import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for portals
import { useLocation } from 'react-router-dom';
import { Search, Eye, RefreshCw, AlertCircle, Calendar, Phone, Mail, User, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/axios';

const BookingsPage = () => {
  // --- STATE MANAGEMENT ---
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
  const [targetedBookingId, setTargetedBookingId] = useState(null);
  const [meetLink, setMeetLink] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [overrideLink, setOverrideLink] = useState(false);

  const location = useLocation();
  const bookingsPerPage = 10;

  // --- UTILITY & FORMATTING FUNCTIONS ---
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
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

  const formatTime = (timeRange) => timeRange || 'Time not specified';

  const getStatusBadgeStyle = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      'in-session': 'bg-blue-100 text-blue-700 border-blue-200',
      unheld: 'bg-amber-100 text-amber-700 border-amber-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPaymentStatusStyle = (status) => {
    const styles = {
      successful: 'bg-green-100 text-green-600',
      unsuccessful: 'bg-red-100 text-red-600',
    };
    return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  };

  const formatPrice = (amount) => {
    if (!amount) return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // --- API & DATA HANDLING ---
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = api.getToken();
      if (!token) throw new Error('Admin authentication required. Please log in as admin.');

      const response = await api.get('admin/fetch-consultations', { limit: 100 });
      if (response.data?.code === 200) {
        const { coming_consultations = [], past_consultations = [] } = response.data;
        const allConsultations = [...coming_consultations, ...past_consultations];
        const formattedBookings = allConsultations.map((consultation) => {
          const nameParts = consultation.name?.split(' ') || ['Unknown'];
          const primaryId = consultation.unique_id || consultation.consultation_id;
          return {
            id: primaryId,
            databaseId: consultation.id,
            uniqueId: consultation.unique_id,
            consultationId: consultation.consultation_id,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
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
            paymentStatus: consultation.payment_status === 'SUCCESSFUL' || consultation.payment_status === 1 ? 'successful' : 'unsuccessful',
            amountPaid: consultation.amount_paid || 0,
            amountCalculated: consultation.amount_calculated || 0,
            createdAt: consultation.created_at || '',
            bookingDate: consultation.created_at || '',
            meetLink: consultation.meet_link || '',
            apiRef: consultation.api_ref || '',
          };
        });
        setBookings(formattedBookings);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch consultation bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      let errorMessage = 'Failed to load consultation bookings';
      if (err.response?.status === 401 || err.message.includes('authentication')) {
        errorMessage = 'Admin authentication required. Please ensure you are logged in as an admin.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    if (activeTab !== 'all') {
      const filters = {
        upcoming: b => b.sessionStatus === 'unheld' && b.paymentStatus === 'successful',
        paid: b => b.paymentStatus === 'successful',
        unpaid: b => b.paymentStatus === 'unsuccessful',
        default: b => b.sessionStatus === activeTab
      };
      const filterFn = filters[activeTab] || filters.default;
      filtered = filtered.filter(filterFn);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(b => [b.id, b.fullName, b.email, b.phone, b.skinConcerns].some(f => f?.toLowerCase().includes(query)));
    }

    filtered.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    setFilteredBookings(filtered);
  };

  const updateSessionStatus = async (id, newStatus) => {
    try {
      setIsUpdating(true);
      const booking = bookings.find(b => b.id === id);
      if (!booking) throw new Error('Booking not found');

      const formData = new FormData();
      formData.append('id', booking.databaseId);
      formData.append('consultation_id', booking.id);
      formData.append('session_held_status', newStatus);

      const response = await api.post('admin/update-consultation', formData);
      if (response.data?.code === 200) {
        const updated = response.data.consultation;
        const updateFn = b => (b.id === id ? { ...b, sessionStatus: updated.session_held_status || newStatus } : b);
        setBookings(prev => prev.map(updateFn));
        if (selectedBooking?.id === id) setSelectedBooking(prev => ({ ...prev, sessionStatus: updated.session_held_status || newStatus }));
        setNotification({ type: 'success', message: `Session status updated to "${newStatus}"` });
      } else {
        throw new Error(response.data?.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating session status:', err);
      setNotification({ type: 'error', message: err.message || 'Update failed.' });
      fetchBookings();
    } finally {
      setIsUpdating(false);
    }
  };

  const sendMeetingLink = async (bookingId, override) => {
    if (!meetLink.trim()) {
      setNotification({ type: 'error', message: 'Meeting link cannot be empty.' });
      return;
    }
    setIsSendingLink(true);
    setNotification(null);
    try {
      const formData = new FormData();
      formData.append('consultation_id', bookingId);
      formData.append('meet_link', meetLink);
      formData.append('override', String(override));

      const response = await api.post('admin/send_consultation_link', formData);
      if (response.data?.code === 200) {
        const updated = response.data.consultation;
        const updateFn = b => (b.id === bookingId ? { ...b, meetLink: updated.meet_link || '' } : b);
        setBookings(prev => prev.map(updateFn));
        if (selectedBooking?.id === bookingId) setSelectedBooking(prev => ({ ...prev, meetLink: updated.meet_link || '' }));
        setNotification({ type: 'success', message: response.data.message || 'Meeting link sent!' });
      } else {
        throw new Error(response.data?.message || 'Failed to send link');
      }
    } catch (err) {
      console.error('Error sending meeting link:', err);
      setNotification({ type: 'error', message: err.message || 'Failed to send link.' });
    } finally {
      setIsSendingLink(false);
    }
  };

  // --- UI & MODAL HANDLERS ---
  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setMeetLink(booking.meetLink || '');
    setShowModal(true);
    setOverrideLink(false);
  };

  const sendReminder = (email) => setNotification({ type: 'success', message: `Reminder sent to ${email}` });
  
  const closeModal = () => {
    setShowModal(false);
    setMeetLink('');
    setSelectedBooking(null);
  };

  // --- LIFECYCLE & EFFECTS ---
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => { fetchBookings(); }, []);
  useEffect(() => { filterAndSortBookings(); }, [bookings, activeTab, searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookingId = params.get('bookingId') || params.get('highlight');
    if (bookingId) {
      setTargetedBookingId(bookingId);
      setTimeout(() => {
        setTargetedBookingId(null);
        window.history.replaceState({}, '', window.location.pathname);
      }, 5000);
    }
  }, [location.search]);

  // --- RENDER LOGIC & VARS ---
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const statusTabs = [
    { key: 'all', label: 'All' }, { key: 'upcoming', label: 'Upcoming' }, { key: 'paid', label: 'Paid' },
    { key: 'unpaid', label: 'Unpaid' }, { key: 'completed', label: 'Completed' },
    { key: 'in-session', label: 'In Session' }, { key: 'unheld', label: 'Unheld' }
  ];

  if (loading && bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6"></div><div className="space-y-4">{Array.from({ length: 5 }, (_, i) => (<div key={i} className="h-12 bg-gray-200 rounded w-full"></div>))}</div></div></div>
    );
  }

  if (error && bookings.length === 0) {
    const isAuthError = error.includes('authentication') || error.includes('Admin');
    return (
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm"><div className="text-center py-12"><AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-800 mb-2">{isAuthError ? 'Authentication Required' : 'Error Loading Bookings'}</h3><p className="text-gray-600 mb-4 max-w-md mx-auto">{error}</p><button onClick={isAuthError ? () => window.location.href = '/admin/login' : fetchBookings} className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600">{isAuthError ? 'Go to Login' : 'Try Again'}</button></div></div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && ReactDOM.createPortal(
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-[100] w-11/12 max-w-sm ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex items-center justify-between">
            <span className="break-words">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 text-xl flex-shrink-0">×</button>
          </div>
        </div>,
        document.body
      )}

      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Consultation Bookings</h1>
            <p className="text-gray-600 mt-1">{loading ? 'Loading...' : `${filteredBookings.length} of ${bookings.length} consultations`}</p>
          </div>
          <button 
            onClick={fetchBookings} 
            className="bg-pink-100 hover:bg-pink-200 text-pink-600 p-2 rounded-full flex items-center justify-center transition-colors" 
            disabled={loading}
            aria-label="Refresh bookings"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by ID, name, email, phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500" />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
            {statusTabs.map((tab) => (<button key={tab.key} className={`px-4 py-2 text-sm rounded-md whitespace-nowrap flex-shrink-0 ${activeTab === tab.key ? 'bg-pink-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}>{tab.label}</button>))}
          </div>
        </div>

        {/* --- Responsive Bookings List --- */}
        <div className="w-full">
          {/* Desktop Table Headers */}
          <div className="hidden md:grid md:grid-cols-[1fr,1.5fr,2fr,1.5fr,1.5fr,1.5fr,1fr] gap-4 border-b border-gray-200 pb-3">
            {['ID', 'BOOKING DATE', 'CUSTOMER', 'CONSULTATION', 'PAYMENT', 'SESSION', 'ACTION'].map(h => <div key={h} className="text-sm font-medium text-gray-500 uppercase">{h}</div>)}
          </div>
          
          {/* Bookings List (Cards on mobile, table rows on desktop) */}
          <div className="space-y-4 md:space-y-0">
            {currentBookings.length > 0 ? currentBookings.map((booking) => (
              <div key={booking.id} className={`md:grid md:grid-cols-[1fr,1.5fr,2fr,1.5fr,1.5fr,1.5fr,1fr] md:gap-4 md:items-center transition-colors rounded-lg md:rounded-none p-4 md:p-0 border md:border-0 md:border-t border-gray-200 hover:bg-gray-50 ${targetedBookingId === booking.id || targetedBookingId === booking.uniqueId ? 'bg-pink-50' : ''}`}>
                
                {/* Mobile labels are hidden on medium screens and up (md:hidden) */}
                <div className="flex justify-between items-center md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden">ID</span>
                  <span className="text-sm font-mono text-pink-600">{booking.id}</span>
                </div>

                <div className="flex justify-between items-center md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden">Booking Date</span>
                  <div className="flex items-center text-right md:text-left"><Clock className="h-4 w-4 mr-1 text-gray-400 hidden md:block" /><div><div className="text-sm font-medium">{formatDate(booking.bookingDate)}</div><div className="text-xs text-gray-500">{booking.bookingDate ? formatDateTime(booking.bookingDate).split(', ')[1] : ''}</div></div></div>
                </div>

                <div className="flex justify-between items-start md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden mt-1">Customer</span>
                  <div className="text-right md:text-left">
                    <div className="text-sm font-medium">{booking.fullName}</div>
                    <div className="text-xs text-gray-500 truncate">{booking.email}</div>
                    <div className="text-xs text-gray-500">{booking.phone}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden">Consultation</span>
                  <div className="text-right md:text-left">
                    <div className="text-sm font-medium">{formatDate(booking.consultationDate)}</div>
                    <div className="text-xs text-gray-500">{formatTime(booking.timeRange)}</div>
                    <div className="text-xs text-gray-500 capitalize">{booking.channel}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden">Payment</span>
                  <div className="text-right md:text-left">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPaymentStatusStyle(booking.paymentStatus)}`}>{booking.paymentStatus}</span>
                    <div className="text-sm font-bold text-green-600 mt-1">{formatPrice(booking.amountPaid)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden">Session</span>
                  <div className="flex justify-end md:justify-start">
                    <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border-2 capitalize min-w-[100px] justify-center shadow-sm ${getStatusBadgeStyle(booking.sessionStatus)}`}>
                      {booking.sessionStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 py-1 md:py-4">
                  <button className="w-full text-pink-500 border border-pink-500 rounded-lg px-4 py-2 text-sm hover:bg-pink-50 flex items-center justify-center" onClick={() => viewBookingDetails(booking)}><Eye className="h-4 w-4 mr-1" /> View Details</button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-gray-500"><div className="text-6xl mb-4">📅</div><p>No bookings found for this filter.</p></div>
            )}
          </div>
        </div>

        {totalPages > 1 && (<div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4"><div className="text-sm text-gray-500">Showing {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length}</div><div className="flex items-center space-x-2"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 flex items-center justify-center rounded border hover:bg-gray-100 disabled:opacity-50">‹</button><span className="text-sm">Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 flex items-center justify-center rounded border hover:bg-gray-100 disabled:opacity-50">›</button></div></div>)}
      </div>

      {showModal && selectedBooking && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold">Consultation - {selectedBooking.id}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold border-b pb-2 mb-4 flex items-center"><User className="h-5 w-5 mr-2" />Customer Information</h4>
                  <div className="space-y-3">{[{ label: 'Full Name', value: selectedBooking.fullName }, { label: 'Email', value: selectedBooking.email, icon: Mail }, { label: 'Phone', value: selectedBooking.phone, icon: Phone }, { label: 'Age Range', value: selectedBooking.ageRange }, { label: 'Gender', value: selectedBooking.gender, capitalize: true }].map(({ label, value, icon: Icon, capitalize }) => (<div key={label}><label className="text-sm font-medium text-gray-500">{label}</label><div className="flex items-center">{Icon && <Icon className="h-4 w-4 mr-2 text-gray-400" />}<p className={`text-gray-900 ${capitalize ? 'capitalize' : ''}`}>{value}</p></div></div>))}</div>
                </div>
                <div>
                  <h4 className="font-semibold border-b pb-2 mb-4">Skin Information</h4>
                  <div className="space-y-3">{[{ label: 'Skin Type', value: selectedBooking.skinType, capitalize: true }, { label: 'Skin Concerns', value: selectedBooking.skinConcerns }, { label: 'Current Products', value: selectedBooking.currentProducts || 'N/A' }].map(({ label, value, capitalize }) => (<div key={label}><label className="text-sm font-medium text-gray-500">{label}</label><p className={`text-gray-900 break-words ${capitalize ? 'capitalize' : ''}`}>{value}</p></div>))}</div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold border-b pb-2 mb-4 flex items-center"><Calendar className="h-5 w-5 mr-2" />Consultation Details</h4>
                  <div className="space-y-3">{[{ label: 'Booking Date', value: formatDateTime(selectedBooking.bookingDate), icon: Clock }, { label: 'Consultation Date', value: formatDate(selectedBooking.consultationDate) }, { label: 'Time', value: formatTime(selectedBooking.timeRange) }, { label: 'Channel', value: selectedBooking.channel, capitalize: true }, { label: 'Session Status', value: selectedBooking.sessionStatus, isBadge: true, style: getStatusBadgeStyle }, { label: 'Payment Status', value: selectedBooking.paymentStatus, isBadge: true, style: getPaymentStatusStyle }, { label: 'Amount', value: formatPrice(selectedBooking.amountPaid), isPrice: true }].map(({ label, value, icon: Icon, capitalize, isBadge, style, isPrice }) => (<div key={label}><label className="text-sm font-medium text-gray-500">{label}</label>{isBadge ? (<span className={`inline-block text-xs px-3 py-1 rounded-full font-medium capitalize ${style(value)}`}>{value}</span>) : isPrice ? (<p className="text-lg font-bold text-green-600">{value}</p>) : (<div className="flex items-center">{Icon && <Icon className="h-4 w-4 mr-2 text-gray-400" />}<p className={`text-gray-900 ${capitalize ? 'capitalize' : ''}`}>{value}</p></div>)}</div>))}</div>
                </div>
                {selectedBooking.additionalDetails && (<div><h4 className="font-semibold border-b pb-2 mb-4">Additional Details</h4><div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-700 whitespace-pre-wrap">{selectedBooking.additionalDetails}</p></div></div>)}
                <div>
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Actions</h4>
                  <div className="space-y-3">
                    {selectedBooking.sessionStatus === 'completed' ? (
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg"><div className="flex"><div className="flex-shrink-0"><CheckCircle className="h-5 w-5 text-green-400" /></div><div className="ml-3"><p className="text-sm text-green-700">This consultation has been completed. Actions are disabled.</p></div></div></div>
                    ) : (
                      <>
                        {selectedBooking.channel?.toLowerCase() !== 'whatsapp' && (
                          <div className="space-y-2">
                            <label htmlFor="meetLink" className="text-sm font-medium text-gray-700">Meeting Link</label>
                            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                              <input id="meetLink" type="url" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} placeholder="https://meet.google.com/..." className="flex-grow px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500" disabled={isSendingLink} />
                              <button onClick={() => { const shouldOverride = !selectedBooking.meetLink || overrideLink; sendMeetingLink(selectedBooking.id, shouldOverride); }} disabled={isSendingLink || !meetLink.trim()} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center justify-center disabled:bg-blue-300">
                                {isSendingLink ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Send'}
                              </button>
                            </div>
                            {selectedBooking.meetLink && (
                              <div className="pt-2">
                                <p className="text-xs text-gray-500">Current link: <a href={selectedBooking.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{selectedBooking.meetLink}</a></p>
                                <div className="flex items-center mt-2">
                                  <input id="override" type="checkbox" checked={overrideLink} onChange={(e) => setOverrideLink(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                                  <label htmlFor="override" className="ml-2 block text-sm text-gray-900">Resend and override link</label>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <button onClick={() => sendReminder(selectedBooking.email)} className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm">Send Reminder</button>
                        <button onClick={() => updateSessionStatus(selectedBooking.id, 'completed')} className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 mr-2" /> Mark as Completed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end"><button onClick={closeModal} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Close</button></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default BookingsPage;
