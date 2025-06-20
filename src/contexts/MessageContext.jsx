// src/contexts/MessageContext.jsx
import React, { createContext, useState, useCallback, useContext, useRef } from 'react';
import Message from '../components/common/Message';

export const MessageContext = createContext();

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  // Use useRef to maintain counter across re-renders without causing re-renders
  const counterRef = useRef(0);

  const showMessage = useCallback((message, type = 'success', duration = 3000) => {
    // Increment counter and get unique ID
    const id = counterRef.current++;
    
    setMessages(prev => [...prev, { id, message, type, duration, show: true }]);
    
    // Auto remove from the messages array after duration + animation time
    if (duration > 0) {
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
      }, duration + 500);
    }
    
    return id;
  }, []); // Remove counter dependency since we're using ref

  const hideMessage = useCallback((id) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, show: false } : msg
    ));
    
    // Remove from array after animation completes
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }, 500);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Convenience methods for different message types
  const success = useCallback((message, duration) => showMessage(message, 'success', duration), [showMessage]);
  const error = useCallback((message, duration) => showMessage(message, 'error', duration), [showMessage]);
  const warning = useCallback((message, duration) => showMessage(message, 'warning', duration), [showMessage]);
  const info = useCallback((message, duration) => showMessage(message, 'info', duration), [showMessage]);

  const value = {
    showMessage,
    hideMessage,
    clearMessages,
    success,
    error,
    warning,
    info
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
      
      {/* Render all active messages */}
      <div className="message-container">
        {messages.map((msg, index) => (
          <div 
            key={msg.id} 
            style={{ 
              position: 'fixed',
              top: `${4 + index * (80 + 8)}px`, // 80px height + 8px gap
              right: '1rem',
              zIndex: 9999 - index,
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <Message
              show={msg.show}
              message={msg.message}
              type={msg.type}
              duration={msg.duration}
              onClose={() => hideMessage(msg.id)}
            />
          </div>
        ))}
      </div>
    </MessageContext.Provider>
  );
};