import React from 'react';
import { Globe, Smartphone, Monitor, Server, MoreHorizontal } from 'lucide-react';

const platformConfig = {
  web: { icon: Globe, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Web' },
  ios: { icon: Smartphone, color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'iOS' },
  android: { icon: Smartphone, color: 'bg-green-100 text-green-700 border-green-200', label: 'Android' },
  api: { icon: Server, color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'API' },
  other: { icon: MoreHorizontal, color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Other' }
};

export default function PlatformBadge({ platform, size = 'sm' }) {
  const config = platformConfig[platform] || platformConfig.other;
  const Icon = config.icon;
  
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.color} ${sizeClasses[size]}`}>
      <Icon className={size === 'xs' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </span>
  );
}