import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import PlatformBadge from '@/components/ui/PlatformBadge';
import { 
  Folder, Rocket, Lightbulb, Zap, Wrench, Package, 
  Code, Database, Cloud, Cpu, Layers, Box, Upload, X
} from 'lucide-react';

const PLATFORMS = ['web', 'ios', 'android', 'api', 'other'];

const ICONS = [
  { name: 'folder', Icon: Folder },
  { name: 'rocket', Icon: Rocket },
  { name: 'lightbulb', Icon: Lightbulb },
  { name: 'zap', Icon: Zap },
  { name: 'wrench', Icon: Wrench },
  { name: 'package', Icon: Package },
  { name: 'code', Icon: Code },
  { name: 'database', Icon: Database },
  { name: 'cloud', Icon: Cloud },
  { name: 'cpu', Icon: Cpu },
  { name: 'layers', Icon: Layers },
  { name: 'box', Icon: Box }
];

const COLORS = [
  'linear-gradient(90deg, #6366f1, #8b5cf6)',
  'linear-gradient(90deg, #ec4899, #f43f5e)',
  'linear-gradient(90deg, #14b8a6, #10b981)',
  'linear-gradient(90deg, #f59e0b, #f97316)',
  'linear-gradient(90deg, #3b82f6, #06b6d4)',
  'linear-gradient(90deg, #8b5cf6, #d946ef)'
];

export default function ProjectEditDialog({ open, onClose, project, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [icon, setIcon] = useState('folder');
  const [color, setColor] = useState(COLORS[0]);
  const [iconUrl, setIconUrl] = useState(null);

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setPlatforms(project.platforms || []);
      setIcon(project.icon || 'folder');
      setColor(project.color || COLORS[0]);
      setIconUrl(project.icon_url || null);
    }
  }, [project]);

  const togglePlatform = (platform) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setIconUrl(file_url);
    } catch (error) {
      console.error('Failed to upload icon:', error);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await base44.entities.Project.update(project.id, { 
        name,
        platforms, 
        icon: iconUrl ? null : icon, 
        color, 
        icon_url: iconUrl 
      });
      onUpdated?.();
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div>
            <Label className="mb-2 block">Project Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>

          <div>
            <Label className="mb-3 block">Project Icon</Label>
            
            {/* Custom Upload */}
            <div className="mb-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="icon-upload"
                disabled={uploading}
              />
              <label
                htmlFor="icon-upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400 cursor-pointer transition-colors bg-gray-50 hover:bg-indigo-50"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Upload Custom Icon'}
                </span>
              </label>
              
              {iconUrl && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg">
                  <img src={iconUrl} alt="Custom icon" className="w-6 h-6 rounded object-cover" />
                  <span className="text-sm text-indigo-700">Custom icon uploaded</span>
                  <button
                    type="button"
                    onClick={() => setIconUrl(null)}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Default Icons */}
            {!iconUrl && (
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map(({ name, Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setIcon(name)}
                    className={`
                      w-12 h-12 rounded-lg flex items-center justify-center transition-all
                      ${icon === name 
                        ? 'ring-2 ring-offset-1 ring-indigo-500 bg-indigo-50' 
                        : 'bg-gray-50 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${icon === name ? 'text-indigo-600' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label className="mb-3 block">Project Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`
                    w-10 h-10 rounded-lg transition-all
                    ${color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}
                  `}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !name.trim()}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}