import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

export default function FundingDialog({ open, onClose, workspaceId, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    funding_type: 'other',
    investor_name: '',
    amount: 0,
    funding_date: new Date().toISOString().split('T')[0],
    equity_percentage: 0,
    valuation: 0,
    terms: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    documents_url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.investor_name || !formData.amount) return;

    setLoading(true);
    try {
      await base44.entities.Funding.create({
        workspace_id: workspaceId,
        ...formData
      });
      onCreated();
      setFormData({
        funding_type: 'other',
        investor_name: '',
        amount: 0,
        funding_date: new Date().toISOString().split('T')[0],
        equity_percentage: 0,
        valuation: 0,
        terms: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        notes: '',
        documents_url: ''
      });
    } catch (error) {
      console.error('Failed to create funding:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Funding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <SelectItem value="loan">Loan</SelectItem>
                <SelectItem value="grant">Grant</SelectItem>
                <SelectItem value="angel">Angel</SelectItem>
                <SelectItem value="venture">Venture Capital</SelectItem>
                <SelectItem value="bootstrap">Bootstrap</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Investor/Lender Name *</Label>
            <Input
              value={formData.investor_name}
              onChange={(e) => setFormData({ ...formData, investor_name: e.target.value })}
              placeholder="Acme Ventures"
            />
          </div>

          <div>
            <Label>Amount *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="1000000"
            />
          </div>

          <div>
            <Label>Funding Date *</Label>
            <Input
              type="date"
              value={formData.funding_date}
              onChange={(e) => setFormData({ ...formData, funding_date: e.target.value })}
            />
          </div>

          <div>
            <Label>Equity Percentage (Optional)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.equity_percentage}
              onChange={(e) => setFormData({ ...formData, equity_percentage: parseFloat(e.target.value) || 0 })}
              placeholder="10"
            />
          </div>

          <div>
            <Label>Company Valuation (Optional)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.valuation}
              onChange={(e) => setFormData({ ...formData, valuation: parseFloat(e.target.value) || 0 })}
              placeholder="10000000"
            />
          </div>

          <div>
            <Label>Key Terms</Label>
            <Textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              placeholder="Key terms and conditions..."
              className="h-20"
            />
          </div>

          <div>
            <Label>Contact Name</Label>
            <Input
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <Label>Contact Email</Label>
            <Input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="jane@acmeventures.com"
            />
          </div>

          <div>
            <Label>Contact Phone</Label>
            <Input
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label>Documents URL</Label>
            <Input
              value={formData.documents_url}
              onChange={(e) => setFormData({ ...formData, documents_url: e.target.value })}
              placeholder="Link to contracts/documents"
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              className="h-20"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !formData.investor_name || !formData.amount}>
              {loading ? 'Adding...' : 'Add Funding'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}