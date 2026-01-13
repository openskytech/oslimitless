import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';

export default function AccountDialog({ open, onClose, account, workspaceId, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_name: '',
    account_type: 'checking',
    bank_name: '',
    account_number: '',
    routing_number: '',
    current_balance: 0,
    currency: 'USD',
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    if (account) {
      setFormData(account);
    } else {
      setFormData({
        account_name: '',
        account_type: 'checking',
        bank_name: '',
        account_number: '',
        routing_number: '',
        current_balance: 0,
        currency: 'USD',
        is_active: true,
        notes: ''
      });
    }
  }, [account]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (account) {
        await base44.entities.FinancialAccount.update(account.id, formData);
      } else {
        await base44.entities.FinancialAccount.create({ ...formData, workspace_id: workspaceId });
      }
      onSaved();
    } catch (error) {
      console.error('Failed to save account:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Add Account'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Account Name</Label>
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
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Bank/Institution Name</Label>
            <Input
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              placeholder="Chase Bank"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Last 4 Digits</Label>
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
                value={formData.current_balance}
                onChange={(e) => setFormData({ ...formData, current_balance: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <Label>Routing Number (optional)</Label>
            <Input
              value={formData.routing_number}
              onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
              placeholder="123456789"
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Active Account</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !formData.account_name}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}