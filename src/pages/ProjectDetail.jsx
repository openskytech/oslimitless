import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutGrid, List, BarChart3, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import PlatformBadge from '@/components/ui/PlatformBadge';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import QuipToast, { useQuip } from '@/components/ui/QuipToast';

export default function ProjectDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);
  const { quip, showQuip } = useQuip('general', workspace?.quips_enabled);

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

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => base44.entities.Task.filter({ project_id: projectId }, '-created_date'),
    enabled: !!projectId
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', workspace?.id],
    queryFn: () => base44.entities.WorkspaceMember.filter({ workspace_id: workspace.id }),
    enabled: !!workspace?.id
  });

  const canEdit = membership?.role !== 'viewer';

  if (!project || projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <QuipToast quip={quip} />
      
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-500">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={project.status} size="md" />
              {project.platforms?.map(platform => (
                <PlatformBadge key={platform} platform={platform} size="md" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs defaultValue="board" className="w-full">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="board" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Board
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="vault" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Vault
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-6">
            <KanbanBoard
              tasks={tasks}
              project={project}
              members={members}
              currentUser={user}
              onQuip={showQuip}
              canEdit={canEdit}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <p className="text-gray-500 text-center">List view coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <p className="text-gray-500 text-center">Analytics coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="vault" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <p className="text-gray-500 text-center">Vault integration coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}