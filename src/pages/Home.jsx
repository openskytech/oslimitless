import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, Folder, Users, Ticket, Settings, Crown,
  ChevronRight, Sparkles, Zap, Rocket
} from 'lucide-react';
import ProjectCard from '@/components/project/ProjectCard';
import ProjectCreateDialog from '@/components/project/ProjectCreateDialog';
import JoinWorkspaceDialog from '@/components/workspace/JoinWorkspaceDialog';
import InviteCodeDialog from '@/components/workspace/InviteCodeDialog';
import QuipToast, { useQuip } from '@/components/ui/QuipToast';
import RoleBadge from '@/components/ui/RoleBadge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [joinWorkspaceOpen, setJoinWorkspaceOpen] = useState(false);
  const [inviteCodeOpen, setInviteCodeOpen] = useState(false);
  const queryClient = useQueryClient();
  const { quip, showQuip } = useQuip('project_load', true);

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  // Get user's workspace memberships
  const { data: memberships = [] } = useQuery({
    queryKey: ['memberships', currentUser?.email],
    queryFn: () => base44.entities.WorkspaceMember.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email
  });

  // Get workspace details
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

  // Auto-select first workspace
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0]);
      setTimeout(() => showQuip(), 500);
    }
  }, [workspaces]);

  // Get projects for selected workspace
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', selectedWorkspace?.id],
    queryFn: () => base44.entities.Project.filter({ workspace_id: selectedWorkspace.id }),
    enabled: !!selectedWorkspace?.id
  });

  // Get all tasks for task stats
  const { data: allTasks = [] } = useQuery({
    queryKey: ['allTasks', selectedWorkspace?.id],
    queryFn: () => base44.entities.Task.filter({ workspace_id: selectedWorkspace.id }),
    enabled: !!selectedWorkspace?.id
  });

  const getTaskStats = (projectId) => {
    const projectTasks = allTasks.filter(t => t.project_id === projectId);
    return {
      total: projectTasks.length,
      done: projectTasks.filter(t => t.status === 'done').length,
      inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
      blocked: projectTasks.filter(t => t.status === 'blocked').length
    };
  };

  const currentMembership = memberships.find(m => m.workspace_id === selectedWorkspace?.id);
  const userRole = currentMembership?.role || 'viewer';
  const canManage = ['ceo', 'manager'].includes(userRole);

  const createWorkspace = async () => {
    const workspace = await base44.entities.Workspace.create({
      name: 'My Workspace',
      description: 'Default workspace',
      quips_enabled: true
    });
    await base44.entities.WorkspaceMember.create({
      workspace_id: workspace.id,
      user_email: currentUser.email,
      user_name: currentUser.full_name || currentUser.email,
      role: 'ceo'
    });
    queryClient.invalidateQueries(['memberships']);
    queryClient.invalidateQueries(['workspaces']);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  // No workspace - show onboarding
  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to OSLimitless</h1>
            <p className="text-gray-500">Let's get you set up with a workspace</p>
          </div>

          <div className="space-y-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-indigo-300"
              onClick={createWorkspace}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Create a Workspace</h3>
                  <p className="text-sm text-gray-500">Start your own team as CEO</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-indigo-300"
              onClick={() => setJoinWorkspaceOpen(true)}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Join with Invite Code</h3>
                  <p className="text-sm text-gray-500">Enter a code from your team</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <JoinWorkspaceDialog
          open={joinWorkspaceOpen}
          onClose={() => setJoinWorkspaceOpen(false)}
          currentUser={currentUser}
          onJoined={() => {
            queryClient.invalidateQueries(['memberships']);
            queryClient.invalidateQueries(['workspaces']);
          }}
        />
      </div>
    );
  }

  const darkMode = document.documentElement.classList.contains('dark');

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-800/90' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {userRole === 'ceo' && (
                <Button variant="outline" size="sm" onClick={() => setInviteCodeOpen(true)}>
                  <Ticket className="w-4 h-4 mr-1" /> Invite
                </Button>
              )}
              <Link to={createPageUrl('CEOInbox')}>
                <Button variant="ghost" size="sm">
                  <Crown className="w-4 h-4 mr-1" /> CEO Inbox
                </Button>
              </Link>
              <Link to={createPageUrl('Settings')}>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Projects</h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Manage your team's work from idea to launch</p>
          </div>
          <div className="flex gap-2">
            {canManage && (
              <Button onClick={() => setCreateProjectOpen(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        <AnimatePresence>
          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Folder className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">Create your first project to get started</p>
              {canManage && (
                <Button onClick={() => setCreateProjectOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Create Project
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  taskStats={getTaskStats(project.id)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Dialogs */}
      <ProjectCreateDialog
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        workspaceId={selectedWorkspace?.id}
        onCreated={() => {
          queryClient.invalidateQueries(['projects']);
          setCreateProjectOpen(false);
        }}
      />

      <JoinWorkspaceDialog
        open={joinWorkspaceOpen}
        onClose={() => setJoinWorkspaceOpen(false)}
        currentUser={currentUser}
        onJoined={() => {
          queryClient.invalidateQueries(['memberships']);
          queryClient.invalidateQueries(['workspaces']);
        }}
      />

      <InviteCodeDialog
        open={inviteCodeOpen}
        onClose={() => setInviteCodeOpen(false)}
        workspaceId={selectedWorkspace?.id}
        workspaceName={selectedWorkspace?.name}
      />

      <QuipToast quip={quip} />
    </div>
  );
}