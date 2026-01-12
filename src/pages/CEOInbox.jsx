import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Crown, MessageSquare, CheckCircle2, Clock,
  AlertCircle, Folder
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PlatformBadge from '@/components/ui/PlatformBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import TaskDetailSheet from '@/components/kanban/TaskDetailSheet';
import { formatDistanceToNow } from 'date-fns';

export default function CEOInbox() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const queryClient = useQueryClient();

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

  // Get all CEO questions from workspaces where user is CEO
  const ceoWorkspaceIds = memberships.filter(m => m.role === 'ceo').map(m => m.workspace_id);
  
  const { data: ceoQuestions = [] } = useQuery({
    queryKey: ['ceoQuestions', ceoWorkspaceIds],
    queryFn: async () => {
      if (ceoWorkspaceIds.length === 0) return [];
      const results = await Promise.all(
        ceoWorkspaceIds.map(wsId => 
          base44.entities.Task.filter({ workspace_id: wsId, is_ceo_question: true }, '-created_date')
        )
      );
      return results.flat().sort((a, b) => 
        new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );
    },
    enabled: ceoWorkspaceIds.length > 0
  });

  // Get projects for context
  const projectIds = [...new Set(ceoQuestions.map(q => q.project_id))];
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', projectIds],
    queryFn: async () => {
      if (projectIds.length === 0) return [];
      const results = await Promise.all(
        projectIds.map(id => base44.entities.Project.filter({ id }))
      );
      return results.flat();
    },
    enabled: projectIds.length > 0
  });

  // Get members for task detail
  const { data: allMembers = [] } = useQuery({
    queryKey: ['allMembers', ceoWorkspaceIds],
    queryFn: async () => {
      if (ceoWorkspaceIds.length === 0) return [];
      const results = await Promise.all(
        ceoWorkspaceIds.map(wsId => 
          base44.entities.WorkspaceMember.filter({ workspace_id: wsId })
        )
      );
      return results.flat();
    },
    enabled: ceoWorkspaceIds.length > 0
  });

  const getProjectForTask = (task) => projects.find(p => p.id === task.project_id);
  const getMembersForTask = (task) => allMembers.filter(m => m.workspace_id === task.workspace_id);

  const resolveQuestion = async (task) => {
    await base44.entities.Task.update(task.id, { is_ceo_question: false });
    queryClient.invalidateQueries(['ceoQuestions']);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isCeo = ceoWorkspaceIds.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">CEO Inbox</h1>
                <p className="text-sm text-gray-500">Questions from your team</p>
              </div>
            </div>
            {ceoQuestions.length > 0 && (
              <Badge className="bg-amber-100 text-amber-700">
                {ceoQuestions.length} {ceoQuestions.length === 1 ? 'question' : 'questions'}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {!isCeo ? (
          <div className="text-center py-16">
            <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">CEO Access Required</h3>
            <p className="text-gray-500">You need to be a CEO of a workspace to view this inbox</p>
          </div>
        ) : ceoQuestions.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No pending questions from your team</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {ceoQuestions.map((question, index) => {
                const project = getProjectForTask(question);
                
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-amber-400"
                      onClick={() => setSelectedTask(question)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-5 h-5 text-amber-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {project && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Folder className="w-3 h-3" />
                                  {project.name}
                                </Badge>
                              )}
                              <PriorityBadge priority={question.priority} showLabel />
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 mb-2">{question.title}</h3>
                            
                            {question.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                {question.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {question.platforms?.map(p => (
                                  <PlatformBadge key={p} platform={p} size="xs" />
                                ))}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(question.created_date), { addSuffix: true })}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resolveQuestion(question);
                                  }}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" /> Resolve
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          project={getProjectForTask(selectedTask)}
          members={getMembersForTask(selectedTask)}
          currentUser={currentUser}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => queryClient.invalidateQueries(['ceoQuestions'])}
          canEdit={true}
        />
      )}
    </div>
  );
}