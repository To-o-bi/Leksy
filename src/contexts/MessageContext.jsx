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
  const [message, setMessage] = useState(null);
  const timeoutRef = useRef(null);

  /**
   * Hides the current message.
   */
  const hideMessage = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMessage(null);
  }, []);

  /**
   * Shows a message. If the same message is shown in quick succession,
   * it increments a counter instead of creating a new message.
   * @param {string} text - The message content.
   * @param {string} [type='success'] - The message type (e.g., 'success', 'error').
   * @param {number} [duration=3000] - Duration in ms before auto-hiding.
   */
  const showMessage = useCallback((text, type = 'success', duration = 3000) => {
    // Always clear the previous timeout to reset the timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMessage(prevMessage => {
      // If the new message is identical to the current one, just increment the count
      if (prevMessage && prevMessage.text === text && prevMessage.type === type) {
        return { ...prevMessage, count: prevMessage.count + 1 };
      }
      // Otherwise, show a new message
      return { id: Date.now(), text, type, count: 1 };
    });

    // Set a new timeout to automatically hide the message
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        hideMessage();
      }, duration);
    }
  }, [hideMessage]);

  // Convenience methods for different message types
  const success = useCallback((msg, dur) => showMessage(msg, 'success', dur), [showMessage]);
  const error = useCallback((msg, dur) => showMessage(msg, 'error', dur), [showMessage]);
  const warning = useCallback((msg, dur) => showMessage(msg, 'warning', dur), [showMessage]);
  const info = useCallback((msg, dur) => showMessage(msg, 'info', dur), [showMessage]);

  const value = {
    showMessage,
    hideMessage,
    clearMessages: hideMessage, // clearMessages is now an alias for hideMessage
    success,
    error,
    warning,
    info
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
      
      {/* Container for the message, positioned at the top-right */}
      <div className="fixed top-5 right-5 z-[9999] w-full max-w-sm pointer-events-none">
        {message && (
          // Wrapper to re-enable pointer events for the message itself
          <div className="pointer-events-auto">
            <Message
              key={message.id}
              message={message.text}
              type={message.type}
              count={message.count}
              onClose={hideMessage}
            />
          </div>
        )}
      </div>
    </MessageContext.Provider>
  );
};
