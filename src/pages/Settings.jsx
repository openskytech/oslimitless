import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Settings as SettingsIcon, Users, Sparkles, 
  Bell, Link2, Save, Trash2, LogOut, Copy, Check, Upload, X, Ticket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import RoleBadge from '@/components/ui/RoleBadge';
import InviteCodeDialog from '@/components/workspace/InviteCodeDialog';
import JoinWorkspaceDialog from '@/components/workspace/JoinWorkspaceDialog';
import { format } from 'date-fns';

export default function Settings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [inviteCodeOpen, setInviteCodeOpen] = useState(false);
  const [joinWorkspaceOpen, setJoinWorkspaceOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [workspaceSettings, setWorkspaceSettings] = useState({
    name: '',
    description: '',
    logo_url: '',
    teams_webhook_url: '',
    quips_enabled: true
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
    document.documentElement.classList.remove('dark');
  }, []);

  const { data: memberships = [] } = useQuery({
    queryKey: ['memberships', currentUser?.email],
    queryFn: () => base44.entities.WorkspaceMember.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const workspaceIds = memberships.map(m => m.workspace_id);
  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces', workspaceIds],
    queryFn: async () => {
      if (workspaceIds.length === 0) return [];
      const results = await Promise.all(
        workspaceIds.map(id => base44.entities.Workspace.filter({ id }))
      );
      return results.flat();
    },
    enabled: workspaceIds.length > 0
  });

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0]);
      setWorkspaceSettings({
        name: workspaces[0].name || '',
        description: workspaces[0].description || '',
        logo_url: workspaces[0].logo_url || '',
        teams_webhook_url: workspaces[0].teams_webhook_url || '',
        quips_enabled: workspaces[0].quips_enabled ?? true
      });
    }
  }, [workspaces]);

  const { data: members = [] } = useQuery({
    queryKey: ['members', selectedWorkspace?.id],
    queryFn: () => base44.entities.WorkspaceMember.filter({ workspace_id: selectedWorkspace.id }),
    enabled: !!selectedWorkspace?.id
  });

  const { data: inviteCodes = [] } = useQuery({
    queryKey: ['inviteCodes', selectedWorkspace?.id],
    queryFn: () => base44.entities.InviteCode.filter({ workspace_id: selectedWorkspace.id, is_active: true }),
    enabled: !!selectedWorkspace?.id
  });

  const currentMembership = memberships.find(m => m.workspace_id === selectedWorkspace?.id);
  const userRole = currentMembership?.role || 'viewer';
  const isCeo = userRole === 'ceo';
  const isManager = ['ceo', 'manager'].includes(userRole);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setWorkspaceSettings({ ...workspaceSettings, logo_url: file_url });
    } catch (error) {
      console.error('Failed to upload logo:', error);
    }
    setUploading(false);
  };

  const saveWorkspaceSettings = async () => {
    if (!selectedWorkspace) return;
    setSaving(true);
    try {
      await base44.entities.Workspace.update(selectedWorkspace.id, workspaceSettings);
      queryClient.invalidateQueries(['workspaces']);
    } catch (error) {
      console.error('Failed to save:', error);
    }
    setSaving(false);
  };

  const updateMemberRole = async (memberId, newRole) => {
    await base44.entities.WorkspaceMember.update(memberId, { role: newRole });
    queryClient.invalidateQueries(['members']);
  };

  const removeMember = async (member) => {
    if (!confirm(`Remove ${member.user_name || member.user_email} from the workspace?`)) return;
    await base44.entities.WorkspaceMember.delete(member.id);
    queryClient.invalidateQueries(['members']);
  };

  const deactivateInviteCode = async (code) => {
    await base44.entities.InviteCode.update(code.id, { is_active: false });
    queryClient.invalidateQueries(['inviteCodes']);
  };

  const copyInviteCode = (codeId, codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(codeId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (!currentUser || !selectedWorkspace) {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">{selectedWorkspace.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="workspace">
          <TabsList className="mb-6">
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Workspace Settings */}
          <TabsContent value="workspace">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Settings</CardTitle>
                <CardDescription>Manage your workspace configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Workspace Name</Label>
                  <Input
                    value={workspaceSettings.name}
                    onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, name: e.target.value })}
                    disabled={!isManager}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={workspaceSettings.description}
                    onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, description: e.target.value })}
                    disabled={!isManager}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Workspace Logo</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={uploading || !isManager}
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors bg-gray-50 hover:bg-indigo-50 ${!isManager ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                      </span>
                    </label>
                    
                    {workspaceSettings.logo_url && (
                      <div className="mt-3 inline-flex items-center gap-3 px-3 py-2 bg-indigo-50 rounded-lg">
                        <img src={workspaceSettings.logo_url} alt="Logo" className="w-8 h-8 rounded object-cover" />
                        <span className="text-sm text-indigo-700">Logo uploaded</span>
                        {isManager && (
                          <button
                            type="button"
                            onClick={() => setWorkspaceSettings({ ...workspaceSettings, logo_url: '' })}
                            className="ml-1 text-indigo-600 hover:text-indigo-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Quirky UI Mode</p>
                      <p className="text-sm text-gray-500">Show fun quips and messages</p>
                    </div>
                  </div>
                  <Switch
                    checked={workspaceSettings.quips_enabled}
                    onCheckedChange={(v) => setWorkspaceSettings({ ...workspaceSettings, quips_enabled: v })}
                    disabled={!isManager}
                  />
                </div>

                {isManager && (
                  <Button onClick={saveWorkspaceSettings} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Settings */}
          <TabsContent value="team">
            <div className="space-y-6">
              {/* Invite Codes */}
              {isCeo && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Invite Codes</CardTitle>
                        <CardDescription>Manage team join codes</CardDescription>
                      </div>
                      <Button onClick={() => setInviteCodeOpen(true)}>
                        <Ticket className="w-4 h-4 mr-2" /> Generate Code
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {inviteCodes.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No active invite codes</p>
                    ) : (
                      <div className="space-y-3">
                        {inviteCodes.map(code => (
                          <div key={code.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <code className="font-mono font-bold text-indigo-600">{code.code}</code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => copyInviteCode(code.id, code.code)}
                              >
                                {copiedCodeId === code.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </Button>
                              <RoleBadge role={code.default_role} size="xs" />
                            </div>
                            <div className="flex items-center gap-3">
                              {code.expires_at && (
                                <span className="text-xs text-gray-500">
                                  Expires {format(new Date(code.expires_at), 'MMM d')}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {code.use_count || 0}{code.max_uses ? `/${code.max_uses}` : ''} uses
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => deactivateInviteCode(code)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> Team Members
                  </CardTitle>
                  <CardDescription>{members.length} members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {(member.user_name || member.user_email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{member.user_name || member.user_email}</p>
                            <p className="text-sm text-gray-500">{member.user_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <RoleBadge role={member.role} />
                          {isCeo && member.user_email !== currentUser.email && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => removeMember(member)}
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
            </div>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Microsoft Teams Notifications
                </CardTitle>
                <CardDescription>Get notified when tasks are updated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Teams Webhook URL</Label>
                  <Input
                    placeholder="https://outlook.office.com/webhook/..."
                    value={workspaceSettings.teams_webhook_url}
                    onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, teams_webhook_url: e.target.value })}
                    disabled={!isManager}
                    className="mt-1 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Create an Incoming Webhook connector in your Teams channel and paste the URL here
                  </p>
                </div>

                {isManager && (
                  <Button onClick={saveWorkspaceSettings} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Webhook'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Your Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={currentUser.full_name || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, full_name: e.target.value })}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    value={currentUser.email}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
                </div>

                <div>
                  <Label>Role in Workspace</Label>
                  <div className="mt-2">
                    <RoleBadge role={userRole} fullWidth />
                  </div>
                </div>

                <Button onClick={async () => {
                  if (!currentUser.full_name || !currentUser.full_name.trim()) {
                    alert('Please enter a name');
                    return;
                  }
                  
                  setSaving(true);
                  try {
                    console.log('Saving name:', currentUser.full_name);
                    await base44.auth.updateMe({ full_name: currentUser.full_name.trim() });
                    
                    // Update all WorkspaceMember records with the new name
                    const userMemberships = await base44.entities.WorkspaceMember.filter({ user_email: currentUser.email });
                    await Promise.all(
                      userMemberships.map(membership => 
                        base44.entities.WorkspaceMember.update(membership.id, { user_name: currentUser.full_name.trim() })
                      )
                    );
                    
                    console.log('Name saved successfully');
                    window.location.reload();
                  } catch (error) {
                    console.error('Failed to save name:', error);
                    alert('Failed to save name. Please try again.');
                    setSaving(false);
                  }
                }} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>

                <Separator />

                <div>
                  <Label className="mb-2 block">Join Another Workspace</Label>
                  <Button variant="outline" onClick={() => setJoinWorkspaceOpen(true)}>
                    <Ticket className="w-4 h-4 mr-2" /> Enter Invite Code
                  </Button>
                </div>

                <Separator />

                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <InviteCodeDialog
        open={inviteCodeOpen}
        onClose={() => setInviteCodeOpen(false)}
        workspaceId={selectedWorkspace?.id}
        workspaceName={selectedWorkspace?.name}
        onCreated={() => queryClient.invalidateQueries(['inviteCodes'])}
      />

      <JoinWorkspaceDialog
        open={joinWorkspaceOpen}
        onClose={() => setJoinWorkspaceOpen(false)}
        currentUser={currentUser}
        onJoined={() => {
          queryClient.invalidateQueries(['memberships']);
          queryClient.invalidateQueries(['workspaces']);
          setJoinWorkspaceOpen(false);
        }}
      />
    </div>
  );
}