import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { Eye, EyeOff, Crown, Shield } from 'lucide-react';

export default function VaultEntryDialog({ 
  open, 
  onClose, 
  workspaceId, 
  categories, 
  entry = null,
  members = [],
  onSaved 
}) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    username: '',
    password: '',
    notes: '',
    category_id: '',
    requires_ceo_approval: false,
    allowed_users: []
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        name: entry.name || '',
        url: entry.url || '',
        username: entry.username || '',
        password: entry.password || '',
        notes: entry.notes || '',
        category_id: entry.category_id || '',
        requires_ceo_approval: entry.requires_ceo_approval || false,
        allowed_users: entry.allowed_users || []
      });
    } else {
      setFormData({
        name: '',
        url: '',
        username: '',
        password: '',
        notes: '',
        category_id: categories[0]?.id || '',
        requires_ceo_approval: false,
        allowed_users: []
      });
    }
  }, [entry, categories]);

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setLoading(true);

    try {
      const data = {
        ...formData,
        workspace_id: workspaceId
      };

      if (entry) {
        await base44.entities.VaultEntry.update(entry.id, data);
      } else {
        await base44.entities.VaultEntry.create(data);
      }

      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Failed to save vault entry:', error);
    }
    setLoading(false);
  };

  const toggleAllowedUser = (email) => {
    const users = formData.allowed_users || [];
    if (users.includes(email)) {
      setFormData({ ...formData, allowed_users: users.filter(u => u !== email) });
    } else {
      setFormData({ ...formData, allowed_users: [...users, email] });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            {entry ? 'Edit Entry' : 'New Vault Entry'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div>
            <Label>Name *</Label>
            <Input
              placeholder="e.g., AWS Console"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(v) => setFormData({ ...formData, category_id: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>URL</Label>
            <Input
              placeholder="https://..."
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Username / Email</Label>
            <Input
              placeholder="user@example.com"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Password / Secret</Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-800">Require CEO Approval</span>
            </div>
            <Switch
              checked={formData.requires_ceo_approval}
              onCheckedChange={(v) => setFormData({ ...formData, requires_ceo_approval: v })}
            />
          </div>

          {formData.requires_ceo_approval && (
            <div>
              <Label className="mb-2 block">Allowed Users (besides CEO)</Label>
              <div className="flex flex-wrap gap-2">
                {members.map(member => {
                  if (member.role === 'ceo') return null;
                  const isAllowed = (formData.allowed_users || []).includes(member.user_email);
                  return (
                    <button
                      key={member.user_email}
                      type="button"
                      onClick={() => toggleAllowedUser(member.user_email)}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all text-sm
                        ${isAllowed 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                        }
                      `}
                    >
                      {member.user_name || member.user_email}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !formData.name.trim()}>
            {loading ? 'Saving...' : 'Save Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}