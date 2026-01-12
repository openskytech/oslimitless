import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal, AlertCircle, Clock, CheckCircle2, PlayCircle, Search, Inbox } from 'lucide-react';
import PostItCard from './PostItCard';
import { Button } from '@/components/ui/button';

const columnConfig = {
  backlog: { 
    icon: Inbox, 
    color: 'from-gray-500 to-slate-600',
    bgLight: 'bg-gray-50',
    label: 'Backlog'
  },
  ready: { 
    icon: Clock, 
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    label: 'Ready'
  },
  'in-progress': { 
    icon: PlayCircle, 
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    label: 'In Progress'
  },
  review: { 
    icon: Search, 
    color: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    label: 'Review'
  },
  blocked: { 
    icon: AlertCircle, 
    color: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    label: 'Blocked'
  },
  done: { 
    icon: CheckCircle2, 
    color: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50',
    label: 'Done'
  }
};

export default function KanbanColumn({ 
  status, 
  tasks, 
  onAddTask, 
  onTaskClick, 
  members,
  canEdit = true 
}) {
  const config = columnConfig[status] || columnConfig.backlog;
  const Icon = config.icon;

  return (
    <div className="flex flex-col min-w-[300px] max-w-[320px] h-full">
      {/* Column Header */}
      <div className={`bg-gradient-to-r ${config.color} rounded-t-xl px-4 py-3 shadow-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white">{config.label}</h3>
            <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => onAddTask(status)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Column Body */}
      <Droppable droppableId={status} isDropDisabled={!canEdit}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 p-3 space-y-3 overflow-y-auto rounded-b-xl border-2 border-t-0
              ${config.bgLight} 
              ${snapshot.isDraggingOver ? 'border-dashed border-indigo-400 bg-indigo-50/50' : 'border-gray-200'}
              transition-colors duration-200
            `}
            style={{ minHeight: '200px' }}
          >
            {tasks.map((task, index) => (
              <Draggable 
                key={task.id} 
                draggableId={task.id} 
                index={index}
                isDragDisabled={!canEdit}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <PostItCard
                      task={task}
                      onClick={() => onTaskClick(task)}
                      isDragging={snapshot.isDragging}
                      members={members}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Icon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No tasks yet</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}