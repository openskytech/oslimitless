import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { Copy, Check, Link2, Calendar, Users } from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export default function InviteCodeDialog({ open, onClose, workspaceId, workspaceName, onCreated, userRole = 'manager' }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);
  const [settings, setSettings] = useState({
    default_role: 'contributor',
    hasExpiry: false,
    expires_days: 7,
    hasMaxUses: false,
    max_uses: 10
  });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const code = generateCode();
      let expires_at = null;
      if (settings.hasExpiry) {
        const date = new Date();
        date.setDate(date.getDate() + settings.expires_days);
        expires_at = date.toISOString();
      }

      const inviteCode = await base44.entities.InviteCode.create({
        workspace_id: workspaceId,
        code,
        default_role: settings.default_role,
        expires_at,
        max_uses: settings.hasMaxUses ? settings.max_uses : null,
        is_active: true
      });

      setCreatedCode(inviteCode);
      onCreated?.(inviteCode);
    } catch (error) {
      console.error('Failed to create invite code:', error);
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(createdCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setCreatedCode(null);
    setSettings({
      default_role: 'contributor',
      hasExpiry: false,
      expires_days: 7,
      hasMaxUses: false,
      max_uses: 10
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-indigo-600" />
            {createdCode ? 'Invite Code Created!' : 'Generate Invite Code'}
          </DialogTitle>
          {!createdCode && (
            <DialogDescription>
              Create an invite code for team members to join {workspaceName}
            </DialogDescription>
          )}
        </DialogHeader>

        {createdCode ? (
          <div className="py-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-500 mb-2">Share this code:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-mono font-bold tracking-wider text-indigo-600">
                  {createdCode.code}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyCode}
                  className="text-indigo-600"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>Role: <RoleBadge role={createdCode.default_role} size="xs" /></p>
                {createdCode.expires_at && (
                  <p className="mt-1">Expires: {new Date(createdCode.expires_at).toLocaleDateString()}</p>
                )}
                {createdCode.max_uses && (
                  <p className="mt-1">Max uses: {createdCode.max_uses}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-4">
            <div>
              <Label className="mb-2 block">Default Role for New Members</Label>
              <Select
                value={settings.default_role}
                onValueChange={(v) => setSettings({ ...settings, default_role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userRole === 'ceo' && (
                    <SelectItem value="ceo">
                      <div className="flex items-center gap-2">
                        <RoleBadge role="ceo" size="xs" /> CEO
                      </div>
                    </SelectItem>
                  )}
                  {userRole === 'ceo' && (
                    <SelectItem value="manager">
                      <div className="flex items-center gap-2">
                        <RoleBadge role="manager" size="xs" /> Manager
                      </div>
                    </SelectItem>
                  )}
                  <SelectItem value="contributor">
                    <div className="flex items-center gap-2">
                      <RoleBadge role="contributor" size="xs" /> Contributor
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <RoleBadge role="viewer" size="xs" /> Viewer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Set Expiration</span>
              </div>
              <Switch
                checked={settings.hasExpiry}
                onCheckedChange={(v) => setSettings({ ...settings, hasExpiry: v })}
              />
            </div>
            {settings.hasExpiry && (
              <div className="pl-6">
                <Label className="text-sm">Expires in (days)</Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.expires_days}
                  onChange={(e) => setSettings({ ...settings, expires_days: parseInt(e.target.value) || 7 })}
                  className="mt-1 w-24"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Limit Uses</span>
              </div>
              <Switch
                checked={settings.hasMaxUses}
                onCheckedChange={(v) => setSettings({ ...settings, hasMaxUses: v })}
              />
            </div>
            {settings.hasMaxUses && (
              <div className="pl-6">
                <Label className="text-sm">Maximum uses</Label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={settings.max_uses}
                  onChange={(e) => setSettings({ ...settings, max_uses: parseInt(e.target.value) || 10 })}
                  className="mt-1 w-24"
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {createdCode ? (
            <Button onClick={handleClose} className="w-full">Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Code'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}