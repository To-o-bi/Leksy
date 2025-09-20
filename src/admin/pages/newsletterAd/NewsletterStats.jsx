import React from 'react';
import { Users, Calendar, Mail } from 'lucide-react';

const NewsletterStats = ({ stats }) => {
  const statsData = [
    { 
      label: 'Total Subscribers', 
      value: stats.total, 
      color: 'blue', 
      icon: Users 
    },
    { 
      label: 'This Month', 
      value: stats.thisMonth, 
      color: 'green', 
      icon: Calendar 
    },
    { 
      label: 'Last 7 Days', 
      value: stats.recent, 
      color: 'purple', 
      icon: Mail 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statsData.map(({ label, value, color, icon: Icon }) => (
        <div key={label} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-full bg-${color}-100`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsletterStats;