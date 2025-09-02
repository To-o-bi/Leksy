import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  Download, 
  Trash2, 
  Search, 
  Calendar,
  X,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import api from '../../api/axios'; 

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

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, onConfirm, subscriberEmail, isMultiple = false, count = 0 }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto transform transition-all">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Deletion
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600">
              {isMultiple ? (
                <>
                  Are you sure you want to remove <span className="font-semibold text-red-600">{count}</span> subscribers from the newsletter?
                </>
              ) : (
                <>
                  Are you sure you want to remove <span className="font-semibold text-red-600 break-all">{subscriberEmail}</span> from the newsletter?
                </>
              )}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-2 sm:gap-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
            >
              {isMultiple ? `Remove ${count} Subscribers` : 'Remove Subscriber'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Validation helper
const validateEmail = (email) => {
  if (!email?.trim()) return { valid: false, message: 'Please enter a valid email address' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) 
    ? { valid: true } 
    : { valid: false, message: 'Please enter a valid email address' };
};

// Newsletter service
const newsletterService = {
  async fetchSubscribers(limit = null) {
    try {
      const params = limit ? { limit } : {};
      const response = await api.get('/admin/fetch-newsletter-subscribers', { params });
      
      if (response?.data?.code === 200) {
        return {
          success: true,
          subscribers: response.data.newsletter_subscribers || [],
          message: response.data.message || 'Subscribers fetched successfully!'
        };
      }
      return { success: false, message: response?.data?.message || 'Failed to fetch subscribers' };
    } catch (error) {
      console.error('❌ Newsletter fetch subscribers error:', error);
      return { success: false, message: error.message || 'Network error. Please check your connection and try again.' };
    }
  },

  async removeSubscriber(email) {
    try {
      const validation = validateEmail(email);
      if (!validation.valid) return { success: false, message: validation.message };

      const cleanEmail = email.trim();
      console.log('🔄 Attempting newsletter unsubscription for:', cleanEmail);

      const formData = new FormData();
      formData.append('email', cleanEmail);
      
      const response = await api.post('/newsletter-subscribers/remove', formData);
      
      console.log('✅ Newsletter unsubscription response:', response.data);
      
      if (response?.data?.code === 200) {
        return { success: true, message: response.data.message || 'Successfully unsubscribed!' };
      }
      
      return { success: false, message: response?.data?.message || 'Failed to unsubscribe' };
      
    } catch (error) {
      console.error('❌ Newsletter unsubscribe error:', error);
      const message = error.response?.data?.message || error.message || 'Network error. Please check your connection and try again.';
      return { success: false, message };
    }
  }
};

const NewsletterAdmin = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, recent: 0, thisMonth: 0 });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    email: '',
    isMultiple: false,
    count: 0
  });
  const { toast, toasts, removeToast } = useToast();

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateStats = (subscriberData) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    setStats({
      total: subscriberData.length,
      recent: subscriberData.filter(sub => new Date(sub.created_at) > lastWeek).length,
      thisMonth: subscriberData.filter(sub => new Date(sub.created_at) > thisMonth).length
    });
  };

  const updateSubscribersList = (newData) => {
    const sortedData = newData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setSubscribers(sortedData);
    calculateStats(sortedData);
  };

  const showToast = (type, title, description) => {
    toast({ title, description, variant: type });
  };

  // Modal handlers
  const openDeleteModal = (email) => {
    setDeleteModal({ isOpen: true, email, isMultiple: false, count: 0 });
  };

  const openBulkDeleteModal = () => {
    if (selectedSubscribers.length === 0) {
      showToast('warning', 'Warning', 'Please select subscribers to remove');
      return;
    }
    setDeleteModal({ isOpen: true, email: '', isMultiple: true, count: selectedSubscribers.length });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, email: '', isMultiple: false, count: 0 });
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
      closeDeleteModal();
    }
  };

  const handleBulkRemove = async () => {
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
      closeDeleteModal();
    }
  };

  const exportSubscribers = () => {
    try {
      const csvContent = [
        ['Email', 'Date Subscribed'],
        ...subscribers.map(sub => [sub.email, formatDate(sub.created_at)])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast('success', 'Success', 'Subscribers exported successfully!');
    } catch (error) {
      showToast('destructive', 'Error', 'Failed to export subscribers');
    }
  };

  // Selection handlers
  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    setSelectedSubscribers(
      selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0
        ? []
        : filteredSubscribers.map(sub => sub.email)
    );
  };

  const toggleSubscriberSelection = (email, checked) => {
    setSelectedSubscribers(prev => 
      checked 
        ? [...prev, email]
        : prev.filter(e => e !== email)
    );
  };

  // Effects
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      showToast('destructive', 'Authentication Required', 'Please login to access this page');
      setLoading(false); // Stop loading if not authenticated
    } else {
      fetchSubscribers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        <span className="mt-4 text-gray-600">Loading subscribers...</span>
      </div>
    );
  }

  // Stats data
  const statsData = [
    { label: 'Total Subscribers', value: stats.total, color: 'blue', icon: Users },
    { label: 'This Month', value: stats.thisMonth, color: 'green', icon: Calendar },
    { label: 'Last 7 Days', value: stats.recent, color: 'purple', icon: Mail }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 w-full max-w-xs px-4 sm:px-0">
        {toasts.map(toastItem => (
          <Toast key={toastItem.id} toast={toastItem} onDismiss={() => removeToast(toastItem.id)} />
        ))}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteModal.isMultiple ? handleBulkRemove : handleRemoveSubscriber}
        subscriberEmail={deleteModal.email}
        isMultiple={deleteModal.isMultiple}
        count={deleteModal.count}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {statsData.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm text-gray-500`}>{label}</p>
                  <p className={`text-3xl font-bold text-gray-900`}>{value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${color}-100`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Search and Bulk Actions */}
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search subscribers by email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {selectedSubscribers.length > 0 && (
                <button
                  onClick={openBulkDeleteModal}
                  className="flex items-center justify-center w-full md:w-auto space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Selected ({selectedSubscribers.length})</span>
                </button>
              )}
            </div>

            {/* Subscribers Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="p-4">
                       <input
                          type="checkbox"
                          checked={filteredSubscribers.length > 0 && selectedSubscribers.length === filteredSubscribers.length}
                          onChange={toggleSelectAll}
                          disabled={filteredSubscribers.length === 0}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Subscribed</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                            <Users className="w-12 h-12 text-gray-300 mb-2"/>
                            <p className="font-semibold">{searchTerm ? 'No subscribers found' : 'No subscribers yet'}</p>
                            <p className="text-sm">{searchTerm ? 'Try adjusting your search.' : 'New subscribers will appear here.'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((subscriber, index) => (
                      <tr key={subscriber.email || index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedSubscribers.includes(subscriber.email)}
                            onChange={(e) => toggleSubscriberSelection(subscriber.email, e.target.checked)}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 truncate" title={subscriber.email}>
                                {subscriber.email}
                            </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(subscriber.created_at)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => openDeleteModal(subscriber.email)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-100"
                            title="Remove subscriber"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </main>
    </div>
  );
};

export default NewsletterAdmin;
