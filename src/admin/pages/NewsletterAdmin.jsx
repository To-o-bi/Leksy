import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  Download, 
  Trash2, 
  Search, 
  Calendar,
  Filter,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';
import { newsletterService } from '../../api/services';

const NewsletterAdmin = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
    thisMonth: 0
  });

  // Fetch subscribers on component mount
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const result = await newsletterService.fetchSubscribers();
      if (result.success) {
        const subscriberData = result.subscribers || [];
        setSubscribers(subscriberData);
        calculateStats(subscriberData);
      } else {
        console.error('Failed to fetch subscribers:', result.message);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (subscriberData) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    setStats({
      total: subscriberData.length,
      recent: subscriberData.filter(sub => 
        new Date(sub.created_at || sub.date_subscribed) > lastWeek
      ).length,
      thisMonth: subscriberData.filter(sub => 
        new Date(sub.created_at || sub.date_subscribed) > thisMonth
      ).length
    });
  };

  const handleRemoveSubscriber = async (email) => {
    if (!confirm(`Are you sure you want to remove ${email} from the newsletter?`)) {
      return;
    }

    try {
      const result = await newsletterService.removeSubscriber(email);
      if (result.success) {
        setSubscribers(prev => prev.filter(sub => sub.email !== email));
        alert('Subscriber removed successfully!');
      } else {
        alert('Failed to remove subscriber: ' + result.message);
      }
    } catch (error) {
      alert('Error removing subscriber: ' + error.message);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedSubscribers.length === 0) {
      alert('Please select subscribers to remove');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${selectedSubscribers.length} subscribers?`)) {
      return;
    }

    try {
      for (const email of selectedSubscribers) {
        await newsletterService.removeSubscriber(email);
      }
      setSubscribers(prev => prev.filter(sub => !selectedSubscribers.includes(sub.email)));
      setSelectedSubscribers([]);
      alert('Selected subscribers removed successfully!');
    } catch (error) {
      alert('Error removing subscribers: ' + error.message);
    }
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      const result = await newsletterService.addSubscriber(newEmail);
      if (result.success) {
        setNewEmail('');
        setShowAddModal(false);
        fetchSubscribers(); // Refresh the list
        alert('Subscriber added successfully!');
      } else {
        alert('Failed to add subscriber: ' + result.message);
      }
    } catch (error) {
      alert('Error adding subscriber: ' + error.message);
    }
  };

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Date Subscribed', 'Status'],
      ...subscribers.map(sub => [
        sub.email,
        new Date(sub.created_at || sub.date_subscribed).toLocaleDateString(),
        sub.status || 'Active'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredSubscribers.map(sub => sub.email));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
        <span className="ml-2 text-gray-600">Loading subscribers...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Mail className="w-6 h-6 text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscriber</span>
          </button>
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
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search subscribers..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left border border-gray-200">
                <input
                  type="checkbox"
                  checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
              </th>
              <th className="p-3 text-left border border-gray-200 font-semibold text-gray-900">Email</th>
              <th className="p-3 text-left border border-gray-200 font-semibold text-gray-900">Date Subscribed</th>
              <th className="p-3 text-left border border-gray-200 font-semibold text-gray-900">Status</th>
              <th className="p-3 text-left border border-gray-200 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 border border-gray-200">
                  {searchTerm ? 'No subscribers found matching your search.' : 'No subscribers yet.'}
                </td>
              </tr>
            ) : (
              filteredSubscribers.map((subscriber, index) => (
                <tr key={subscriber.email || index} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-200">
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
                  <td className="p-3 border border-gray-200 font-medium text-gray-900">
                    {subscriber.email}
                  </td>
                  <td className="p-3 border border-gray-200 text-gray-600">
                    {formatDate(subscriber.created_at || subscriber.date_subscribed)}
                  </td>
                  <td className="p-3 border border-gray-200">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {subscriber.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-200">
                    <button
                      onClick={() => handleRemoveSubscriber(subscriber.email)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Remove subscriber"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Subscriber</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter email address"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSubscriber(e);
                    }
                  }}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSubscriber}
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Add Subscriber
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterAdmin;