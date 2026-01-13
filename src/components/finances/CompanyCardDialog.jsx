import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';

export default function CompanyCardDialog({ open, onClose, workspaceId, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    card_name: '',
    card_type: 'credit',
    last_four: '',
    card_holder: '',
    expiry_date: '',
    issuer: '',
    credit_limit: 0,
    current_balance: 0,
    notes: '',
    is_active: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.card_name || !formData.last_four) return;

    setLoading(true);
    try {
      await base44.entities.CompanyCard.create({
        workspace_id: workspaceId,
        ...formData
      });
      onCreated();
      setFormData({
        card_name: '',
        card_type: 'credit',
        last_four: '',
        card_holder: '',
        expiry_date: '',
        issuer: '',
        credit_limit: 0,
        current_balance: 0,
        notes: '',
        is_active: true
      });
    } catch (error) {
      console.error('Failed to create card:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Company Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Card Name *</Label>
            <Input
              value={formData.card_name}
              onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
              placeholder="Company Amex"
            />
          </div>

          <div>
            <Label>Card Type</Label>
            <Select value={formData.card_type} onValueChange={(value) => setFormData({ ...formData, card_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Last 4 Digits *</Label>
            <Input
              value={formData.last_four}
              onChange={(e) => setFormData({ ...formData, last_four: e.target.value })}
              placeholder="1234"
              maxLength={4}
            />
          </div>

          <div>
            <Label>Cardholder Name</Label>
            <Input
              value={formData.card_holder}
              onChange={(e) => setFormData({ ...formData, card_holder: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label>Expiry Date (MM/YY)</Label>
            <Input
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              placeholder="12/25"
              maxLength={5}
            />
          </div>

          <div>
            <Label>Issuer</Label>
            <Input
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              placeholder="Chase, Amex, Capital One"
            />
          </div>

          <div>
            <Label>Credit Limit</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.credit_limit}
              onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label>Current Balance/Debt</Label>
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
            <Button type="submit" disabled={loading || !formData.card_name || !formData.last_four}>
              {loading ? 'Adding...' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}