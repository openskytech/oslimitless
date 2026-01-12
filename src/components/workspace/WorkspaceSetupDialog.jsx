import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Building2, Ticket, Rocket } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WorkspaceSetupDialog({ open, onComplete, user }) {
  const [activeTab, setActiveTab] = useState('join');
  const [loading, setLoading] = useState(false);
  
  // Join workspace
  const [inviteCode, setInviteCode] = useState('');
  
  // Create workspace
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDesc, setWorkspaceDesc] = useState('');

  const handleJoinWorkspace = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    try {
      const codes = await base44.entities.InviteCode.filter({ code: inviteCode.trim(), is_active: true });
      
      if (codes.length === 0) {
        alert('Invalid or expired invite code');
        setLoading(false);
        return;
      }
      
      const code = codes[0];
      
      // Check if already a member
      const existing = await base44.entities.WorkspaceMember.filter({
        workspace_id: code.workspace_id,
        user_email: user.email
      });
      
      if (existing.length > 0) {
        alert('You are already a member of this workspace');
        onComplete?.();
        setLoading(false);
        return;
      }
      
      // Create membership
      await base44.entities.WorkspaceMember.create({
        workspace_id: code.workspace_id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        role: code.default_role
      });
      
      // Update invite code usage
      await base44.entities.InviteCode.update(code.id, {
        use_count: (code.use_count || 0) + 1
      });
      
      onComplete?.();
    } catch (error) {
      console.error('Failed to join workspace:', error);
      alert('Failed to join workspace');
    }
    setLoading(false);
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) return;
    setLoading(true);
    try {
      const workspace = await base44.entities.Workspace.create({
        name: workspaceName,
        description: workspaceDesc,
        quips_enabled: true
      });
      
      await base44.entities.WorkspaceMember.create({
        workspace_id: workspace.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        role: 'ceo'
      });
      
      // Create seed data
      await createSeedData(workspace.id);
      
      onComplete?.();
    } catch (error) {
      console.error('Failed to create workspace:', error);
      alert('Failed to create workspace');
    }
    setLoading(false);
  };

  const createSeedData = async (workspaceId) => {
    try {
      // Create vault categories
      const categories = await base44.entities.VaultCategory.bulkCreate([
        { workspace_id: workspaceId, name: 'Hosting', icon: 'server', color: 'blue' },
        { workspace_id: workspaceId, name: 'Apple', icon: 'apple', color: 'gray' },
        { workspace_id: workspaceId, name: 'Google', icon: 'globe', color: 'red' },
        { workspace_id: workspaceId, name: 'Cloud Services', icon: 'cloud', color: 'indigo' },
        { workspace_id: workspaceId, name: 'Domains', icon: 'link', color: 'purple' }
      ]);

      // Create Project 1: Paycheck Pathfinder
      const project1 = await base44.entities.Project.create({
        workspace_id: workspaceId,
        name: 'Paycheck Pathfinder',
        description: 'Help users find their paycheck information easily',
        status: 'active',
        platforms: ['web', 'ios', 'android'],
        color: 'blue'
      });

      await base44.entities.Task.bulkCreate([
        {
          workspace_id: workspaceId,
          project_id: project1.id,
          title: 'App Store setup',
          description: 'Configure App Store Connect and submit for review',
          status: 'in-progress',
          priority: 'high',
          platforms: ['ios'],
          card_color: 'blue'
        },
        {
          workspace_id: workspaceId,
          project_id: project1.id,
          title: 'Google Play setup',
          description: 'Configure Google Play Console and prepare release',
          status: 'ready',
          priority: 'high',
          platforms: ['android'],
          card_color: 'green'
        },
        {
          workspace_id: workspaceId,
          project_id: project1.id,
          title: 'Privacy policy hosted',
          description: 'Create and host privacy policy on website',
          status: 'done',
          priority: 'medium',
          platforms: ['web'],
          is_completed: true,
          card_color: 'yellow'
        },
        {
          workspace_id: workspaceId,
          project_id: project1.id,
          title: 'Analytics integration',
          description: 'Integrate analytics tracking across all platforms',
          status: 'backlog',
          priority: 'medium',
          platforms: ['web', 'ios', 'android'],
          card_color: 'purple'
        },
        {
          workspace_id: workspaceId,
          project_id: project1.id,
          title: 'QA pass',
          description: 'Complete QA testing before launch',
          status: 'review',
          priority: 'urgent',
          platforms: ['web', 'ios', 'android'],
          card_color: 'pink'
        }
      ]);

      // Create Project 2: OpenSky Internal
      const project2 = await base44.entities.Project.create({
        workspace_id: workspaceId,
        name: 'OpenSky Internal',
        description: 'Internal tools and automation',
        status: 'active',
        platforms: ['web', 'api'],
        color: 'purple'
      });

      await base44.entities.Task.bulkCreate([
        {
          workspace_id: workspaceId,
          project_id: project2.id,
          title: 'Kanban MVP',
          description: 'Build the core Kanban board functionality',
          status: 'in-progress',
          priority: 'urgent',
          platforms: ['web'],
          card_color: 'yellow'
        },
        {
          workspace_id: workspaceId,
          project_id: project2.id,
          title: 'Teams integration',
          description: 'Set up Microsoft Teams webhook notifications',
          status: 'ready',
          priority: 'high',
          platforms: ['api'],
          card_color: 'blue'
        },
        {
          workspace_id: workspaceId,
          project_id: project2.id,
          title: 'Vault setup',
          description: 'Create secure password vault with access controls',
          status: 'backlog',
          priority: 'high',
          platforms: ['web'],
          card_color: 'pink'
        }
      ]);
    } catch (error) {
      console.error('Failed to create seed data:', error);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to OSLimitless</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="join">
              <Ticket className="w-4 h-4 mr-2" />
              Join Team
            </TabsTrigger>
            <TabsTrigger value="create">
              <Rocket className="w-4 h-4 mr-2" />
              Create Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="join" className="space-y-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-800">
                Have an invite code from your team? Enter it below to join.
              </p>
            </Card>

            <div className="space-y-3">
              <div>
                <Label>Invite Code</Label>
                <Input
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={handleJoinWorkspace} 
                disabled={loading || !inviteCode.trim()}
                className="w-full"
              >
                {loading ? 'Joining...' : 'Join Workspace'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card className="p-4 bg-purple-50 border-purple-200">
              <p className="text-sm text-purple-800">
                Create a new workspace for your team with sample projects.
              </p>
            </Card>

            <div className="space-y-3">
              <div>
                <Label>Workspace Name *</Label>
                <Input
                  placeholder="e.g., Acme Inc"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  placeholder="What does your team do?"
                  value={workspaceDesc}
                  onChange={(e) => setWorkspaceDesc(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={handleCreateWorkspace} 
                disabled={loading || !workspaceName.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? 'Creating...' : 'Create Workspace'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}