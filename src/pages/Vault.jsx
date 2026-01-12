import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Plus, Eye, EyeOff, Copy, ExternalLink, Shield, Crown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function Vault() {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const memberships = await base44.entities.WorkspaceMember.filter({ user_email: currentUser.email });
      if (memberships.length > 0) {
        setMembership(memberships[0]);
        const workspaces = await base44.entities.Workspace.filter({ id: memberships[0].workspace_id });
        if (workspaces.length > 0) {
          setWorkspace(workspaces[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const { data: categories = [] } = useQuery({
    queryKey: ['vault-categories', workspace?.id],
    queryFn: () => base44.entities.VaultCategory.filter({ workspace_id: workspace.id }),
    enabled: !!workspace?.id
  });

  const { data: entries = [] } = useQuery({
    queryKey: ['vault-entries', workspace?.id],
    queryFn: () => base44.entities.VaultEntry.filter({ workspace_id: workspace.id }),
    enabled: !!workspace?.id
  });

  const canManageVault = membership?.role === 'ceo' || membership?.role === 'manager';
  const isCEO = membership?.role === 'ceo';

  const canViewEntry = (entry) => {
    if (isCEO) return true;
    if (!entry.allowed_users || entry.allowed_users.length === 0) return true;
    return entry.allowed_users.includes(user?.email);
  };

  const togglePasswordVisibility = async (entryId) => {
    setVisiblePasswords(prev => ({ ...prev, [entryId]: !prev[entryId] }));
    
    // Log access
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      await base44.entities.VaultAccessLog.create({
        vault_entry_id: entryId,
        workspace_id: workspace.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        action: 'view',
        entry_name: entry.name
      });
    }
  };

  const copyToClipboard = async (text, entryId, field) => {
    navigator.clipboard.writeText(text);
    
    // Log access
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      await base44.entities.VaultAccessLog.create({
        vault_entry_id: entryId,
        workspace_id: workspace.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        action: field === 'password' ? 'copy_password' : 'copy_username',
        entry_name: entry.name
      });
    }
  };

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const entriesByCategory = categories.map(cat => ({
    category: cat,
    entries: entries.filter(e => e.category_id === cat.id && canViewEntry(e))
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Lock className="w-8 h-8 text-indigo-600" />
              Password Vault
            </h1>
            <p className="text-gray-500 mt-1">Secure company credentials</p>
          </div>
          {canManageVault && (
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-5 h-5 mr-2" />
              Add Entry
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <Card className="mb-8 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Security Notice</p>
                <p className="text-sm text-amber-700 mt-1">
                  All access to vault entries is logged. Only access credentials you need for your work.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vault Entries by Category */}
        {entriesByCategory.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Lock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No vault entries yet</h3>
              <p className="text-gray-500 mb-6">Add your first secure credential</p>
              {canManageVault && (
                <Button onClick={() => setCreateDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Entry
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {entriesByCategory.map(({ category, entries: catEntries }) => (
              catEntries.length > 0 && (
                <div key={category.id}>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${category.color}-500`}></div>
                    {category.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {catEntries.map(entry => (
                      <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{entry.name}</CardTitle>
                            {entry.requires_ceo_approval && (
                              <Crown className="w-5 h-5 text-amber-500" title="CEO approval required" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {entry.url && (
                            <div>
                              <Label className="text-xs text-gray-500">URL</Label>
                              <a 
                                href={entry.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {entry.url}
                              </a>
                            </div>
                          )}

                          {entry.username && (
                            <div>
                              <Label className="text-xs text-gray-500">Username</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 px-3 py-2 bg-gray-50 rounded text-sm">{entry.username}</code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(entry.username, entry.id, 'username')}
                                  className="shrink-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {entry.password && (
                            <div>
                              <Label className="text-xs text-gray-500">Password</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 px-3 py-2 bg-gray-50 rounded text-sm font-mono">
                                  {visiblePasswords[entry.id] ? entry.password : '••••••••••••'}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => togglePasswordVisibility(entry.id)}
                                  className="shrink-0"
                                >
                                  {visiblePasswords[entry.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(entry.password, entry.id, 'password')}
                                  className="shrink-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {entry.notes && (
                            <div>
                              <Label className="text-xs text-gray-500">Notes</Label>
                              <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      <VaultEntryDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        workspace={workspace}
        categories={categories}
        onCreated={() => {
          queryClient.invalidateQueries(['vault-entries']);
          setCreateDialogOpen(false);
        }}
      />
    </div>
  );
}

function VaultEntryDialog({ open, onClose, workspace, categories, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState({
    name: '',
    url: '',
    username: '',
    password: '',
    notes: '',
    category_id: categories[0]?.id || '',
    requires_ceo_approval: false
  });

  const handleCreate = async () => {
    if (!entry.name.trim()) return;
    setLoading(true);
    try {
      await base44.entities.VaultEntry.create({
        ...entry,
        workspace_id: workspace.id
      });
      onCreated?.();
      setEntry({
        name: '',
        url: '',
        username: '',
        password: '',
        notes: '',
        category_id: categories[0]?.id || '',
        requires_ceo_approval: false
      });
    } catch (error) {
      console.error('Failed to create vault entry:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Vault Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Name *</Label>
            <Input
              placeholder="e.g., AWS Production"
              value={entry.name}
              onChange={(e) => setEntry({ ...entry, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Category</Label>
            <select
              value={entry.category_id}
              onChange={(e) => setEntry({ ...entry, category_id: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>URL</Label>
            <Input
              placeholder="https://..."
              value={entry.url}
              onChange={(e) => setEntry({ ...entry, url: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Username/Email</Label>
            <Input
              placeholder="username or email"
              value={entry.username}
              onChange={(e) => setEntry({ ...entry, username: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={entry.password}
              onChange={(e) => setEntry({ ...entry, password: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional information..."
              value={entry.notes}
              onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <Label>Requires CEO Approval</Label>
            <Switch
              checked={entry.requires_ceo_approval}
              onCheckedChange={(v) => setEntry({ ...entry, requires_ceo_approval: v })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !entry.name.trim()}>
            {loading ? 'Creating...' : 'Create Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}