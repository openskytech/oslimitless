import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, LayoutGrid, List, BarChart3, Shield, 
  Settings, ExternalLink, Github, Folder, Rocket, 
  Lightbulb, Zap, Wrench, Package, Code, Database, 
  Cloud, Cpu, Layers, Box
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import StatusBadge from '@/components/ui/StatusBadge';
import PlatformBadge from '@/components/ui/PlatformBadge';
import QuipToast, { useQuip } from '@/components/ui/QuipToast';
import NotificationBell from '@/components/notifications/NotificationBell';
import ProjectEditDialog from '@/components/project/ProjectEditDialog';

export default function ProjectDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('board');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { quip, showQuip } = useQuip('general', true);

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => base44.entities.Task.filter({ project_id: projectId }),
    enabled: !!projectId
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', project?.workspace_id],
    queryFn: () => base44.entities.WorkspaceMember.filter({ workspace_id: project.workspace_id }),
    enabled: !!project?.workspace_id
  });

  const currentMembership = members.find(m => m.user_email === currentUser?.email);
  const userRole = currentMembership?.role || 'viewer';
  const canEdit = ['ceo', 'manager', 'contributor'].includes(userRole);
  const canManage = ['ceo', 'manager'].includes(userRole);

  const iconMap = {
    folder: Folder, rocket: Rocket, lightbulb: Lightbulb, zap: Zap,
    wrench: Wrench, package: Package, code: Code, database: Database,
    cloud: Cloud, cpu: Cpu, layers: Layers, box: Box
  };
  const ProjectIcon = iconMap[project.icon] || Folder;

  if (!project || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              {project.icon_url ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                  <img src={project.icon_url} alt={project.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: project.color || 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <ProjectIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="font-bold text-xl text-gray-900">{project.name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={project.status} size="sm" />
                  {project.platforms?.slice(0, 3).map(p => (
                    <PlatformBadge key={p} platform={p} size="xs" />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {project.github_repos?.length > 0 && (
                <a 
                  href={project.github_repos[0]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Github className="w-4 h-4 mr-1" /> GitHub
                  </Button>
                </a>
              )}
              {canManage && (
                <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                  <Settings className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
              <NotificationBell 
                userEmail={currentUser.email} 
                workspaceId={project.workspace_id} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-gray-100/80 p-1">
            <TabsTrigger value="board" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> Board
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" /> List
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="vault" className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Vault
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-6">
            <div className="overflow-x-auto pb-6">
              <KanbanBoard
                tasks={tasks}
                project={project}
                members={members}
                currentUser={currentUser}
                onQuip={showQuip}
                canEdit={canEdit}
              />
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <Link to={createPageUrl('TaskList') + `?projectId=${projectId}`}>
              <Button>Open List View</Button>
            </Link>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Link to={createPageUrl('ProjectAnalytics') + `?projectId=${projectId}`}>
              <Button>Open Analytics</Button>
            </Link>
          </TabsContent>

          <TabsContent value="vault" className="mt-6">
            <Link to={createPageUrl('Vault') + `?workspaceId=${project.workspace_id}`}>
              <Button>Open Vault</Button>
            </Link>
          </TabsContent>
        </Tabs>
      </div>

      <QuipToast quip={quip} />
      
      <ProjectEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        project={project}
        onUpdated={() => {
          queryClient.invalidateQueries(['project']);
          queryClient.invalidateQueries(['projects']);
        }}
      />
    </div>
  );
}