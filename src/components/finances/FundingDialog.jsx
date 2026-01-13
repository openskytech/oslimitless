import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function FundingDialog({ open, onClose, funding, workspaceId, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    funding_name: '',
    funding_type: 'seed',
    amount: 0,
    date: getLocalDateString(),
    investor_name: '',
    investor_contact: '',
    equity_percentage: 0,
    terms: '',
    status: 'received',
    notes: ''
  });

  useEffect(() => {
    if (funding) {
      setFormData(funding);
    } else {
      setFormData({
        funding_name: '',
        funding_type: 'seed',
        amount: 0,
        date: getLocalDateString(),
        investor_name: '',
        investor_contact: '',
        equity_percentage: 0,
        terms: '',
        status: 'received',
        notes: ''
      });
    }
  }, [funding]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (funding) {
        await base44.entities.Funding.update(funding.id, formData);
      } else {
        await base44.entities.Funding.create({ ...formData, workspace_id: workspaceId });
      }
      onSaved();
    } catch (error) {
      console.error('Failed to save funding:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{funding ? 'Edit Funding' : 'Add Funding'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Funding Name/Round</Label>
            <Input
              value={formData.funding_name}
              onChange={(e) => setFormData({ ...formData, funding_name: e.target.value })}
              placeholder="Seed Round 2024"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Funding Type</Label>
              <Select value={formData.funding_type} onValueChange={(value) => setFormData({ ...formData, funding_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="series-a">Series A</SelectItem>
                  <SelectItem value="series-b">Series B</SelectItem>
                  <SelectItem value="series-c">Series C</SelectItem>
                  <SelectItem value="grant">Grant</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Investor/Source Name</Label>
            <Input
              value={formData.investor_name}
              onChange={(e) => setFormData({ ...formData, investor_name: e.target.value })}
              placeholder="Acme Ventures"
            />
          </div>

          <div>
            <Label>Investor Contact</Label>
            <Input
              value={formData.investor_contact}
              onChange={(e) => setFormData({ ...formData, investor_contact: e.target.value })}
              placeholder="contact@acmeventures.com"
            />
          </div>

          <div>
            <Label>Equity Percentage (optional)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.equity_percentage}
              onChange={(e) => setFormData({ ...formData, equity_percentage: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label>Terms & Conditions</Label>
            <Textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              placeholder="Key terms of the funding agreement..."
              className="min-h-[80px]"
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !formData.funding_name}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}