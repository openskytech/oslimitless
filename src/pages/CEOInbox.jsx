import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import PlatformBadge from '@/components/ui/PlatformBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { format } from 'date-fns';

export default function CEOInbox() {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);

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
        
        if (memberships[0].role !== 'ceo') {
          window.location.href = createPageUrl('Home');
          return;
        }
        
        const workspaces = await base44.entities.Workspace.filter({ id: memberships[0].workspace_id });
        if (workspaces.length > 0) {
          setWorkspace(workspaces[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const { data: ceoQuestions = [], isLoading } = useQuery({
    queryKey: ['ceo-questions', workspace?.id],
    queryFn: () => base44.entities.Task.filter({ 
      workspace_id: workspace.id, 
      is_ceo_question: true 
    }, '-created_date'),
    enabled: !!workspace?.id
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', workspace?.id],
    queryFn: () => base44.entities.Project.filter({ workspace_id: workspace.id }),
    enabled: !!workspace?.id
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', workspace?.id],
    queryFn: () => base44.entities.WorkspaceMember.filter({ workspace_id: workspace.id }),
    enabled: !!workspace?.id
  });

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-900 flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-600" />
            CEO Inbox
          </h1>
          <p className="text-amber-700 mt-1">Tasks that need your attention</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-700 font-medium">Total Questions</p>
              <p className="text-3xl font-bold text-amber-900 mt-1">{ceoQuestions.length}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="pt-6">
              <p className="text-sm text-red-700 font-medium">Urgent</p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {ceoQuestions.filter(q => q.priority === 'urgent').length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-700 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {ceoQuestions.filter(q => q.status === 'in-progress').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : ceoQuestions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Crown className="w-16 h-16 mx-auto text-amber-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">All clear!</h3>
              <p className="text-gray-500">No questions waiting for your response</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {ceoQuestions.map(task => {
              const project = projects.find(p => p.id === task.project_id);
              const assignees = members.filter(m => task.assignees?.includes(m.user_email));
              
              return (
                <Link key={task.id} to={createPageUrl(`ProjectDetail?id=${task.project_id}`)}>
                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 border-amber-200 hover:border-amber-400">
                    <CardContent className="py-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <PriorityBadge priority={task.priority} showLabel />
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-sm text-gray-600 capitalize">{task.status.replace('-', ' ')}</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="font-medium">{project?.name}</span>
                            <span>•</span>
                            <span>{format(new Date(task.created_date), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-gray-700 mb-4 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {task.platforms?.map(platform => (
                            <PlatformBadge key={platform} platform={platform} size="sm" />
                          ))}
                        </div>

                        {assignees.length > 0 && (
                          <div className="flex -space-x-2">
                            {assignees.map(member => (
                              <div
                                key={member.user_email}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                                title={member.user_name || member.user_email}
                              >
                                {(member.user_name || member.user_email)[0].toUpperCase()}
                              </div>
                            ))}
                          </div>
                        )}
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
  );
}