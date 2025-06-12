import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Send, RefreshCw, AlertCircle } from 'lucide-react';

const AdminInbox = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Base URL from your API documentation
  const BASE_URL = 'https://leksycosmetics.com';

  // Get auth token from localStorage (matching your auth service)
  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  // Fetch contact submissions from backend
  const fetchContactSubmissions = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/api/admin/fetch-contact-submissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.code === 200) {
        // Transform the backend data to match our component structure
        const transformedMessages = data.submission.map((submission, index) => ({
          id: submission.submission_id || index + 1, // Use submission_id if available
          sender: {
            name: submission.name,
            email: submission.email,
            phone: submission.phone,
            avatar: '/assets/images/avatars/avatar-1.jpg' // Default avatar
          },
          subject: submission.subject,
          preview: submission.message.length > 100 
            ? `${submission.message.substring(0, 100)}...` 
            : submission.message,
          content: submission.message,
          time: submission.created_at ? formatTime(submission.created_at) : 'Unknown time',
          date: submission.created_at ? formatDate(submission.created_at) : 'Today',
          read: submission.read_status || false, // Assuming you might add read status later
          email: submission.email,
          phone: submission.phone
        }));

        setMessages(transformedMessages);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching contact submissions:', err);
      setError(err.message);
    }
  }, [BASE_URL]);

  // Format time for display
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Unknown time';
    }
  };

  // Format date for grouping
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return date.toLocaleDateString();
    } catch {
      return 'Today';
    }
  };

  // Load messages on component mount
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      await fetchContactSubmissions();
      setIsLoading(false);
    };

    loadMessages();
  }, [fetchContactSubmissions]);

  // Refresh messages
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchContactSubmissions();
    setIsRefreshing(false);
  };

  // Handle message selection
  const handleSelectMessage = (message) => {
    if (!message.read) {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === message.id ? { ...msg, read: true } : msg
        )
      );
    }
    setSelectedMessage(message);
  };

  // Handle sending reply (you'll need to implement an email sending endpoint)
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage || isSendingReply) return;
    
    setIsSendingReply(true);
    try {
      // Note: You'll need to implement an email reply endpoint in your backend
      // For now, this will just log the reply
      console.log(`Sending reply to ${selectedMessage.sender.name} (${selectedMessage.sender.email}):`, replyText);
      
      // You could implement this by:
      // 1. Adding an email sending endpoint to your backend
      // 2. Using a service like SendGrid, Mailgun, or native PHP mail
      // 3. Calling something like: POST /api/admin/send-reply
      
      // Placeholder for actual API call:
      /*
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/admin/send-reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: selectedMessage.sender.email,
          to_name: selectedMessage.sender.name,
          subject: `Re: ${selectedMessage.subject}`,
          message: replyText,
          original_submission_id: selectedMessage.id
        })
      });
      */
      
      // Clear the reply input
      setReplyText('');
      
      // Show success message (you could add a toast notification here)
      alert('Reply sent successfully!');
      
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setIsSendingReply(false);
    }
  };

  // Memoized filtered messages
  const filteredMessages = useMemo(() => {
    return messages.filter(message => 
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  // Memoized grouped messages
  const groupedMessages = useMemo(() => {
    return filteredMessages.reduce((groups, message) => {
      const date = message.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
  }, [filteredMessages]);

  // Placeholder for avatar when image fails to load
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Placeholder avatar component
  const AvatarFallback = ({ name }) => (
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-100 text-pink-600 font-medium">
      {getInitials(name)}
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg h-full">
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <button 
            onClick={handleRefresh}
            className="ml-auto text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Inbox Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">Inbox</h1>
          <span className="text-sm text-gray-500">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors duration-200 border border-gray-200"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors duration-200">
            <span>Compose message</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-220px)] gap-4">
        {/* Message List */}
        <div className="w-full md:w-1/2 lg:w-5/12 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-200 focus:ring-pink-500 focus:border-pink-500 text-sm"
                placeholder="Search messages, names, or emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search messages"
              />
            </div>
          </div>

          {/* Messages List with inner scroll */}
          <div className="overflow-y-auto flex-1">
            {Object.keys(groupedMessages).length > 0 ? (
              Object.keys(groupedMessages).map(date => (
                <div key={date}>
                  <h3 className="text-gray-500 text-xs font-medium px-4 py-2">{date}</h3>
                  
                  {groupedMessages[date].map(message => (
                    <div 
                      key={message.id}
                      className={`px-4 py-3 cursor-pointer border-l-2 flex items-center transition-colors ${
                        selectedMessage?.id === message.id 
                          ? 'bg-gray-50 border-l-pink-500' 
                          : message.read 
                            ? 'border-l-transparent hover:bg-gray-50' 
                            : 'border-l-pink-500 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectMessage(message)}
                    >
                      {/* Avatar */}
                      <div className="mr-3">
                        <AvatarFallback name={message.sender.name} />
                      </div>
                      
                      {/* Message content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-sm text-gray-900 truncate">{message.sender.name}</h4>
                          <span className="text-xs text-gray-500">{message.time}</span>
                        </div>
                        <h3 className={`text-sm truncate ${!message.read ? 'font-semibold' : ''}`}>
                          {message.subject}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">{message.preview}</p>
                      </div>
                      
                      {/* Unread indicator */}
                      {!message.read && (
                        <div className="ml-2 w-2 h-2 bg-pink-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                <p className="text-sm">
                  {searchQuery ? 'No messages match your search' : 'No messages found'}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={handleRefresh}
                    className="mt-2 text-pink-500 hover:text-pink-600 text-sm underline"
                  >
                    Refresh messages
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="w-full md:w-1/2 lg:w-7/12 bg-white rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center mb-4">
                  <AvatarFallback name={selectedMessage.sender.name} />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{selectedMessage.sender.name}</h3>
                    <p className="text-gray-500 text-sm">{selectedMessage.sender.email}</p>
                    {selectedMessage.sender.phone && (
                      <p className="text-gray-500 text-sm">{selectedMessage.sender.phone}</p>
                    )}
                    <p className="text-gray-500 text-sm">{selectedMessage.time}</p>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-2">{selectedMessage.subject}</h2>
              </div>
              
              {/* Content with inner scroll */}
              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-gray-700 whitespace-pre-line">{selectedMessage.content}</p>
              </div>

              {/* Reply Section */}
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center rounded-full border border-gray-200 bg-white pl-4 pr-2 py-1">
                  <input 
                    type="text" 
                    className="flex-1 text-sm outline-none border-none"
                    placeholder={`Reply to ${selectedMessage.sender.name.split(' ')[0]}...`} 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                    disabled={isSendingReply}
                    aria-label="Reply message"
                  />
                  <button 
                    onClick={handleSendReply} 
                    disabled={isSendingReply || !replyText.trim()}
                    className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-2 ml-2 transition-colors"
                    aria-label="Send reply"
                  >
                    {isSendingReply ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send or click the send button
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
              <svg className="h-16 w-16 mb-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <p className="text-lg">Select a message to view</p>
              <p className="text-sm text-gray-500 mt-1">
                {messages.length === 0 ? 'No messages available' : `${messages.length} messages loaded`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;