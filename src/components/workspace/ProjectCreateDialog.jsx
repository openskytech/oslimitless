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
const STATUSES = ['idea', 'active', 'shipped', 'maintenance', 'end-of-life'];

export default function ProjectCreateDialog({ open, onClose, workspace, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState({
    name: '',
    description: '',
    status: 'idea',
    platforms: [],
    github_repos: []
  });

  const togglePlatform = (platform) => {
    const platforms = project.platforms || [];
    if (platforms.includes(platform)) {
      setProject({ ...project, platforms: platforms.filter(p => p !== platform) });
    } else {
      setProject({ ...project, platforms: [...platforms, platform] });
    }
  };

  const handleCreate = async () => {
    if (!project.name.trim()) return;
    setLoading(true);
    try {
      await base44.entities.Project.create({
        ...project,
        workspace_id: workspace.id
      });
      onCreated?.();
      setProject({
        name: '',
        description: '',
        status: 'idea',
        platforms: [],
        github_repos: []
      });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Project Name *</Label>
            <Input
              placeholder="e.g., Mobile App Rewrite"
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="What is this project about?"
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={project.status}
              onValueChange={(v) => setProject({ ...project, status: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s.replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Platforms *</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(platform => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`transition-all ${
                    (project.platforms || []).includes(platform) 
                      ? 'ring-2 ring-offset-1 ring-indigo-500' 
                      : 'opacity-50'
                  }`}
                >
                  <PlatformBadge platform={platform} size="md" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleCreate} 
            disabled={loading || !project.name.trim() || project.platforms.length === 0}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}