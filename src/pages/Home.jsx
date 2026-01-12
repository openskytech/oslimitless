import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Rocket, Clock, CheckCircle2, AlertTriangle, Users, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import StatusBadge from '@/components/ui/StatusBadge';
import PlatformBadge from '@/components/ui/PlatformBadge';
import QuipToast, { useQuip } from '@/components/ui/QuipToast';
import ProjectCreateDialog from '@/components/workspace/ProjectCreateDialog';
import WorkspaceSetupDialog from '@/components/workspace/WorkspaceSetupDialog';

export default function Home() {
  const [user, setUser] = useState(null);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [setupWorkspaceOpen, setSetupWorkspaceOpen] = useState(false);
  const { quip, showQuip } = useQuip('project_load', workspace?.quips_enabled);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load user's workspace membership
      const memberships = await base44.entities.WorkspaceMember.filter({ user_email: currentUser.email });
      
      if (memberships.length === 0) {
        setSetupWorkspaceOpen(true);
        return;
      }
      
      const membership = memberships[0];
      setCurrentMembership(membership);
      
      // Load workspace
      const workspaces = await base44.entities.Workspace.filter({ id: membership.workspace_id });
      if (workspaces.length > 0) {
        setWorkspace(workspaces[0]);
        showQuip('project_load');
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', workspace?.id],
    queryFn: () => base44.entities.Project.filter({ workspace_id: workspace.id }, '-created_date'),
    enabled: !!workspace?.id
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['all-tasks', workspace?.id],
    queryFn: () => base44.entities.Task.filter({ workspace_id: workspace.id }),
    enabled: !!workspace?.id
  });

  const { data: ceoQuestions = [] } = useQuery({
    queryKey: ['ceo-questions', workspace?.id],
    queryFn: () => base44.entities.Task.filter({ 
      workspace_id: workspace.id, 
      is_ceo_question: true 
    }, '-created_date'),
    enabled: !!workspace?.id && currentMembership?.role === 'ceo'
  });

  const canManageProjects = currentMembership?.role === 'ceo' || currentMembership?.role === 'manager';
  const isCEO = currentMembership?.role === 'ceo';

  const stats = {
    active: projects.filter(p => p.status === 'active').length,
    shipped: projects.filter(p => p.status === 'shipped').length,
    inProgress: allTasks.filter(t => t.status === 'in-progress').length,
    blocked: allTasks.filter(t => t.status === 'blocked').length
  };

  if (!user || !workspace) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading workspace...</p>
          </div>
        </div>
        <WorkspaceSetupDialog 
          open={setupWorkspaceOpen} 
          onComplete={() => {
            setSetupWorkspaceOpen(false);
            loadUser();
          }}
          user={user}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <QuipToast quip={quip} />
      
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {workspace.name}
              </h1>
              <p className="text-gray-500 mt-1">{workspace.description || 'Your project workspace'}</p>
            </div>
            {canManageProjects && (
              <Button onClick={() => setCreateProjectOpen(true)} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Shipped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.shipped}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{stats.inProgress}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Blocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{stats.blocked}</p>
            </CardContent>
          </Card>
        </div>

        {/* CEO Inbox */}
        {isCEO && ceoQuestions.length > 0 && (
          <Card className="mb-8 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Crown className="w-5 h-5" />
                CEO Inbox ({ceoQuestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ceoQuestions.slice(0, 5).map(task => {
                const project = projects.find(p => p.id === task.project_id);
                return (
                  <Link 
                    key={task.id} 
                    to={createPageUrl(`ProjectDetail?id=${task.project_id}`)}
                    className="block p-3 bg-white rounded-lg border border-amber-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{project?.name}</p>
                      </div>
                      <div className="flex gap-1">
                        {task.platforms?.slice(0, 2).map(p => (
                          <PlatformBadge key={p} platform={p} size="xs" />
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
          
          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Rocket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-6">Create your first project to get started</p>
                {canManageProjects && (
                  <Button onClick={() => setCreateProjectOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Project
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => {
                const projectTasks = allTasks.filter(t => t.project_id === project.id);
                const completedTasks = projectTasks.filter(t => t.is_completed).length;
                const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

                return (
                  <Link key={project.id} to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                              {project.name}
                            </CardTitle>
                          </div>
                          <StatusBadge status={project.status} size="sm" />
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                          {project.description || 'No description'}
                        </p>
                      </CardHeader>
                      <CardContent>
                        {/* Platforms */}
                        {project.platforms?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.platforms.map(platform => (
                              <PlatformBadge key={platform} platform={platform} size="sm" />
                            ))}
                          </div>
                        )}

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{completedTasks} / {projectTasks.length} tasks</span>
                            <span>{projectTasks.filter(t => t.status === 'blocked').length} blocked</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ProjectCreateDialog
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        workspace={workspace}
        onCreated={() => {
          queryClient.invalidateQueries(['projects']);
          setCreateProjectOpen(false);
        }}
      />
    </div>
  );
}