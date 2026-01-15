import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AccountDialog({ open, onClose, account, workspaceId, onSaved }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('business');
  const [balance, setBalance] = useState('0');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setBalance(account.balance?.toString() || '0');
      setCurrency(account.currency);
    } else {
      setName('');
      setType('business');
      setBalance('0');
      setCurrency('USD');
    }
  }, [account, open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (account) {
        await base44.entities.Account.update(account.id, { 
          name, 
          type, 
          balance: parseFloat(balance), 
          currency 
        });
      } else {
        await base44.entities.Account.create({ 
          workspace_id: workspaceId, 
          name, 
          type, 
          balance: parseFloat(balance), 
          currency 
        });
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save account:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Add Account'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Account Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Business Checking"
            />
          </div>

          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="operating">Operating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Balance</Label>
              <Input 
                type="number" 
                value={balance} 
                onChange={(e) => setBalance(e.target.value)} 
                step="0.01"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Input 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)} 
                placeholder="USD"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{account ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}