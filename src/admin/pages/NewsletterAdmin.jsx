import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  Download, 
  Trash2, 
  Search, 
  Calendar,
  X,
  RefreshCw
} from 'lucide-react';

// Import your actual API
import api from '../../api/axios';

// Toast hook implementation
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = 'default' }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, variant };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
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
    <div
      className={`${variantClasses[toast.variant || 'default']} rounded-md shadow-lg p-4 max-w-xs w-full relative mb-2`}
      role="alert"
    >
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

// Newsletter service - FIXED VERSION
const newsletterService = {
  async fetchSubscribers(limit = null) {
    try {
      const params = {};
      if (limit) params.limit = limit;

      console.log('🔄 Fetching subscribers with params:', params);
      
      const response = await api.get('/admin/fetch-newsletter-subscribers', { params });
      
      console.log('📥 Full API Response:', response);
      console.log('📥 Response Data:', response.data);
      console.log('📥 Response Code:', response.data?.code);
      console.log('📥 Response Submission:', response.data?.submission);
      
      // Check if response exists and has correct structure
      if (!response || !response.data) {
        console.error('❌ No response or response.data');
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }

      // Check for successful response code
      if (response.data.code === 200) {
        // Handle both submission and subscribers arrays (for flexibility)
        const subscribersArray = response.data.submission || response.data.subscribers || [];
        
        console.log('✅ Subscribers array:', subscribersArray);
        console.log('✅ Array length:', subscribersArray.length);
        console.log('✅ Is array?', Array.isArray(subscribersArray));
        
        return {
          success: true,
          subscribers: subscribersArray,
          message: response.data.message || 'Subscribers fetched successfully!',
          total: subscribersArray.length
        };
      } else {
        console.error('❌ API returned non-200 code:', response.data.code);
        return {
          success: false,
          message: response.data.message || 'Failed to fetch subscribers'
        };
      }
    } catch (error) {
      console.error('❌ Newsletter fetch subscribers error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network error. Please check your connection and try again.'
      };
    }
  },

  async removeSubscriber(email) {
    try {
      if (!email || !email.trim()) {
        return {
          success: false,
          message: 'Please enter a valid email address'
        };
      }

      const cleanEmail = email.trim();
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return {
          success: false,
          message: 'Please enter a valid email address'
        };
      }

      console.log('🔄 Attempting newsletter unsubscription for:', cleanEmail);

      // Send email as query parameter as per API docs
      const response = await api.post(`/newsletter-subscribers/remove?email=${encodeURIComponent(cleanEmail)}`);
      
      if (response?.data?.code === 200) {
        return {
          success: true,
          message: response.data.message || 'Successfully unsubscribed!'
        };
      } else {
        return {
          success: false,
          message: response?.data?.message || 'Failed to unsubscribe. Please try again.'
        };
      }
    } catch (error) {
      console.error('❌ Newsletter unsubscribe error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network error. Please check your connection and try again.'
      };
    }
  }
};

const NewsletterAdmin = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
    thisMonth: 0
  });
  const { toast, toasts, removeToast } = useToast();

  // Check authentication and fetch subscribers
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to access this page',
        variant: 'destructive'
      });
      // Uncomment to redirect to login
      // window.location.href = '/login';
      setLoading(false);
    } else {
      fetchSubscribers();
    }
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    console.log('🔄 Starting fetchSubscribers...');
    
    try {
      const result = await newsletterService.fetchSubscribers();
      console.log('📋 Fetch Result:', result);
      
      if (result.success) {
        const subscriberData = result.subscribers || [];
        console.log('📊 Processing subscriber data:', subscriberData);
        console.log('📊 Data type:', typeof subscriberData);
        console.log('📊 Is array:', Array.isArray(subscriberData));
        console.log('📊 Length:', subscriberData.length);
        
        // Ensure we have a valid array
        if (Array.isArray(subscriberData)) {
          setSubscribers(subscriberData);
          calculateStats(subscriberData);
          console.log('✅ Subscribers set successfully');
          
          toast({
            title: 'Success',
            description: `${result.message} (${subscriberData.length} subscribers loaded)`,
            variant: 'success'
          });
        } else {
          console.error('❌ Subscriber data is not an array:', subscriberData);
          setSubscribers([]);
          toast({
            title: 'Warning',
            description: 'Received invalid data format from server',
            variant: 'warning'
          });
        }
      } else {
        console.error('❌ Fetch failed:', result.message);
        setSubscribers([]);
        toast({
          title: 'Error',
          description: result.message || 'Failed to fetch subscribers',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setSubscribers([]);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch subscribers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      console.log('🏁 fetchSubscribers completed');
    }
  };

  const calculateStats = (subscriberData) => {
    console.log('📊 Calculating stats for:', subscriberData);
    
    if (!Array.isArray(subscriberData)) {
      console.warn('❌ subscriberData is not an array:', subscriberData);
      setStats({ total: 0, recent: 0, thisMonth: 0 });
      return;
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newStats = {
      total: subscriberData.length,
      recent: subscriberData.filter(sub => 
        sub.created_at && new Date(sub.created_at) > lastWeek
      ).length,
      thisMonth: subscriberData.filter(sub => 
        sub.created_at && new Date(sub.created_at) > thisMonth
      ).length
    };

    console.log('📊 Calculated stats:', newStats);
    setStats(newStats);
  };

  const handleRemoveSubscriber = async (email) => {
    if (!confirm(`Are you sure you want to remove ${email} from the newsletter?`)) {
      return;
    }

    try {
      const result = await newsletterService.removeSubscriber(email);
      if (result.success) {
        const newData = subscribers.filter(sub => sub.email !== email);
        setSubscribers(newData);
        calculateStats(newData);
        // Remove from selected if it was selected
        setSelectedSubscribers(prev => prev.filter(selectedEmail => selectedEmail !== email));
        toast({
          title: 'Success',
          description: result.message || 'Subscriber removed successfully!',
          variant: 'success'
        });
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to remove subscriber',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove subscriber',
        variant: 'destructive'
      });
    }
  };

  const handleBulkRemove = async () => {
    if (selectedSubscribers.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select subscribers to remove',
        variant: 'warning'
      });
      return;
    }

    if (!confirm(`Are you sure you want to remove ${selectedSubscribers.length} subscribers?`)) {
      return;
    }

    try {
      const results = await Promise.all(
        selectedSubscribers.map(email => newsletterService.removeSubscriber(email))
      );
      
      const successCount = results.filter(result => result.success).length;
      const errorCount = results.length - successCount;
      
      if (successCount > 0) {
        const newData = subscribers.filter(sub => !selectedSubscribers.includes(sub.email));
        setSubscribers(newData);
        calculateStats(newData);
        setSelectedSubscribers([]);
        
        if (errorCount === 0) {
          toast({
            title: 'Success',
            description: `${successCount} subscribers removed successfully!`,
            variant: 'success'
          });
        } else {
          toast({
            title: 'Partial Success',
            description: `${successCount} subscribers removed, ${errorCount} failed`,
            variant: 'warning'
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to remove all selected subscribers',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove subscribers',
        variant: 'destructive'
      });
    }
  };

  const exportSubscribers = () => {
    try {
      if (!Array.isArray(subscribers) || subscribers.length === 0) {
        toast({
          title: 'Warning',
          description: 'No subscribers to export',
          variant: 'warning'
        });
        return;
      }

      const csvContent = [
        ['Email', 'Date Subscribed'],
        ...subscribers.map(sub => [
          sub.email || 'N/A',
          formatDate(sub.created_at)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Subscribers exported successfully!',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export subscribers',
        variant: 'destructive'
      });
    }
  };

  const filteredSubscribers = Array.isArray(subscribers) ? subscribers.filter(subscriber =>
    subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const toggleSelectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredSubscribers.map(sub => sub.email).filter(Boolean));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        <span className="ml-3 text-gray-600">Loading subscribers...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm min-h-screen bg-gray-50">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50">
        {toasts.map((toastItem) => (
          <Toast
            key={toastItem.id}
            toast={toastItem}
            onDismiss={() => removeToast(toastItem.id)}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-pink-500" />
            <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportSubscribers}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={fetchSubscribers}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Enhanced Debug Info */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-bold text-sm text-blue-800 mb-2">Debug Info:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Subscribers Length:</strong> {subscribers.length}</p>
            <p><strong>Subscribers Type:</strong> {Array.isArray(subscribers) ? 'Array' : typeof subscribers}</p>
            <p><strong>Filtered Length:</strong> {filteredSubscribers.length}</p>
            <p><strong>Search Term:</strong> "{searchTerm}"</p>
            <p><strong>First Subscriber:</strong> {subscribers[0] ? JSON.stringify(subscribers[0]) : 'None'}</p>
            <p><strong>Stats:</strong> Total: {stats.total}, Recent: {stats.recent}, This Month: {stats.thisMonth}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">This Month</p>
                <p className="text-2xl font-bold text-green-900">{stats.thisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Last 7 Days</p>
                <p className="text-2xl font-bold text-purple-900">{stats.recent}</p>
              </div>
              <Mail className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search and Bulk Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search subscribers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedSubscribers.length > 0 && (
            <button
              onClick={handleBulkRemove}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Selected ({selectedSubscribers.length})</span>
            </button>
          )}
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Subscribed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <Mail className="w-12 h-12 text-gray-300" />
                        <div>
                          {searchTerm ? (
                            <p>No subscribers found matching "{searchTerm}"</p>
                          ) : (
                            <p>No subscribers yet. They'll appear here once someone subscribes to your newsletter.</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber, index) => (
                    <tr key={subscriber.email || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.includes(subscriber.email)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubscribers(prev => [...prev, subscriber.email]);
                            } else {
                              setSelectedSubscribers(prev => prev.filter(email => email !== subscriber.email));
                            }
                          }}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subscriber.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(subscriber.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleRemoveSubscriber(subscriber.email)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
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
      </div>
    </div>
  );
};

export default NewsletterAdmin;