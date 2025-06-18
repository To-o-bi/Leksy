import React, { useState, useEffect } from 'react';
import { Mail, Search, RefreshCw, Send, Users, Eye, Paperclip, User, CheckCircle, Clock, Star } from 'lucide-react';
import { contactService } from '../../../api';

const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

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
    
    // Use original pink/rose color scheme for unread messages
    return 'from-pink-500 to-rose-500';
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching contact submissions...');
      
      // Pass limit parameter as documented in API
      const result = await contactService.fetchSubmissions({ limit: 100 });
      
      console.log('API Response:', result);
      
      // Handle potential double-wrapped response
      const responseData = result.data || result;
      
      // Check if response structure matches expected format
      if (responseData && responseData.code === 200) {
        // The API returns 'submissions' field (plural) as an array
        const submissionsData = responseData.submissions || [];
        
        console.log('Submissions data:', submissionsData);
        
        if (submissionsData && submissionsData.length > 0) {
          const formattedMessages = submissionsData.map((submission, index) => ({
            id: submission.id || submission.submission_id || `msg_${index}`,
            name: decodeHtml(submission.name || 'Unknown'),
            email: submission.email || '',
            phone: submission.phone || '',
            subject: decodeHtml(submission.subject || 'No subject'),
            message: decodeHtml(submission.message || ''),
            created_at: submission.created_at || new Date().toISOString(),
            read: false,
            replied: false,
            date: formatDate(submission.created_at),
            time: formatTime(submission.created_at)
          }));

          console.log('Formatted messages:', formattedMessages);
          setMessages(formattedMessages);
        } else {
          console.log('No submissions found in response');
          setMessages([]);
        }
      } else {
        const errorMsg = responseData?.message || result?.message || 'Failed to load messages - Invalid response format';
        console.error('API Error:', errorMsg, responseData || result);
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load contact submissions';
      setError(errorMessage);
      console.error('Error loading messages:', err);
      
      // Show detailed error for debugging
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

  // Fixed formatTime function
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffInMilliseconds = now.getTime() - date.getTime();
      
      // Convert to different time units
      const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      // Less than 1 minute (0-59 seconds)
      if (diffInSeconds < 60) {
        return 'now';
      }
      
      // Less than 1 hour (1-59 minutes)
      if (diffInMinutes < 60) {
        return diffInMinutes === 1 ? '1 min ago' : `${diffInMinutes} mins ago`;
      }
      
      // Less than 24 hours (1-23 hours)
      if (diffInHours < 24) {
        return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
      }
      
      // Less than 7 days
      if (diffInDays < 7) {
        return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
      }
      
      // More than 7 days - show actual time
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (e) {
      return '';
    }
  };

  const handleSelectMessage = (message) => {
    if (!message.read) {
      const updatedMessages = messages.map(msg => 
        msg.id === message.id ? { ...msg, read: true } : msg
      );
      setMessages(updatedMessages);
    }
    setSelectedMessage(message);
    setReplyText('');
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    try {
      // Simulate sending reply
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotification({
        type: 'success',
        message: `Reply sent to ${selectedMessage.name}!`
      });
      
      setReplyText('');
      
      // Mark as replied
      const updatedMessages = messages.map(msg => 
        msg.id === selectedMessage.id ? { ...msg, replied: true } : msg
      );
      setMessages(updatedMessages);
      setSelectedMessage(prev => ({ ...prev, replied: true }));
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to send reply'
      });
    }
  };

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filter messages based on search
  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.read).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <RefreshCw className="animate-spin h-8 w-8 text-pink-500" />
              <div className="absolute inset-0 rounded-full bg-pink-500/20 animate-pulse"></div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Loading your inbox</div>
              <div className="text-sm text-gray-500">Fetching contact messages...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-pink-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Messages</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={loadMessages}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto transition-all duration-200 shadow-lg hover:shadow-xl"
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
      {/* Enhanced Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 p-4 rounded-2xl shadow-2xl z-50 transition-all duration-500 transform backdrop-blur-sm border ${
          notification.type === 'success' 
            ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200/50 shadow-emerald-500/20' 
            : 'bg-red-50/90 text-red-800 border-red-200/50 shadow-red-500/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">!</div>
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(null)} 
              className="ml-4 text-gray-400 hover:text-gray-600 text-xl transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Enhanced Left Sidebar */}
        <div className="w-96 bg-white/70 backdrop-blur-xl border-r border-white/20 flex flex-col shadow-xl">
          {/* Modern Header */}
          <div className="p-6 border-b border-gray-100/60 bg-gradient-to-r from-white/50 to-pink-50/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Inbox</h1>
                  <p className="text-sm text-gray-500">Admin Dashboard</p>
                </div>
              </div>
              <button 
                onClick={loadMessages}
                disabled={loading}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            {/* Enhanced Search with better visibility */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-pink-600 transition-colors z-10" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/80 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:bg-white/90 focus:border-pink-400/80 transition-all duration-200 shadow-sm"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Enhanced Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-pink-50/60 rounded-lg">
                <Users className="h-4 w-4 text-pink-600" />
                <span className="text-sm font-medium text-pink-700">{stats.total} Total</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50/60 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">{stats.unread} Unread</span>
              </div>
            </div>
          </div>

          {/* Enhanced Messages List with Initials */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length > 0 ? (
              <div className="p-4 space-y-2">
                {filteredMessages.map((message, index) => (
                  <div key={message.id} className="group">
                    <div 
                      className={`p-4 cursor-pointer rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                        selectedMessage?.id === message.id 
                          ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200/60 shadow-lg' 
                          : 'bg-white/60 backdrop-blur-sm border border-gray-100/60 hover:bg-white/80'
                      }`}
                      onClick={() => handleSelectMessage(message)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br ${
                            getAvatarColor(message.name, message.read)
                          }`}>
                            <span className="text-sm font-bold text-white">
                              {getInitials(message.name)}
                            </span>
                          </div>
                          {!message.read && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
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
                          
                          <h3 className={`text-sm mb-2 truncate ${
                            !message.read ? 'font-semibold text-gray-800' : 'text-gray-600'
                          }`}>
                            {message.subject}
                          </h3>
                          
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {message.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              {message.replied && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                  <CheckCircle className="w-3 h-3" />
                                  Replied
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
              <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-10 w-10 text-gray-300" />
                </div>
                <p className="text-lg font-semibold text-gray-500 mb-2">No messages found</p>
                {searchQuery && (
                  <p className="text-sm text-gray-400">Try adjusting your search terms</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Right Side - Message Detail */}
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
          {selectedMessage ? (
            <>
              {/* Enhanced Message Header with Initials */}
              <div className="p-6 border-b border-gray-100/60 bg-gradient-to-r from-white/70 to-pink-50/30 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl bg-gradient-to-br ${getAvatarColor(selectedMessage.name, selectedMessage.read)}`}>
                    <span className="text-xl font-bold text-white">
                      {getInitials(selectedMessage.name)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedMessage.name}</h2>
                        <p className="text-sm text-pink-600 font-medium mb-1">{selectedMessage.email}</p>
                        {selectedMessage.phone && (
                          <p className="text-sm text-gray-500">{selectedMessage.phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-700 mb-1">{selectedMessage.date}</div>
                        <div className="text-xs text-gray-500">{selectedMessage.time}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Message Subject */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-pink-50/60 border-b border-gray-100/60">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h1>
                  {selectedMessage.replied && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100/80 text-emerald-700 border border-emerald-200/60">
                      <CheckCircle className="w-4 h-4" />
                      Replied
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Message Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-white/30">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/60">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Enhanced Reply Section */}
              <div className="p-6 border-t border-gray-100/60 bg-gradient-to-r from-white/70 to-pink-50/30 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Paperclip className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:bg-white/90 focus:border-pink-300/60 transition-all duration-200 shadow-sm"
                      placeholder={`Reply to ${selectedMessage.name}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && replyText.trim() && handleSendReply()}
                    />
                  </div>
                  <button 
                    onClick={handleSendReply} 
                    disabled={!replyText.trim()}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl p-4 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-white/20 to-pink-50/40 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Mail className="h-12 w-12 text-pink-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Select a Message</h3>
                <p className="text-gray-500 max-w-md">Choose a message from the list to view its contents and reply to the sender.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;