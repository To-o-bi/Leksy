import React, { useState, useMemo } from 'react';
import { Send } from 'lucide-react';

const AdminInbox = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  
  // Sample data for inbox messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: {
        name: 'Oluwaseyi Olamide',
        avatar: '/assets/images/avatars/avatar-1.jpg'
      },
      subject: 'Best Products for Dry Skin?',
      preview: 'Hi, I struggle with dry skin, and I\'m looking for a hydrating serum. What do you think I should add to my...',
      content: 'Hi, I struggle with dry skin, and I\'m looking for a hydrating serum. What do you think I should add to my routine? I\'ve been using the Basic Moisturizer but it doesn\'t seem to be enough for my skin type. Any recommendations would be greatly appreciated!',
      time: '7 mins ago',
      date: 'Today',
      read: false
    },
    {
      id: 2,
      sender: {
        name: 'Cynthia A.',
        avatar: '/assets/images/avatars/avatar-1.jpg'
      },
      subject: 'Wrong Item Received',
      preview: 'Hello, I just received my order, but unfortunately, I got a different product than what I originally I had placed...',
      content: 'Hello, I just received my order, but unfortunately, I got a different product than what I originally ordered. I had placed an order for the Hydrating Face Serum, but instead, I received the Brightening Glow Cream. I double-checked my order confirmation email, and it clearly states that I was supposed to receive the serum.\n\nI\'d really appreciate it if you could look into this and let me know how we can resolve the issue. Should I return the incorrect product, or will you be sending a replacement? Please let me know the next steps as soon as possible. Thank you!',
      time: '10 mins ago',
      date: 'Today',
      read: true
    },
    {
      id: 3,
      sender: {
        name: 'Jane Doe',
        avatar: '/assets/images/avatars/avatar-1.jpg'
      },
      subject: 'Best Products for Dry Skin?',
      preview: 'Hi, I struggle with dry skin, and I\'m looking for a hydrating serum. What do you think I should add to my...',
      content: 'Hi, I struggle with dry skin, and I\'m looking for a hydrating serum. What do you think I should add to my routine? I\'ve been using the Basic Moisturizer but it doesn\'t seem to be enough for my skin type. Any recommendations would be greatly appreciated!',
      time: '27 mins ago',
      date: 'Today',
      read: true
    },
    {
      id: 4,
      sender: {
        name: 'Funmilayo Williams',
        avatar: '/assets/images/avatars/avatar-1.jpg'
      },
      subject: 'Order #43215 Inquiry',
      preview: 'I placed an order last week (#43215) and was wondering when it will be shipped. The tracking information hasn\'t...',
      content: 'I placed an order last week (#43215) and was wondering when it will be shipped. The tracking information hasn\'t been updated. Can you please check on this for me? I need these products for an upcoming event.',
      time: '27 mins ago',
      date: 'Today',
      read: true
    }
  ]);

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

  // Memoized filtered messages
  const filteredMessages = useMemo(() => {
    return messages.filter(message => 
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    // Here you would typically send the reply to an API
    console.log(`Sending reply to ${selectedMessage.sender.name}: ${replyText}`);
    
    // Clear the reply input
    setReplyText('');
  };

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

  return (
    <div className="bg-gray-50 p-6 rounded-lg h-full">
      {/* Inbox Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Inbox</h1>
        <button className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors duration-200">
          <span>Compose message</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
        </button>
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
                placeholder="Search"
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
                      className={`px-4 py-3 cursor-pointer border-l-2 flex items-center ${
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
                        <img 
                          src={message.sender.avatar} 
                          alt=""
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {/* <AvatarFallback name={message.sender.name} style={{ display: 'none' }} /> */}
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
                <p className="text-sm">No messages match your search</p>
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
                  <img 
                    src={selectedMessage.sender.avatar} 
                    alt=""
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  {/* <AvatarFallback name={selectedMessage.sender.name} style={{ display: 'none' }} /> */}
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedMessage.sender.name}</h3>
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
                    aria-label="Reply message"
                  />
                  <button 
                    onClick={handleSendReply} 
                    className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-2 ml-2"
                    aria-label="Send reply"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
              <svg className="h-16 w-16 mb-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <p className="text-lg">Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;