import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft, Search, Filter, Plus, SortAsc, SortDesc,
  Calendar, User, CheckCircle2, Circle, AlertCircle, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import PlatformBadge from '@/components/ui/PlatformBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import TaskDetailSheet from '@/components/kanban/TaskDetailSheet';
import TaskCreateDialog from '@/components/kanban/TaskCreateDialog';
import { format } from 'date-fns';

const statusIcons = {
  backlog: Circle,
  ready: Clock,
  'in-progress': Clock,
  review: AlertCircle,
  blocked: AlertCircle,
  done: CheckCircle2
};

export default function TaskList() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('projectId');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTask, setSelectedTask] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

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

  // Filter and sort tasks
  let filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  filteredTasks.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (sortBy === 'created_date' || sortBy === 'due_date') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }
    return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const toggleComplete = async (task) => {
    await base44.entities.Task.update(task.id, {
      is_completed: !task.is_completed,
      status: task.is_completed ? 'in-progress' : 'done',
      completed_at: task.is_completed ? null : new Date().toISOString(),
      completed_by: task.is_completed ? null : currentUser.email
    });
    queryClient.invalidateQueries(['tasks', projectId]);
  };

  if (!project || !currentUser) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('ProjectDetail') + `?id=${projectId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-xl text-gray-900">{project.name} - Tasks</h1>
                <p className="text-sm text-gray-500">{filteredTasks.length} tasks</p>
              </div>
            </div>
            {canEdit && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> New Task
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assignees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => {
                const StatusIcon = statusIcons[task.status] || Circle;
                const assignedMembers = members.filter(m => task.assignees?.includes(m.user_email));

                return (
                  <TableRow 
                    key={task.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedTask(task)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={task.is_completed}
                        onCheckedChange={() => canEdit && toggleComplete(task)}
                        disabled={!canEdit}
                      />
                    </TableCell>
                    <TableCell>
                      <div className={task.is_completed ? 'line-through text-gray-400' : ''}>
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize flex items-center gap-1 w-fit">
                        <StatusIcon className="w-3 h-3" />
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={task.priority} showLabel />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {task.platforms?.slice(0, 2).map(p => (
                          <PlatformBadge key={p} platform={p} size="xs" />
                        ))}
                        {task.platforms?.length > 2 && (
                          <span className="text-xs text-gray-400">+{task.platforms.length - 2}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.due_date ? (
                        <span className="text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {assignedMembers.slice(0, 3).map(member => (
                          <div
                            key={member.user_email}
                            className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                            title={member.user_name}
                          >
                            {(member.user_name || member.user_email)[0].toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TaskDetailSheet
        task={selectedTask}
        project={project}
        members={members}
        currentUser={currentUser}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={() => queryClient.invalidateQueries(['tasks', projectId])}
        canEdit={canEdit}
      />

      <TaskCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        project={project}
        onCreated={() => {
          queryClient.invalidateQueries(['tasks', projectId]);
          setCreateDialogOpen(false);
        }}
      />
    </div>
  );
}