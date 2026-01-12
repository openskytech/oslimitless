import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, AlertCircle, User, ExternalLink } from 'lucide-react';
import PlatformBadge from '@/components/ui/PlatformBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { format, isPast, isToday } from 'date-fns';

const cardColors = {
  yellow: 'bg-gradient-to-br from-yellow-100 to-amber-50 border-yellow-200 shadow-yellow-100',
  pink: 'bg-gradient-to-br from-pink-100 to-rose-50 border-pink-200 shadow-pink-100',
  blue: 'bg-gradient-to-br from-blue-100 to-sky-50 border-blue-200 shadow-blue-100',
  green: 'bg-gradient-to-br from-green-100 to-emerald-50 border-green-200 shadow-green-100',
  purple: 'bg-gradient-to-br from-purple-100 to-violet-50 border-purple-200 shadow-purple-100',
  orange: 'bg-gradient-to-br from-orange-100 to-amber-50 border-orange-200 shadow-orange-100'
};

export default function PostItCard({ task, onClick, isDragging, members = [] }) {
  const color = cardColors[task.card_color] || cardColors.yellow;
  const assignedMembers = members.filter(m => task.assignees?.includes(m.user_email));
  
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !task.is_completed && !isToday(new Date(task.due_date));
  const isDueToday = task.due_date && isToday(new Date(task.due_date));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
      animate={{ 
        opacity: 1, 
        scale: isDragging ? 1.05 : 1, 
        rotate: isDragging ? 3 : Math.random() * 2 - 1,
        boxShadow: isDragging ? '0 20px 40px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.08)'
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02, rotate: 0 }}
      onClick={onClick}
      className={`
        ${color} border-2 rounded-lg p-4 cursor-pointer
        transition-all duration-200
        ${isDragging ? 'z-50' : 'z-0'}
        ${task.is_ceo_question ? 'ring-2 ring-amber-400 ring-offset-2' : ''}
      `}
      style={{
        transformOrigin: 'center center'
      }}
    >
      {/* CEO Question Badge */}
      {task.is_ceo_question && (
        <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
          CEO Q
        </div>
      )}

      {/* Priority & GitHub */}
      <div className="flex items-center justify-between mb-2">
        <PriorityBadge priority={task.priority} size="xs" />
        {(task.github_issue_url || task.github_pr_url) && (
          <ExternalLink className="w-3 h-3 text-gray-400" />
        )}
      </div>

      {/* Title */}
      <h4 className={`font-semibold text-sm text-gray-800 mb-2 line-clamp-2 ${task.is_completed ? 'line-through opacity-60' : ''}`}>
        {task.title}
      </h4>

      {/* Platforms */}
      {task.platforms?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.platforms.slice(0, 3).map(platform => (
            <PlatformBadge key={platform} platform={platform} size="xs" />
          ))}
          {task.platforms.length > 3 && (
            <span className="text-[10px] text-gray-500">+{task.platforms.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5">
        {/* Assignees */}
        <div className="flex -space-x-2">
          {assignedMembers.slice(0, 3).map((member, i) => (
            <div
              key={member.user_email}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
              title={member.user_name || member.user_email}
            >
              {(member.user_name || member.user_email)[0].toUpperCase()}
            </div>
          ))}
          {assignedMembers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-medium text-gray-600">
              +{assignedMembers.length - 3}
            </div>
          )}
          {assignedMembers.length === 0 && (
            <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <User className="w-3 h-3 text-gray-400" />
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-gray-500">
          {task.comment_count > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <MessageSquare className="w-3 h-3" />
              {task.comment_count}
            </span>
          )}
          {task.due_date && (
            <span className={`flex items-center gap-0.5 text-[10px] ${isOverdue ? 'text-red-500 font-medium' : isDueToday ? 'text-amber-500 font-medium' : ''}`}>
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}