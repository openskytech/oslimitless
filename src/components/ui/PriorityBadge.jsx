import React from 'react';
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from 'lucide-react';

const priorityConfig = {
  low: { icon: ArrowDown, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Low' },
  medium: { icon: Minus, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Medium' },
  high: { icon: ArrowUp, color: 'text-orange-500', bg: 'bg-orange-100', label: 'High' },
  urgent: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100', label: 'Urgent' }
};

export default function PriorityBadge({ priority, showLabel = false, size = 'sm' }) {
  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;
  
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6'
  };

  if (showLabel) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.color} ${config.bg} px-2 py-1 rounded-full`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  }

  return (
    <span className={`${config.color} ${config.bg} p-1 rounded-full inline-flex`}>
      <Icon className={sizeClasses[size]} />
    </span>
  );
}