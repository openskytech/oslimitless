import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Eye, EyeOff, Copy, ExternalLink, Shield, Crown, 
  Check, MoreHorizontal, Pencil, Trash2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';

export default function VaultEntryCard({ 
  entry, 
  category, 
  currentUser, 
  userRole,
  onEdit,
  onDelete,
  onLogAccess 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const canView = userRole === 'ceo' || 
    !entry.requires_ceo_approval || 
    entry.allowed_users?.includes(currentUser.email);

  const copyToClipboard = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    
    // Log access
    onLogAccess?.(entry.id, field === 'password' ? 'copy_password' : 'copy_username', entry.name);
  };

  const handleViewPassword = () => {
    if (!showPassword) {
      onLogAccess?.(entry.id, 'view', entry.name);
    }
    setShowPassword(!showPassword);
  };

  if (!canView) {
    return (
      <Card className="opacity-60">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{entry.name}</h4>
              <p className="text-sm text-amber-600">Requires CEO approval</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{entry.name}</h4>
              {entry.url && (
                <a 
                  href={entry.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {new URL(entry.url).hostname}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(entry)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(entry)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-3">
          {/* Username */}
          {entry.username && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div>
                <p className="text-xs text-gray-500">Username / Email</p>
                <p className="font-mono text-sm">{entry.username}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(entry.username, 'username')}
              >
                {copiedField === 'username' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}

          {/* Password */}
          {entry.password && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500">Password</p>
                <p className="font-mono text-sm">
                  {showPassword ? entry.password : '••••••••••••'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleViewPassword}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(entry.password, 'password')}
                >
                  {copiedField === 'password' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              {entry.notes}
            </div>
          )}

          {/* Restricted badge */}
          {entry.requires_ceo_approval && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <Crown className="w-3 h-3" />
              CEO Restricted
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}