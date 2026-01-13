import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import PlatformBadge from '@/components/ui/PlatformBadge';
import { Image, X, Upload } from 'lucide-react';

const PLATFORMS = ['web', 'ios', 'android', 'api', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CARD_COLORS = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

export default function TaskCreateDialog({ open, onClose, project, initialStatus = 'backlog', onCreated, members = [] }) {
  const [loading, setLoading] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [task, setTask] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium',
    platforms: [],
    assignees: [],
    card_color: 'yellow',
    screenshot_urls: []
  });

  const togglePlatform = (platform) => {
    const platforms = task.platforms || [];
    if (platforms.includes(platform)) {
      setTask({ ...task, platforms: platforms.filter(p => p !== platform) });
    } else {
      setTask({ ...task, platforms: [...platforms, platform] });
    }
  };

  const toggleAssignee = (email) => {
    const assignees = task.assignees || [];
    if (assignees.includes(email)) {
      setTask({ ...task, assignees: assignees.filter(a => a !== email) });
    } else {
      setTask({ ...task, assignees: [...assignees, email] });
    }
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingScreenshot(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setTask({ 
        ...task, 
        screenshot_urls: [...(task.screenshot_urls || []), file_url] 
      });
    } catch (error) {
      console.error('Failed to upload screenshot:', error);
    }
    setUploadingScreenshot(false);
  };

  const removeScreenshot = (urlToRemove) => {
    setTask({
      ...task,
      screenshot_urls: (task.screenshot_urls || []).filter(url => url !== urlToRemove)
    });
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
        assignees: [],
        card_color: 'yellow',
        screenshot_urls: []
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
            <Label className="mb-2 block">Assignees</Label>
            <div className="flex flex-wrap gap-2">
              {members.map(member => {
                const isAssigned = (task.assignees || []).includes(member.user_email);
                return (
                  <button
                    key={member.user_email}
                    type="button"
                    onClick={() => toggleAssignee(member.user_email)}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all
                      ${isAssigned 
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                      }
                      hover:border-indigo-300 cursor-pointer
                    `}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {(member.user_name || member.user_email)[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{member.user_name || member.user_email}</span>
                  </button>
                );
              })}
            </div>
            {members.length === 0 && (
              <p className="text-gray-400 text-sm">No team members yet</p>
            )}
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

          <div>
            <Label className="mb-2 block">Screenshots</Label>
            <div className="space-y-3">
              {(task.screenshot_urls || []).length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {task.screenshot_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Screenshot ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(url)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploadingScreenshot}
                onClick={() => document.getElementById('screenshot-upload').click()}
              >
                {uploadingScreenshot ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Add Screenshot
                  </>
                )}
              </Button>
              <input
                id="screenshot-upload"
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
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