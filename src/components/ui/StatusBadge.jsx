import React from 'react';
import { Lightbulb, Zap, Rocket, Wrench, Archive } from 'lucide-react';

const statusConfig = {
  idea: { icon: Lightbulb, color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Idea' },
  active: { icon: Zap, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Active' },
  shipped: { icon: Rocket, color: 'bg-green-100 text-green-700 border-green-200', label: 'Shipped' },
  maintenance: { icon: Wrench, color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Maintenance' },
  'end-of-life': { icon: Archive, color: 'bg-gray-100 text-gray-500 border-gray-200', label: 'End of Life' }
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.idea;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.color} ${sizeClasses[size]}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
      {config.label}
    </span>
  );
}