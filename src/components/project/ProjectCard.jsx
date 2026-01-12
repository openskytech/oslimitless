import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Folder, ArrowRight, CheckCircle2, Clock, AlertCircle, 
  LayoutGrid, ListTodo 
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import PlatformBadge from '@/components/ui/PlatformBadge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function ProjectCard({ project, taskStats = {} }) {
  const total = taskStats.total || 0;
  const done = taskStats.done || 0;
  const inProgress = taskStats.inProgress || 0;
  const blocked = taskStats.blocked || 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={createPageUrl('ProjectDetail') + `?id=${project.id}`}>
        <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-200 overflow-hidden group cursor-pointer">
          {/* Color Bar */}
          <div 
            className="h-2"
            style={{ 
              background: project.color || 'linear-gradient(90deg, #6366f1, #8b5cf6)' 
            }}
          />
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Folder className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {project.name}
                  </h3>
                  <StatusBadge status={project.status} size="sm" />
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Description */}
            {project.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
            )}

            {/* Platforms */}
            {project.platforms?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.platforms.map(platform => (
                  <PlatformBadge key={platform} platform={platform} size="xs" />
                ))}
              </div>
            )}

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500">Progress</span>
                <span className="font-semibold text-gray-700">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            {/* Task Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-gray-500">
                  <ListTodo className="w-3.5 h-3.5" />
                  {total} tasks
                </span>
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {done}
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                  {inProgress}
                </span>
                {blocked > 0 && (
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {blocked}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}