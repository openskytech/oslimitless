import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import PlatformBadge from '@/components/ui/PlatformBadge';
import { Lightbulb, Zap, Rocket, Wrench, Archive, Plus } from 'lucide-react';

const PLATFORMS = ['web', 'ios', 'android', 'api', 'other'];
const STATUSES = [
  { value: 'idea', label: 'Idea', icon: Lightbulb },
  { value: 'active', label: 'Active', icon: Zap },
  { value: 'shipped', label: 'Shipped', icon: Rocket },
  { value: 'maintenance', label: 'Maintenance', icon: Wrench },
  { value: 'end-of-life', label: 'End of Life', icon: Archive }
];

const COLORS = [
  'linear-gradient(90deg, #6366f1, #8b5cf6)',
  'linear-gradient(90deg, #ec4899, #f43f5e)',
  'linear-gradient(90deg, #14b8a6, #10b981)',
  'linear-gradient(90deg, #f59e0b, #f97316)',
  'linear-gradient(90deg, #3b82f6, #06b6d4)',
  'linear-gradient(90deg, #8b5cf6, #d946ef)'
];

export default function ProjectCreateDialog({ open, onClose, workspaceId, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState({
    name: '',
    description: '',
    status: 'idea',
    platforms: [],
    github_repos: [''],
    color: COLORS[0]
  });

  const togglePlatform = (platform) => {
    const platforms = project.platforms || [];
    if (platforms.includes(platform)) {
      setProject({ ...project, platforms: platforms.filter(p => p !== platform) });
    } else {
      setProject({ ...project, platforms: [...platforms, platform] });
    }
  };

  const updateGithubRepo = (index, value) => {
    const repos = [...project.github_repos];
    repos[index] = value;
    setProject({ ...project, github_repos: repos });
  };

  const addGithubRepo = () => {
    setProject({ ...project, github_repos: [...project.github_repos, ''] });
  };

  const removeGithubRepo = (index) => {
    const repos = project.github_repos.filter((_, i) => i !== index);
    setProject({ ...project, github_repos: repos.length ? repos : [''] });
  };

  const handleCreate = async () => {
    if (!project.name.trim()) return;
    setLoading(true);
    try {
      const newProject = await base44.entities.Project.create({
        ...project,
        workspace_id: workspaceId,
        github_repos: project.github_repos.filter(r => r.trim())
      });
      onCreated?.(newProject);
      setProject({
        name: '',
        description: '',
        status: 'idea',
        platforms: [],
        github_repos: [''],
        color: COLORS[0]
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

        <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto">
          <div>
            <Label>Project Name *</Label>
            <Input
              placeholder="My Awesome App"
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
                  <SelectItem key={s.value} value={s.value}>
                    <div className="flex items-center gap-2">
                      <s.icon className="w-4 h-4" />
                      {s.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Target Platforms</Label>
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

          <div>
            <Label className="mb-2 block">Project Color</Label>
            <div className="flex gap-2">
              {COLORS.map((color, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setProject({ ...project, color })}
                  className={`
                    w-8 h-8 rounded-lg transition-all
                    ${project.color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}
                  `}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">GitHub Repositories</Label>
            <div className="space-y-2">
              {project.github_repos.map((repo, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="https://github.com/org/repo"
                    value={repo}
                    onChange={(e) => updateGithubRepo(index, e.target.value)}
                  />
                  {project.github_repos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGithubRepo(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addGithubRepo}
                className="text-indigo-600"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Repository
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !project.name.trim()}>
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}