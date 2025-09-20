import React, { useState } from 'react';
import { Search, Send, Trash2, Users } from 'lucide-react';

const SubscribersTable = ({
  subscribers,
  selectedSubscribers,
  onSelectionChange,
  onRemoveSubscriber,
  onBulkRemove,
  onCompose,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? 'Invalid Date' 
      : date.toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
  };

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selection handlers
  const toggleSelectAll = () => {
    const newSelection = selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0
      ? []
      : filteredSubscribers.map(sub => sub.email);
    onSelectionChange(newSelection);
  };

  const toggleSubscriberSelection = (email, checked) => {
    const newSelection = checked 
      ? [...selectedSubscribers, email]
      : selectedSubscribers.filter(e => e !== email);
    onSelectionChange(newSelection);
  };

  const handleBulkRemove = () => {
    if (selectedSubscribers.length === 0) {
      showToast('warning', 'Warning', 'Please select subscribers to remove');
      return;
    }
    onBulkRemove();
  };

  return (
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
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onCompose}
              className="flex items-center justify-center w-full sm:w-auto space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Send to Selected ({selectedSubscribers.length})</span>
            </button>
            <button
              onClick={handleBulkRemove}
              className="flex items-center justify-center w-full sm:w-auto space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Selected ({selectedSubscribers.length})</span>
            </button>
          </div>
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
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Subscribed
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubscribers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Users className="w-12 h-12 text-gray-300 mb-2"/>
                    <p className="font-semibold">
                      {searchTerm ? 'No subscribers found' : 'No subscribers yet'}
                    </p>
                    <p className="text-sm">
                      {searchTerm ? 'Try adjusting your search.' : 'New subscribers will appear here.'}
                    </p>
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
                      onClick={() => onRemoveSubscriber(subscriber.email)}
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
  );
};

export default SubscribersTable;