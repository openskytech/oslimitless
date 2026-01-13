import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';

export default function CardDialog({ open, onClose, card, workspaceId, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    card_name: '',
    card_type: 'credit',
    last_four: '',
    cardholder_name: '',
    expiration_date: '',
    bank_name: '',
    credit_limit: 0,
    full_card_number: '',
    cvv: '',
    billing_address: '',
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    if (card) {
      setFormData(card);
    } else {
      setFormData({
        card_name: '',
        card_type: 'credit',
        last_four: '',
        cardholder_name: '',
        expiration_date: '',
        bank_name: '',
        credit_limit: 0,
        full_card_number: '',
        cvv: '',
        billing_address: '',
        is_active: true,
        notes: ''
      });
    }
  }, [card]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (card) {
        await base44.entities.CompanyCard.update(card.id, formData);
      } else {
        await base44.entities.CompanyCard.create({ ...formData, workspace_id: workspaceId });
      }
      onSaved();
    } catch (error) {
      console.error('Failed to save card:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{card ? 'Edit Card' : 'Add Card'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Card Nickname</Label>
            <Input
              value={formData.card_name}
              onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
              placeholder="Primary Business Card"
            />
          </div>

          <div>
            <Label>Card Type</Label>
            <Select value={formData.card_type} onValueChange={(value) => setFormData({ ...formData, card_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cardholder Name</Label>
              <Input
                value={formData.cardholder_name}
                onChange={(e) => setFormData({ ...formData, cardholder_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Bank Name</Label>
              <Input
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Chase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Card Number</Label>
              <Input
                value={formData.full_card_number}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    full_card_number: value,
                    last_four: value.slice(-4)
                  });
                }}
                placeholder="1234567890123456"
                maxLength={16}
              />
            </div>
            <div>
              <Label>CVV</Label>
              <Input
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Expiration (MM/YY)</Label>
              <Input
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                placeholder="12/25"
                maxLength={5}
              />
            </div>
            <div>
              <Label>Credit Limit</Label>
              <Input
                type="number"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <Label>Billing Address</Label>
            <Textarea
              value={formData.billing_address}
              onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
              placeholder="123 Main St, City, State ZIP"
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
            <Label>Active Card</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !formData.card_name}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}