import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import KanbanColumn from './KanbanColumn';
import TaskDetailSheet from './TaskDetailSheet';
import TaskCreateDialog from './TaskCreateDialog';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const COLUMNS = ['backlog', 'ready', 'in-progress', 'review', 'blocked', 'done'];

export default function KanbanBoard({ 
  tasks, 
  project, 
  members, 
  currentUser,
  onQuip,
  canEdit = true 
}) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogStatus, setCreateDialogStatus] = useState('backlog');
  const queryClient = useQueryClient();

  const tasksByColumn = COLUMNS.reduce((acc, status) => {
    acc[status] = tasks
      .filter(t => t.status === status)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    return acc;
  }, {});

  const handleDragEnd = async (result) => {
    if (!result.destination || !canEdit) return;

    const { source, destination, draggableId } = result;
    
    // Same position - no change
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;
    const isCompleting = newStatus === 'done' && task.status !== 'done';
    const isBlocking = newStatus === 'blocked' && task.status !== 'blocked';

    // Optimistic update
    const updates = {
      status: newStatus,
      order: destination.index
    };

    if (isCompleting) {
      updates.is_completed = true;
      updates.completed_at = new Date().toISOString();
      updates.completed_by = currentUser.email;
      onQuip?.('task_complete');
    }

    if (isBlocking) {
      onQuip?.('blocked');
    }

    try {
      await base44.entities.Task.update(task.id, updates);
      queryClient.invalidateQueries(['tasks', project.id]);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleAddTask = (status) => {
    setCreateDialogStatus(status);
    setCreateDialogOpen(true);
  };

  const handleTaskCreated = () => {
    queryClient.invalidateQueries(['tasks', project.id]);
    setCreateDialogOpen(false);
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 px-2">
          {COLUMNS.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByColumn[status]}
              onAddTask={handleAddTask}
              onTaskClick={setSelectedTask}
              members={members}
              canEdit={canEdit}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskDetailSheet
        task={selectedTask}
        project={project}
        members={members}
        currentUser={currentUser}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={() => queryClient.invalidateQueries(['tasks', project.id])}
        canEdit={canEdit}
      />

      <TaskCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        project={project}
        initialStatus={createDialogStatus}
        onCreated={handleTaskCreated}
      />
    </>
  );
}