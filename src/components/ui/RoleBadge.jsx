import React from 'react';
import { Crown, Shield, User, Eye } from 'lucide-react';

const roleConfig = {
  ceo: { icon: Crown, color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200', label: 'CEO' },
  manager: { icon: Shield, color: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Manager' },
  contributor: { icon: User, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Contributor' },
  viewer: { icon: Eye, color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Viewer' }
};

export default function RoleBadge({ role, size = 'sm', className = '' }) {
  const config = roleConfig[role] || roleConfig.contributor;
  const Icon = config.icon;
  
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5'
  };

  return (
    <span className={`inline-flex items-center justify-center font-semibold rounded-full border ${config.color} ${sizeClasses[size]} ${className}`}>
      <Icon className={size === 'xs' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </span>
  );
}