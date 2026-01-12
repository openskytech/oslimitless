import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, Save, Trash2, MessageSquare, Send, Calendar, Link2, 
  AlertTriangle, CheckCircle2, User, Crown, ExternalLink 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import PlatformBadge from '@/components/ui/PlatformBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import ReactMarkdown from 'react-markdown';

const PLATFORMS = ['web', 'ios', 'android', 'api', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CARD_COLORS = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

export default function TaskDetailSheet({ 
  task, 
  project, 
  members, 
  currentUser,
  open, 
  onClose, 
  onUpdate,
  canEdit = true 
}) {
  const [editedTask, setEditedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setIsEditing(false);
    }
  }, [task]);

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', task?.id],
    queryFn: () => base44.entities.Comment.filter({ task_id: task.id }, '-created_date'),
    enabled: !!task?.id
  });

  const handleSave = async () => {
    if (!editedTask) return;
    try {
      await base44.entities.Task.update(task.id, editedTask);
      onUpdate?.();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await base44.entities.Task.delete(task.id);
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await base44.entities.Comment.create({
        task_id: task.id,
        author_email: currentUser.email,
        author_name: currentUser.full_name || currentUser.email,
        content: newComment
      });
      await base44.entities.Task.update(task.id, {
        comment_count: (task.comment_count || 0) + 1
      });
      setNewComment('');
      queryClient.invalidateQueries(['comments', task.id]);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const togglePlatform = (platform) => {
    const platforms = editedTask.platforms || [];
    if (platforms.includes(platform)) {
      setEditedTask({ ...editedTask, platforms: platforms.filter(p => p !== platform) });
    } else {
      setEditedTask({ ...editedTask, platforms: [...platforms, platform] });
    }
  };

  const toggleAssignee = (email) => {
    const assignees = editedTask.assignees || [];
    if (assignees.includes(email)) {
      setEditedTask({ ...editedTask, assignees: assignees.filter(a => a !== email) });
    } else {
      setEditedTask({ ...editedTask, assignees: [...assignees, email] });
    }
  };

  if (!task || !editedTask) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-xl font-bold"
                />
              ) : (
                <SheetTitle className="text-xl">{task.title}</SheetTitle>
              )}
            </div>
          </div>
          
          {/* Status & Priority Row */}
          <div className="flex items-center gap-3 pt-2">
            <Badge variant="outline" className="capitalize">{task.status}</Badge>
            <PriorityBadge priority={task.priority} showLabel />
            {task.is_ceo_question && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                <Crown className="w-3 h-3 mr-1" /> CEO Question
              </Badge>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-6">
            {/* Platforms */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(platform => (
                  <button
                    key={platform}
                    onClick={() => isEditing && togglePlatform(platform)}
                    disabled={!isEditing}
                    className={`transition-all ${
                      (editedTask.platforms || []).includes(platform) 
                        ? 'ring-2 ring-offset-1 ring-indigo-500' 
                        : 'opacity-50'
                    } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <PlatformBadge platform={platform} size="md" />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Description</Label>
              {isEditing ? (
                <Textarea
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  placeholder="Add a description (markdown supported)..."
                  className="min-h-[100px]"
                />
              ) : (
                <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 rounded-lg p-3">
                  {task.description ? (
                    <ReactMarkdown>{task.description}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-400 italic">No description</p>
                  )}
                </div>
              )}
            </div>

            {/* Assignees */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Assignees</Label>
              <div className="flex flex-wrap gap-2">
                {members.map(member => {
                  const isAssigned = (editedTask.assignees || []).includes(member.user_email);
                  return (
                    <button
                      key={member.user_email}
                      onClick={() => isEditing && toggleAssignee(member.user_email)}
                      disabled={!isEditing}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all
                        ${isAssigned 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                        }
                        ${!isEditing ? 'cursor-default' : 'cursor-pointer hover:border-indigo-300'}
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
            </div>

            {/* Due Date & Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Due Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedTask.due_date || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-600">
                    {task.due_date ? format(new Date(task.due_date), 'PPP') : 'Not set'}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Priority</Label>
                {isEditing ? (
                  <Select
                    value={editedTask.priority}
                    onValueChange={(v) => setEditedTask({ ...editedTask, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(p => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <PriorityBadge priority={task.priority} showLabel />
                )}
              </div>
            </div>

            {/* Card Color */}
            {isEditing && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Card Color</Label>
                <div className="flex gap-2">
                  {CARD_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditedTask({ ...editedTask, card_color: color })}
                      className={`
                        w-8 h-8 rounded-lg transition-all
                        ${color === 'yellow' ? 'bg-yellow-200' : ''}
                        ${color === 'pink' ? 'bg-pink-200' : ''}
                        ${color === 'blue' ? 'bg-blue-200' : ''}
                        ${color === 'green' ? 'bg-green-200' : ''}
                        ${color === 'purple' ? 'bg-purple-200' : ''}
                        ${color === 'orange' ? 'bg-orange-200' : ''}
                        ${editedTask.card_color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}
                      `}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* GitHub Links */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 block">GitHub Links</Label>
              {isEditing ? (
                <>
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Issue URL"
                      value={editedTask.github_issue_url || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, github_issue_url: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="PR URL"
                      value={editedTask.github_pr_url || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, github_pr_url: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {task.github_issue_url && (
                    <a 
                      href={task.github_issue_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" /> Issue
                    </a>
                  )}
                  {task.github_pr_url && (
                    <a 
                      href={task.github_pr_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" /> Pull Request
                    </a>
                  )}
                  {!task.github_issue_url && !task.github_pr_url && (
                    <p className="text-gray-400 text-sm">No links</p>
                  )}
                </div>
              )}
            </div>

            {/* CEO Question Toggle */}
            {isEditing && (
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-amber-800">Mark as Question for CEO</span>
                </div>
                <Switch
                  checked={editedTask.is_ceo_question}
                  onCheckedChange={(v) => setEditedTask({ ...editedTask, is_ceo_question: v })}
                />
              </div>
            )}

            <Separator />

            {/* Comments */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments ({comments.length})
              </Label>
              
              <div className="space-y-3 mb-4">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {(comment.author_name || comment.author_email)[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{comment.author_name}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-600 pl-8">
                      <ReactMarkdown>{comment.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">No comments yet</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button onClick={handleAddComment} size="icon" className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions Footer */}
        {canEdit && (
          <div className="pt-4 border-t flex justify-between">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Task</Button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}