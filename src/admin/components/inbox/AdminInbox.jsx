import React, { useState, useEffect } from 'react';
import { Mail, Search, RefreshCw, ExternalLink, Users, Clock, User, CheckCircle, ArrowLeft, Menu, X } from 'lucide-react';
import ReplyConfirmationModal from './ReplyConfirmationModal'; 
import { contactService, api, ENDPOINTS } from '../../../api';

const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // HTML Entity Decoder Function
  const decodeHtml = (html) => {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate avatar color based on name - maintaining original color scheme
  const getAvatarColor = (name, isRead) => {
    if (!name) return isRead ? 'from-gray-400 to-gray-500' : 'from-pink-500 to-rose-500';
    
    if (isRead) {
      return 'from-gray-400 to-gray-500';
    }
    
    return 'from-pink-500 to-rose-500';
  };

  // API function to mark a contact submission as read
  const markAsRead = async (id) => {
    try {
      // Method 1: Using query parameters (matching your CURL example)
      const response = await api.post(`/admin/mark-as-read?target=contact_submissions&id=${id}`);
      
      if (response.data && response.data.code === 200) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Unexpected response format');
      }
    } catch (error) {
      // Try alternative method with FormData (as in your original code)
      try {
        const formData = new FormData();
        formData.append('target', 'contact_submissions');
        formData.append('id', id);
        
        const response = await api.postFormData('/admin/mark-as-read', formData);
        return response.data;
      } catch (formDataError) {
        console.error('Failed to mark message as read:', formDataError);
        throw formDataError;
      }
    }
  };

  // API function to mark a contact submission as replied
  const markAsReplied = async (id) => {
    try {
      console.log('🚀 Attempting to mark message as replied - ID:', id);
      
      const formData = new FormData();
      formData.append('id', id);
      
      console.log('📤 Sending FormData to /admin/mark-as-replied with ID:', id);
      
      const response = await api.postFormData('/admin/mark-as-replied', formData);
      
      console.log('✅ Mark-as-replied API Response - Full Response Object:', response);
      console.log('📋 Mark-as-replied API Response - JSON Data:', JSON.stringify(response.data, null, 2));
      console.log('🔍 Mark-as-replied API Response - Status:', response.status);
      console.log('📊 Mark-as-replied API Response - Headers:', response.headers);
      
      if (response.data && response.data.code === 200) {
        console.log('✅ Mark-as-replied SUCCESS - Message marked as replied successfully');
        return response.data;
      } else {
        console.log('❌ Mark-as-replied FAILED - Unexpected response format');
        console.log('🔍 Expected code: 200, Received code:', response.data?.code);
        console.log('💬 Response message:', response.data?.message);
        throw new Error(response.data?.message || 'Unexpected response format');
      }
    } catch (error) {
      console.error('💥 Mark-as-replied ERROR - Full error object:', error);
      console.error('💥 Mark-as-replied ERROR - Error message:', error.message);
      console.error('💥 Mark-as-replied ERROR - Error response:', error.response?.data);
      throw error;
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await contactService.fetchSubmissions({ limit: 100 });
      const responseData = result.data || result;

      if (responseData && responseData.code === 200) {
        const submissionsData = responseData.submissions || [];
        
        if (submissionsData && submissionsData.length > 0) {
          const formattedMessages = submissionsData.map((submission, index) => {
            const id = submission.id || submission.submission_id || `msg_${index}`;

            // Handle different possible values for isRead
            let readStatus = false;
            if (submission.isRead === true || submission.isRead === 1 || submission.isRead === '1' || submission.isRead === 'true') {
              readStatus = true;
            }

            return {
              id: id,
              name: decodeHtml(submission.name || 'Unknown'),
              email: submission.email || '',
              phone: submission.phone || '',
              subject: decodeHtml(submission.subject || 'No subject'),
              message: decodeHtml(submission.message || ''),
              created_at: submission.created_at || new Date().toISOString(),
              read: readStatus, // Use properly converted database read status
              replied: submission.replied_by ? true : false, // Check if replied_by field exists
              date: formatDate(submission.created_at),
              time: formatTime(submission.created_at)
            };
          });

          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      } else {
        const errorMsg = responseData?.message || result?.message || 'Failed to load messages - Invalid response format';
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load contact submissions';
      setError(errorMessage);
      setNotification({
        type: 'error',
        message: `Error: ${errorMessage}`
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const today = new Date();
      if (isNaN(date.getTime())) return 'Invalid Date';
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      }
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      return date.toLocaleDateString();
    } catch (e) {
      return 'Unknown';
    }
  };

  

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInSeconds < 60) return 'now';
      if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return '';
    }
  };

  const handleSelectMessage = async (message) => {
    if (!message.read) {
      try {
        // Call API to mark as read in database
        const result = await markAsRead(message.id);
        
        // Update local state
        const updatedMessages = messages.map(msg => 
          msg.id === message.id ? { ...msg, read: true } : msg
        );
        setMessages(updatedMessages);
        
        // Update selected message
        const updatedSelectedMessage = { ...message, read: true };
        setSelectedMessage(updatedSelectedMessage);
        
        setNotification({
          type: 'success',
          message: 'Message marked as read'
        });
        
      } catch (error) {
        setNotification({
          type: 'error',
          message: 'Failed to mark message as read'
        });
        
        // Still set the selected message even if mark as read failed
        setSelectedMessage(message);
      }
    } else {
      setSelectedMessage(message);
    }
  };

  const confirmReply = async () => {
    if (!selectedMessage) return;
    setShowModal(false);
    
    const supportEmail = 'support@leksycosmetics.com';
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&from=${encodeURIComponent(supportEmail)}&to=${encodeURIComponent(selectedMessage.email)}&su=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}&body=${encodeURIComponent(`Hi ${selectedMessage.name},\n\nThank you for your message:\n\n"${selectedMessage.message}"\n\nBest regards,\nLeksy Cosmetics Support Team`)}`;
    
    window.open(gmailUrl, '_blank');
    
    setNotification({ type: 'success', message: 'Opening Gmail to reply...' });
    
    if (!selectedMessage.replied) {
      try {
        // Call API to mark as replied in database
        await markAsReplied(selectedMessage.id);
        
        // Update local state
        const updatedMessages = messages.map(msg => 
          msg.id === selectedMessage.id ? { ...msg, replied: true } : msg
        );
        setMessages(updatedMessages);
        setSelectedMessage(prev => ({ ...prev, replied: true }));
        
        setNotification({
          type: 'success',
          message: 'Message marked as replied and Gmail opened'
        });
        
      } catch (error) {
        setNotification({
          type: 'error',
          message: 'Gmail opened but failed to mark as replied in database'
        });
      }
    }
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredMessages = messages.filter(msg => 
    Object.values(msg).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.read).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm w-full">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <RefreshCw className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
              <div className="absolute inset-0 rounded-full bg-pink-500/20 animate-pulse"></div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-semibold text-gray-800">Loading your inbox</div>
              <div className="text-xs sm:text-sm text-gray-500">Fetching contact messages...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Unable to Load Messages</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={loadMessages}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium flex items-center gap-2 mx-auto transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-100">
      {notification && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 p-3 sm:p-4 rounded-2xl shadow-2xl z-50 transition-all duration-500 transform backdrop-blur-sm border ${
          notification.type === 'success' 
            ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200/50 shadow-emerald-500/20' 
            : 'bg-red-50/90 text-red-800 border-red-200/50 shadow-red-500/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center flex-shrink-0">!</div>
              )}
              <span className="font-medium text-sm sm:text-base">{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(null)} 
              className="ml-4 text-gray-400 hover:text-gray-600 text-lg sm:text-xl transition-colors flex-shrink-0"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ReplyConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmReply}
        email="support@leksycosmetics.com"
      />

      <div className="flex h-screen">
        {/* Mobile Header - Only visible on mobile when message is selected */}
        {selectedMessage && (
          <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200/60 p-4 z-40">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back</span>
              </button>
              <h1 className="text-lg font-semibold text-gray-900 truncate mx-4">
                {selectedMessage.name}
              </h1>
              <div className="w-16"></div> {/* Spacer for centering */}
            </div>
          </div>
        )}

        {/* Sidebar/Message List */}
        <div className={`${
          selectedMessage ? 'hidden lg:flex' : 'flex'
        } w-full lg:w-96 bg-white/70 backdrop-blur-xl border-r border-white/20 flex-col shadow-xl relative`}>
          
          <div className="p-4 sm:p-6 border-b border-gray-100/60 bg-gradient-to-r from-white/50 to-pink-50/30">
            <div className="flex items-center justify-between mb-4 sm:mb-6 mt-4 lg:mt-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Inbox</h1>
                  <p className="text-xs sm:text-sm text-gray-500">Admin Dashboard</p>
                </div>
              </div>
              <button 
                onClick={loadMessages}
                disabled={loading}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-pink-600 transition-colors z-10" />
              <input
                type="text"
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-300/80 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:bg-white/90 focus:border-pink-400/80 transition-all duration-200 shadow-sm"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6 mt-3 sm:mt-4">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-pink-50/60 rounded-lg">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600" />
                <span className="text-xs sm:text-sm font-medium text-pink-700">{stats.total} Total</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-50/60 rounded-lg">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                <span className="text-xs sm:text-sm font-medium text-orange-700">{stats.unread} Unread</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length > 0 ? (
              <div className="p-3 sm:p-4 space-y-2">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="group">
                    <div 
                      className={`p-3 sm:p-4 cursor-pointer rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                        selectedMessage?.id === message.id 
                          ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200/60 shadow-lg' 
                          : 'bg-white/60 backdrop-blur-sm border border-gray-100/60 hover:bg-white/80'
                      }`}
                      onClick={() => handleSelectMessage(message)}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br ${
                            getAvatarColor(message.name, message.read)
                          }`}>
                            <span className="text-xs sm:text-sm font-bold text-white">
                              {getInitials(message.name)}
                            </span>
                          </div>
                          {!message.read && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-semibold truncate ${
                              !message.read ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {message.name}
                            </h4>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0 font-medium">
                              {message.time}
                            </span>
                          </div>
                          
                          <h3 className={`text-sm mb-1 sm:mb-2 truncate ${
                            !message.read ? 'font-semibold text-gray-800' : 'text-gray-600'
                          }`}>
                            {message.subject}
                          </h3>
                          
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {message.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2 sm:mt-3">
                            <div className="flex items-center gap-2">
                              {message.replied && (
                                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span className="hidden sm:inline">Replied</span>
                                  <span className="sm:hidden">✓</span>
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{message.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-gray-400">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-500 mb-2">No messages found</p>
                {searchQuery && (
                  <p className="text-sm text-gray-400 text-center">Try adjusting your search terms</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail View */}
        <div className={`${
          selectedMessage ? 'flex' : 'hidden lg:flex'
        } flex-1 flex-col bg-white/40 backdrop-blur-sm pt-20 lg:pt-0 overflow-y-auto`}>
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="p-4 sm:p-6 border-b border-gray-100/60 bg-gradient-to-r from-white/70 to-pink-50/30 backdrop-blur-sm">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-xl bg-gradient-to-br ${getAvatarColor(selectedMessage.name, selectedMessage.read)}`}>
                    <span className="text-base sm:text-xl font-bold text-white">
                      {getInitials(selectedMessage.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{selectedMessage.name}</h2>
                        <p className="text-sm text-pink-600 font-medium mb-1 truncate">{selectedMessage.email}</p>
                        {selectedMessage.phone && (
                          <p className="text-sm text-gray-500 truncate">{selectedMessage.phone}</p>
                        )}
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <div className="text-sm font-semibold text-gray-700 mb-1">{selectedMessage.date}</div>
                        <div className="text-xs text-gray-500">{selectedMessage.time}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50/80 to-pink-50/60 border-b border-gray-100/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{selectedMessage.subject}</h1>
                  {selectedMessage.replied && (
                    <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-sm font-medium bg-emerald-100/80 text-emerald-700 border border-emerald-200/60 flex-shrink-0">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Replied</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Message Content */}
              <div className="p-4 sm:p-6 bg-white/30">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100/60">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base break-words">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Reply Button */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center">
                  <button 
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium flex items-center gap-2 sm:gap-3 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-base sm:text-lg w-full sm:w-auto justify-center"
                  >
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                    Reply via Gmail
                    <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
                <p className="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 px-4">
                  This will open Gmail in a new tab with a pre-filled reply from support@leksycosmetics.com
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-white/20 to-pink-50/40 backdrop-blur-sm p-4">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto">
                  <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-pink-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">Select a Message</h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">Choose a message from the list to view its contents and reply via Gmail.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;