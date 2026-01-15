import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function FinanceAccountDialog({ open, onClose, workspace }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [balance, setBalance] = useState('0');
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await base44.entities.FinanceAccount.create({
        workspace_id: workspace.id,
        name,
        type,
        current_balance: parseFloat(balance) || 0
      });
      queryClient.invalidateQueries({ queryKey: ['financeAccounts'] });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName('');
    setType('checking');
    setBalance('0');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-2 block">Account Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Found Business Checking"
            />
          </div>
          <div>
            <Label className="mb-2 block">Account Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Business Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="tax">Tax Account</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Current Balance</Label>
            <Input
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}