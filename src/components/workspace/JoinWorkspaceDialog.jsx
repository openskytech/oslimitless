import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JoinWorkspaceDialog({ open, onClose, currentUser, onJoined }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    try {
      // Find the invite code
      const inviteCodes = await base44.entities.InviteCode.filter({ 
        code: code.toUpperCase().replace(/\s/g, ''),
        is_active: true 
      });

      if (inviteCodes.length === 0) {
        setError('Invalid invite code');
        setLoading(false);
        return;
      }

      const inviteCode = inviteCodes[0];

      // Check expiration
      if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
        setError('This invite code has expired');
        setLoading(false);
        return;
      }

      // Check max uses
      if (inviteCode.max_uses && inviteCode.use_count >= inviteCode.max_uses) {
        setError('This invite code has reached its usage limit');
        setLoading(false);
        return;
      }

      // Check if already a member
      const existingMembers = await base44.entities.WorkspaceMember.filter({
        workspace_id: inviteCode.workspace_id,
        user_email: currentUser.email
      });

      if (existingMembers.length > 0) {
        setError('You are already a member of this workspace');
        setLoading(false);
        return;
      }

      // Get workspace info
      const workspaces = await base44.entities.Workspace.filter({ id: inviteCode.workspace_id });
      if (workspaces.length === 0) {
        setError('Workspace not found');
        setLoading(false);
        return;
      }

      // Add member
      await base44.entities.WorkspaceMember.create({
        workspace_id: inviteCode.workspace_id,
        user_email: currentUser.email,
        user_name: currentUser.full_name || currentUser.email,
        role: inviteCode.default_role
      });

      // Update use count
      await base44.entities.InviteCode.update(inviteCode.id, {
        use_count: (inviteCode.use_count || 0) + 1
      });

      setSuccess(workspaces[0]);
      onJoined?.(workspaces[0]);
    } catch (error) {
      console.error('Failed to join workspace:', error);
      setError('Failed to join workspace. Please try again.');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setCode('');
    setError('');
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-600" />
            Join a Workspace
          </DialogTitle>
          <DialogDescription>
            Enter an invite code to join an existing team
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome!</h3>
              <p className="text-gray-500">
                You've joined <span className="font-semibold text-indigo-600">{success.name}</span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              <Input
                placeholder="Enter invite code (e.g., ABCD1234)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="text-center text-xl font-mono tracking-widest h-14"
                maxLength={8}
              />
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-600 mt-3 justify-center"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          {success ? (
            <Button onClick={() => {
              handleClose();
              window.location.reload();
            }} className="w-full">
              Let's Go!
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleJoin} disabled={loading || !code.trim()}>
                {loading ? 'Joining...' : 'Join Workspace'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}