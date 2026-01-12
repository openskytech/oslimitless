import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import PlatformBadge from '@/components/ui/PlatformBadge';

const PLATFORMS = ['web', 'ios', 'android', 'api', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CARD_COLORS = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

export default function TaskCreateDialog({ open, onClose, project, initialStatus = 'backlog', onCreated }) {
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium',
    platforms: [],
    card_color: 'yellow'
  });

  const togglePlatform = (platform) => {
    const platforms = task.platforms || [];
    if (platforms.includes(platform)) {
      setTask({ ...task, platforms: platforms.filter(p => p !== platform) });
    } else {
      setTask({ ...task, platforms: [...platforms, platform] });
    }
  };

  const handleCreate = async () => {
    if (!task.title.trim()) return;
    setLoading(true);
    try {
      await base44.entities.Task.create({
        ...task,
        project_id: project.id,
        workspace_id: project.workspace_id
      });
      onCreated?.();
      setTask({
        title: '',
        description: '',
        status: initialStatus,
        priority: 'medium',
        platforms: [],
        card_color: 'yellow'
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Title *</Label>
            <Input
              placeholder="What needs to be done?"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Add details (markdown supported)..."
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Label className="mb-2 block">Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(platform => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`transition-all ${
                    (task.platforms || []).includes(platform) 
                      ? 'ring-2 ring-offset-1 ring-indigo-500' 
                      : 'opacity-50'
                  }`}
                >
                  <PlatformBadge platform={platform} size="md" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select
                value={task.priority}
                onValueChange={(v) => setTask({ ...task, priority: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Card Color</Label>
              <div className="flex gap-2 mt-2">
                {CARD_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTask({ ...task, card_color: color })}
                    className={`
                      w-7 h-7 rounded-lg transition-all
                      ${color === 'yellow' ? 'bg-yellow-200' : ''}
                      ${color === 'pink' ? 'bg-pink-200' : ''}
                      ${color === 'blue' ? 'bg-blue-200' : ''}
                      ${color === 'green' ? 'bg-green-200' : ''}
                      ${color === 'purple' ? 'bg-purple-200' : ''}
                      ${color === 'orange' ? 'bg-orange-200' : ''}
                      ${task.card_color === color ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}
                    `}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !task.title.trim()}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}