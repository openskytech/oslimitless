import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SubscriptionDialog({ open, onClose, subscription, accounts, workspaceId, onSaved }) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('0');
  const [frequency, setFrequency] = useState('monthly');
  const [status, setStatus] = useState('active');
  const [accountId, setAccountId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [renewalDate, setRenewalDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setProvider(subscription.provider || '');
      setAmount(subscription.amount.toString());
      setFrequency(subscription.frequency);
      setStatus(subscription.status);
      setAccountId(subscription.account_id);
      setStartDate(subscription.start_date);
      setRenewalDate(subscription.renewal_date);
    } else {
      setName('');
      setProvider('');
      setAmount('0');
      setFrequency('monthly');
      setStatus('active');
      setAccountId(accounts[0]?.id || '');
      setStartDate(new Date().toISOString().split('T')[0]);
      setRenewalDate(new Date().toISOString().split('T')[0]);
    }
  }, [subscription, open, accounts]);

  const handleSave = async () => {
    if (!name.trim() || !accountId) return;
    setLoading(true);
    try {
      if (subscription) {
        await base44.entities.Subscription.update(subscription.id, {
          name,
          provider,
          amount: parseFloat(amount),
          frequency,
          status,
          account_id: accountId,
          start_date: startDate,
          renewal_date: renewalDate
        });
      } else {
        await base44.entities.Subscription.create({
          workspace_id: workspaceId,
          name,
          provider,
          amount: parseFloat(amount),
          frequency,
          status,
          account_id: accountId,
          start_date: startDate,
          renewal_date: renewalDate
        });
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save subscription:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subscription ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Service Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Slack"
            />
          </div>

          <div>
            <Label>Provider</Label>
            <Input 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)} 
              placeholder="Service provider"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                step="0.01"
              />
            </div>

            <div>
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>

            <div>
              <Label>Renewal Date</Label>
              <Input 
                type="date" 
                value={renewalDate} 
                onChange={(e) => setRenewalDate(e.target.value)} 
              />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{subscription ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}