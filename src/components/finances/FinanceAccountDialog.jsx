import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';

export default function FinanceAccountDialog({ open, onClose, workspaceId, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_name: '',
    account_type: 'checking',
    institution: '',
    account_number: '',
    current_balance: 0,
    currency: 'USD',
    notes: '',
    is_active: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.account_name) return;

    setLoading(true);
    try {
      await base44.entities.FinanceAccount.create({
        workspace_id: workspaceId,
        ...formData
      });
      onCreated();
      setFormData({
        account_name: '',
        account_type: 'checking',
        institution: '',
        account_number: '',
        current_balance: 0,
        currency: 'USD',
        notes: '',
        is_active: true
      });
    } catch (error) {
      console.error('Failed to create account:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Account Name *</Label>
            <Input
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              placeholder="Business Checking"
            />
          </div>

          <div>
            <Label>Account Type</Label>
            <Select value={formData.account_type} onValueChange={(value) => setFormData({ ...formData, account_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Institution</Label>
            <Input
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="Bank of America"
            />
          </div>

          <div>
            <Label>Account Number (Last 4 digits)</Label>
            <Input
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              placeholder="1234"
              maxLength={4}
            />
          </div>

          <div>
            <Label>Current Balance</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.current_balance}
              onChange={(e) => setFormData({ ...formData, current_balance: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional information..."
              className="h-20"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !formData.account_name}>
              {loading ? 'Adding...' : 'Add Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}