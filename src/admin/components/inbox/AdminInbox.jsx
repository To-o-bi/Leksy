import React, { useState, useEffect } from 'react';
import { Mail, Search, RefreshCw, Send, Users, Eye } from 'lucide-react';
import { contactService } from '../../../api';

const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

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
            name: submission.name || 'Unknown',
            email: submission.email || '',
            phone: submission.phone || '',
            subject: submission.subject || 'No subject',
            message: submission.message || '',
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

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
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
      // Simulate sending reply (you'll need to implement actual email sending)
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
      <div className="bg-gray-50 p-6 rounded-lg h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin h-5 w-5 text-blue-500" />
          <span>Loading contact messages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg h-full flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4 text-4xl">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed to Load Messages</h3>
        <p className="text-gray-600 mb-4 text-center max-w-md">{error}</p>
        <button 
          onClick={loadMessages}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg h-full">
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)} 
              className="ml-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-500" />
            Contact Inbox
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Total: {stats.total}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Unread: {stats.unread}
            </span>
          </div>
        </div>
        <button 
          onClick={loadMessages}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Content */}
      <div className="flex gap-4 h-[calc(100vh-220px)]">
        
        {/* Message List */}
        <div className="w-1/2 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Messages */}
          <div className="overflow-y-auto flex-1">
            {filteredMessages.length > 0 ? (
              filteredMessages.map(message => (
                <div 
                  key={message.id}
                  className={`p-4 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  } ${!message.read ? 'bg-blue-25' : ''}`}
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-sm ${!message.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {message.name}
                    </h4>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                  <h3 className={`text-sm mb-1 ${!message.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {message.subject}
                  </h3>
                  <p className="text-xs text-gray-600 truncate mb-1">{message.message}</p>
                  <p className="text-xs text-gray-500">{message.email}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    {message.replied && <span className="text-xs text-green-600 font-medium">✓ Replied</span>}
                    <span className="text-xs text-gray-400">{message.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <Mail className="h-12 w-12 mb-4 text-gray-400" />
                <p className="text-lg font-medium">No messages found</p>
                {searchQuery && (
                  <p className="text-sm mt-2">Try adjusting your search terms</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="w-1/2 bg-white rounded-lg shadow-sm flex flex-col">
          {selectedMessage ? (
            <>
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedMessage.name}</h3>
                    <p className="text-gray-600 text-sm">{selectedMessage.email}</p>
                    {selectedMessage.phone && (
                      <p className="text-gray-600 text-sm">{selectedMessage.phone}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{selectedMessage.date}</p>
                    <p>{selectedMessage.time}</p>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedMessage.subject}</h2>
                {selectedMessage.replied && (
                  <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Replied
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Reply */}
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center rounded-lg border bg-white shadow-sm">
                  <input 
                    type="text" 
                    className="flex-1 px-4 py-3 border-none outline-none rounded-l-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`Reply to ${selectedMessage.name}...`} 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && replyText.trim() && handleSendReply()}
                  />
                  <button 
                    onClick={handleSendReply} 
                    disabled={!replyText.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-r-lg px-4 py-3 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Mail className="h-16 w-16 mb-4" />
              <p className="text-lg">Select a message to view</p>
              <p className="text-sm mt-2">Choose a message from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;