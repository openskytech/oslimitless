import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Save, Sparkles, Bell } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    workspace_name: '',
    workspace_description: '',
    teams_webhook_url: '',
    quips_enabled: true
  });
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
          const ws = workspaces[0];
          setWorkspace(ws);
          setSettings({
            workspace_name: ws.name || '',
            workspace_description: ws.description || '',
            teams_webhook_url: ws.teams_webhook_url || '',
            quips_enabled: ws.quips_enabled !== false
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const canManageSettings = membership?.role === 'ceo' || membership?.role === 'manager';

  const handleSave = async () => {
    if (!canManageSettings) return;
    setLoading(true);
    try {
      await base44.entities.Workspace.update(workspace.id, {
        name: settings.workspace_name,
        description: settings.workspace_description,
        teams_webhook_url: settings.teams_webhook_url,
        quips_enabled: settings.quips_enabled
      });
      queryClient.invalidateQueries(['workspace']);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
    setLoading(false);
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-indigo-600" />
            Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage workspace preferences</p>
        </div>

        {/* Workspace Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Workspace Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Workspace Name</Label>
              <Input
                value={settings.workspace_name}
                onChange={(e) => setSettings({ ...settings, workspace_name: e.target.value })}
                disabled={!canManageSettings}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={settings.workspace_description}
                onChange={(e) => setSettings({ ...settings, workspace_description: e.target.value })}
                disabled={!canManageSettings}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Microsoft Teams Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Teams Webhook URL</Label>
              <Input
                type="url"
                placeholder="https://outlook.office.com/webhook/..."
                value={settings.teams_webhook_url}
                onChange={(e) => setSettings({ ...settings, teams_webhook_url: e.target.value })}
                disabled={!canManageSettings}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get notifications in Teams when tasks are completed or assigned
              </p>
            </div>
          </CardContent>
        </Card>

        {/* UI Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              UI Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Quirky UI Quips</p>
                <p className="text-sm text-gray-600 mt-1">
                  Show fun messages throughout the app
                </p>
              </div>
              <Switch
                checked={settings.quips_enabled}
                onCheckedChange={(v) => setSettings({ ...settings, quips_enabled: v })}
                disabled={!canManageSettings}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="mt-1" />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={membership?.role || ''} disabled className="mt-1 capitalize" />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        {canManageSettings && (
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}