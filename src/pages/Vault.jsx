import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Plus, Shield, Search, Server, Cloud, Apple, 
  Globe, Key, Lock, History, Folder
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import VaultEntryCard from '@/components/vault/VaultEntryCard';
import VaultEntryDialog from '@/components/vault/VaultEntryDialog';
import { format } from 'date-fns';

const categoryIcons = {
  hosting: Server,
  cloud: Cloud,
  apple: Apple,
  domains: Globe,
  general: Key
};

export default function Vault() {
  const urlParams = new URLSearchParams(window.location.search);
  const workspaceId = urlParams.get('workspaceId');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: members = [] } = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => base44.entities.WorkspaceMember.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['vaultCategories', workspaceId],
    queryFn: () => base44.entities.VaultCategory.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId
  });

  const { data: entries = [] } = useQuery({
    queryKey: ['vaultEntries', workspaceId],
    queryFn: () => base44.entities.VaultEntry.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId
  });

  const { data: accessLogs = [] } = useQuery({
    queryKey: ['accessLogs', workspaceId],
    queryFn: () => base44.entities.VaultAccessLog.filter({ workspace_id: workspaceId }, '-created_date', 50),
    enabled: !!workspaceId && showAuditLog
  });

  const currentMembership = members.find(m => m.user_email === currentUser?.email);
  const userRole = currentMembership?.role || 'viewer';
  const canManage = ['ceo', 'manager'].includes(userRole);

  // Create default categories if none exist
  useEffect(() => {
    const createDefaultCategories = async () => {
      if (workspaceId && categories.length === 0 && canManage) {
        const defaultCategories = [
          { name: 'Hosting', icon: 'server', color: '#6366f1' },
          { name: 'Cloud Services', icon: 'cloud', color: '#10b981' },
          { name: 'Apple Developer', icon: 'apple', color: '#374151' },
          { name: 'Domains', icon: 'globe', color: '#f59e0b' },
          { name: 'General', icon: 'key', color: '#8b5cf6' }
        ];
        for (const cat of defaultCategories) {
          await base44.entities.VaultCategory.create({
            workspace_id: workspaceId,
            ...cat
          });
        }
        queryClient.invalidateQueries(['vaultCategories']);
      }
    };
    createDefaultCategories();
  }, [workspaceId, categories.length, canManage]);

  const logAccess = async (entryId, action, entryName) => {
    await base44.entities.VaultAccessLog.create({
      vault_entry_id: entryId,
      workspace_id: workspaceId,
      user_email: currentUser.email,
      user_name: currentUser.full_name || currentUser.email,
      action,
      entry_name: entryName
    });
    if (showAuditLog) {
      queryClient.invalidateQueries(['accessLogs']);
    }
  };

  const handleDelete = async (entry) => {
    if (!confirm(`Delete "${entry.name}"?`)) return;
    await base44.entities.VaultEntry.delete(entry.id);
    queryClient.invalidateQueries(['vaultEntries']);
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Vault</h1>
                <p className="text-sm text-gray-500">Secure password storage</p>
              </div>
            </div>
            <div className="flex gap-2">
              {userRole === 'ceo' && (
                <Button variant="outline" onClick={() => setShowAuditLog(!showAuditLog)}>
                  <History className="w-4 h-4 mr-2" /> Audit Log
                </Button>
              )}
              {canManage && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Entry
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Search & Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar - Categories */}
          <div className="w-56 shrink-0 hidden md:block">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span className="font-medium">All</span>
                  <span className="ml-auto text-sm text-gray-400">{entries.length}</span>
                </button>
                {categories.map(category => {
                  const count = entries.filter(e => e.category_id === category.id).length;
                  const Icon = categoryIcons[category.icon] || Key;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: category.color }} />
                      <span className="font-medium">{category.name}</span>
                      <span className="ml-auto text-sm text-gray-400">{count}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {showAuditLog && userRole === 'ceo' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" /> Access Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {accessLogs.map(log => (
                      <div key={log.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {(log.user_name || log.user_email)[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{log.user_name}</p>
                          <p className="text-xs text-gray-500">
                            {log.action.replace('_', ' ')} on <span className="font-medium">{log.entry_name}</span>
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {format(new Date(log.created_date), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    ))}
                    {accessLogs.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No access logs yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {filteredEntries.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">No entries found</h3>
                    <p className="text-gray-500 mb-4">Add your first secure entry</p>
                    {canManage && (
                      <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Entry
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredEntries.map(entry => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <VaultEntryCard
                          entry={entry}
                          category={categories.find(c => c.id === entry.category_id)}
                          currentUser={currentUser}
                          userRole={userRole}
                          onEdit={canManage ? setEditingEntry : undefined}
                          onDelete={canManage ? handleDelete : undefined}
                          onLogAccess={logAccess}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <VaultEntryDialog
        open={createDialogOpen || !!editingEntry}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingEntry(null);
        }}
        workspaceId={workspaceId}
        categories={categories}
        entry={editingEntry}
        members={members}
        onSaved={() => queryClient.invalidateQueries(['vaultEntries'])}
      />
    </div>
  );
}