import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Shield } from 'lucide-react';

export default function AccessManagement({ open, onClose, workspaceId }) {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserLevel, setNewUserLevel] = useState('view');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: accessList = [] } = useQuery({
    queryKey: ['financeAccess', workspaceId],
    queryFn: () => base44.entities.FinanceAccess.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId && open
  });

  const { data: members = [] } = useQuery({
    queryKey: ['workspaceMembers', workspaceId],
    queryFn: () => base44.entities.WorkspaceMember.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId && open
  });

  const grantAccessMutation = useMutation({
    mutationFn: async () => {
      const member = members.find(m => m.user_email === newUserEmail);
      return base44.entities.FinanceAccess.create({
        workspace_id: workspaceId,
        user_email: newUserEmail,
        user_name: member?.user_name || newUserEmail,
        access_level: newUserLevel,
        granted_by: currentUser.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['financeAccess']);
      setNewUserEmail('');
      setNewUserLevel('view');
    }
  });

  const revokeAccessMutation = useMutation({
    mutationFn: (accessId) => base44.entities.FinanceAccess.delete(accessId),
    onSuccess: () => {
      queryClient.invalidateQueries(['financeAccess']);
    }
  });

  const handleGrantAccess = () => {
    if (newUserEmail && members.some(m => m.user_email === newUserEmail)) {
      grantAccessMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Financial Access</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>Grant Access to Team Member</Label>
            <div className="flex gap-2">
              <Select value={newUserEmail} onValueChange={setNewUserEmail}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter(m => m.role !== 'ceo' && !accessList.some(a => a.user_email === m.user_email))
                    .map(member => (
                      <SelectItem key={member.id} value={member.user_email}>
                        {member.user_name} ({member.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select value={newUserLevel} onValueChange={setNewUserLevel}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGrantAccess} disabled={!newUserEmail}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Users with Access</Label>
            {accessList.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center">
                  <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No additional users have access</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {accessList.map(access => (
                  <Card key={access.id}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{access.user_name}</p>
                          <p className="text-sm text-gray-500">{access.user_email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            access.access_level === 'edit' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {access.access_level}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeAccessMutation.mutate(access.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}