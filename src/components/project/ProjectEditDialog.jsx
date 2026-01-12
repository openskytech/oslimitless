import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import PlatformBadge from '@/components/ui/PlatformBadge';

const PLATFORMS = ['web', 'ios', 'android', 'api', 'other'];

export default function ProjectEditDialog({ open, onClose, project, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    if (project) {
      setPlatforms(project.platforms || []);
    }
  }, [project]);

  const togglePlatform = (platform) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await base44.entities.Project.update(project.id, { platforms });
      onUpdated?.();
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project Platforms</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Label className="mb-3 block">Target Platforms</Label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(platform => (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={`transition-all ${
                  platforms.includes(platform) 
                    ? 'ring-2 ring-offset-1 ring-indigo-500' 
                    : 'opacity-50 hover:opacity-75'
                }`}
              >
                <PlatformBadge platform={platform} size="md" />
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}