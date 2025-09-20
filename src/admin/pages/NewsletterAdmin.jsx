import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Send, Download, X } from 'lucide-react';
import { newsletterService } from '../../api/NewsletterService';
import ComposeEmailModal from './newsletterAd/ComposeEmailModal';
import DeleteConfirmationModal from './newsletterAd/DeleteConfirmationModal';
import NewsletterStats from './newsletterAd/NewsletterStats';
import SubscribersTable from './newsletterAd/SubscribersTable';

// Toast hook implementation
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = 'default' }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toast, toasts, removeToast };
};

// Toast component
const Toast = ({ toast, onDismiss }) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200 text-gray-800',
    destructive: 'bg-red-100 border-red-200 text-red-800',
    success: 'bg-green-100 border-green-200 text-green-800',
    warning: 'bg-yellow-100 border-yellow-200 text-yellow-800',
  };

  return (
    <div className={`${variantClasses[toast.variant]} rounded-md shadow-lg p-4 max-w-xs w-full relative mb-2`} role="alert">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
      <h3 className="font-medium pr-6">{toast.title}</h3>
      {toast.description && <p className="text-sm mt-1 pr-6">{toast.description}</p>}
    </div>
  );
};

const NewsletterAdmin = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, recent: 0, thisMonth: 0 });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    email: '',
    isMultiple: false,
    count: 0,
    isLoading: false
  });
  const [composeModal, setComposeModal] = useState(false);
  const { toast, toasts, removeToast } = useToast();

  // Utility functions
  const updateSubscribersList = (newData) => {
    const sortedData = newData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setSubscribers(sortedData);
    const stats = newsletterService.calculateStats(sortedData);
    setStats(stats);
  };

  const showToast = (type, title, description) => {
    toast({ title, description, variant: type });
  };

  // API handlers
  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const result = await newsletterService.fetchSubscribers();
      if (result.success) {
        updateSubscribersList(result.subscribers || []);
      } else {
        showToast('destructive', 'Error', result.message || 'Failed to fetch subscribers');
      }
    } catch (error) {
      showToast('destructive', 'Error', error.message || 'Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubscriber = async () => {
    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await newsletterService.removeSubscriber(deleteModal.email);
      if (result.success) {
        const newData = subscribers.filter(sub => sub.email !== deleteModal.email);
        updateSubscribersList(newData);
        showToast('success', 'Success', result.message || 'Subscriber removed successfully!');
      } else {
        showToast('destructive', 'Error', result.message || 'Failed to remove subscriber');
      }
    } catch (error) {
      showToast('destructive', 'Error', error.message || 'Failed to remove subscriber');
    } finally {
      setDeleteModal({ isOpen: false, email: '', isMultiple: false, count: 0, isLoading: false });
    }
  };

  const handleBulkRemove = async () => {
    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    try {
      const results = await Promise.all(
        selectedSubscribers.map(email => newsletterService.removeSubscriber(email))
      );
      
      const successfulRemovals = results.filter(r => r.success).length;
      if (successfulRemovals > 0) {
        const newData = subscribers.filter(sub => !selectedSubscribers.includes(sub.email));
        updateSubscribersList(newData);
        setSelectedSubscribers([]);
        showToast('success', 'Success', `${successfulRemovals} subscribers removed successfully!`);
      }

      const failedRemovals = results.filter(r => !r.success);
      if (failedRemovals.length > 0) {
        const errorMessages = failedRemovals.map(r => r.message).join(', ');
        showToast('destructive', 'Partial Error', `Could not remove ${failedRemovals.length} subscribers. Errors: ${errorMessages}`);
      }
    } catch (error) {
      showToast('destructive', 'Error', error.message || 'Failed to remove subscribers');
    } finally {
      setDeleteModal({ isOpen: false, email: '', isMultiple: false, count: 0, isLoading: false });
    }
  };

  const handleSendBulkEmail = async (emailData) => {
    try {
      const result = await newsletterService.sendBulkEmail(emailData);
      if (result.success) {
        showToast('success', 'Success', result.message || 'Newsletter sent successfully!');
        setSelectedSubscribers([]);
      } else {
        showToast('destructive', 'Error', result.message || 'Failed to send newsletter');
      }
    } catch (error) {
      showToast('destructive', 'Error', error.message || 'Failed to send newsletter');
    }
  };

  const exportSubscribers = () => {
    const success = newsletterService.exportToCSV(subscribers);
    if (success) {
      showToast('success', 'Success', 'Subscribers exported successfully!');
    } else {
      showToast('destructive', 'Error', 'Failed to export subscribers');
    }
  };

  // Effects
  useEffect(() => {
    // Note: Remove this check if api.getToken() doesn't exist in your setup
    // const token = api.getToken();
    // if (!token) {
    //   showToast('destructive', 'Authentication Required', 'Please login to access this page');
    //   setLoading(false);
    // } else {
      fetchSubscribers();
    // }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        <span className="mt-4 text-gray-600">Loading subscribers...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 w-full max-w-xs px-4 sm:px-0">
        {toasts.map(toastItem => (
          <Toast key={toastItem.id} toast={toastItem} onDismiss={() => removeToast(toastItem.id)} />
        ))}
      </div>

      {/* Compose Modal */}
      <ComposeEmailModal
        isOpen={composeModal}
        onClose={() => setComposeModal(false)}
        onSend={handleSendBulkEmail}
        subscribers={subscribers}
        selectedEmails={selectedSubscribers}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, email: '', isMultiple: false, count: 0, isLoading: false })}
        onConfirm={deleteModal.isMultiple ? handleBulkRemove : handleRemoveSubscriber}
        subscriberEmail={deleteModal.email}
        isMultiple={deleteModal.isMultiple}
        count={deleteModal.count}
        isLoading={deleteModal.isLoading}
      />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-7 h-7 text-pink-500" />
            <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setComposeModal(true)}
              className="flex items-center justify-center w-full sm:w-auto space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <Send className="w-4 h-4" />
              <span>Send Newsletter</span>
            </button>
            <button
              onClick={exportSubscribers}
              className="flex items-center justify-center w-1/2 sm:w-auto space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={fetchSubscribers}
              className="flex items-center justify-center w-[calc(50%-0.5rem)] sm:w-auto space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Component */}
        <NewsletterStats stats={stats} />

        {/* Subscribers Table Component */}
        <SubscribersTable
          subscribers={subscribers}
          selectedSubscribers={selectedSubscribers}
          onSelectionChange={setSelectedSubscribers}
          onRemoveSubscriber={(email) => setDeleteModal({ isOpen: true, email, isMultiple: false, count: 0, isLoading: false })}
          onBulkRemove={() => setDeleteModal({ isOpen: true, email: '', isMultiple: true, count: selectedSubscribers.length, isLoading: false })}
          onCompose={() => setComposeModal(true)}
          showToast={showToast}
        />
      </main>
    </div>
  );
};

export default NewsletterAdmin;