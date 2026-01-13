import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, UserPlus, Copy, Check, Plus, Trash2, Calendar } from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';
import { format } from 'date-fns';

export default function Team() {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const { data: allMembers = [] } = useQuery({
    queryKey: ['members', workspace?.id],
    queryFn: () => base44.entities.WorkspaceMember.filter({ workspace_id: workspace.id }, '-created_date'),
    enabled: !!workspace?.id
  });

  // Filter out the current user from the members list
  const members = allMembers.filter(member => member.user_email !== user?.email);

  const { data: inviteCodes = [] } = useQuery({
    queryKey: ['invite-codes', workspace?.id],
    queryFn: () => base44.entities.InviteCode.filter({ workspace_id: workspace.id }, '-created_date'),
    enabled: !!workspace?.id
  });

  const canManageTeam = membership?.role === 'ceo' || membership?.role === 'manager';

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this team member?')) return;
    try {
      await base44.entities.WorkspaceMember.delete(memberId);
      queryClient.invalidateQueries(['members']);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleDeleteInviteCode = async (codeId) => {
    if (!confirm('Delete this invite code?')) return;
    try {
      await base44.entities.InviteCode.delete(codeId);
      queryClient.invalidateQueries(['invite-codes']);
    } catch (error) {
      console.error('Failed to delete code:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              Team Members
            </h1>
            <p className="text-gray-500 mt-1">Manage your workspace team</p>
          </div>
          {canManageTeam && (
            <Button onClick={() => setInviteDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-5 h-5 mr-2" />
              Generate Invite Code
            </Button>
          )}
        </div>

        {/* Members List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Members ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                      {(member.user_name || member.user_email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{member.user_name || member.user_email}</p>
                      <p className="text-sm text-gray-500">{member.user_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RoleBadge role={member.role} size="md" />
                    {canManageTeam && member.role !== 'ceo' && member.user_email !== user?.email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invite Codes */}
        {canManageTeam && (
          <Card>
            <CardHeader>
              <CardTitle>Invite Codes</CardTitle>
            </CardHeader>
            <CardContent>
              {inviteCodes.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No invite codes yet</p>
                  <Button 
                    onClick={() => setInviteDialogOpen(true)}
                    className="mt-4"
                  >
                    Generate First Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {inviteCodes.map(code => (
                    <div key={code.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="px-3 py-1 bg-white border rounded font-mono text-lg font-bold text-indigo-600">
                            {code.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(code.code)}
                            className="text-gray-500 hover:text-indigo-600"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Role: <RoleBadge role={code.default_role} size="xs" /></span>
                          <span>Used: {code.use_count || 0}{code.max_uses ? ` / ${code.max_uses}` : ''}</span>
                          {code.expires_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Expires {format(new Date(code.expires_at), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteInviteCode(code.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <InviteCodeDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        workspace={workspace}
        onCreated={() => {
          queryClient.invalidateQueries(['invite-codes']);
          setInviteDialogOpen(false);
        }}
      />
    </div>
  );
}

function InviteCodeDialog({ open, onClose, workspace, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState({
    default_role: 'contributor',
    expires_at: '',
    max_uses: ''
  });

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await base44.entities.InviteCode.create({
        workspace_id: workspace.id,
        code: generateRandomCode(),
        default_role: code.default_role,
        expires_at: code.expires_at || null,
        max_uses: code.max_uses ? parseInt(code.max_uses) : null,
        is_active: true
      });
      onCreated?.();
    } catch (error) {
      console.error('Failed to create invite code:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Invite Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Default Role</Label>
            <Select
              value={code.default_role}
              onValueChange={(v) => setCode({ ...code, default_role: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="contributor">Contributor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Expiration Date (optional)</Label>
            <Input
              type="date"
              value={code.expires_at}
              onChange={(e) => setCode({ ...code, expires_at: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Max Uses (optional)</Label>
            <Input
              type="number"
              placeholder="Unlimited"
              value={code.max_uses}
              onChange={(e) => setCode({ ...code, max_uses: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Code'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}