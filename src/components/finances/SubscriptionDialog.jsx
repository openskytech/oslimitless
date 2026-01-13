import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';

export default function SubscriptionDialog({ open, onClose, workspaceId, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    amount: 0,
    billing_cycle: 'monthly',
    next_billing_date: '',
    payment_method: '',
    category: 'software',
    url: '',
    is_active: true,
    auto_renew: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.service_name || !formData.amount) return;

    setLoading(true);
    try {
      await base44.entities.Subscription.create({
        workspace_id: workspaceId,
        ...formData
      });
      onCreated();
      setFormData({
        service_name: '',
        description: '',
        amount: 0,
        billing_cycle: 'monthly',
        next_billing_date: '',
        payment_method: '',
        category: 'software',
        url: '',
        is_active: true,
        auto_renew: true
      });
    } catch (error) {
      console.error('Failed to create subscription:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Service Name *</Label>
            <Input
              value={formData.service_name}
              onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              placeholder="GitHub Pro"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this service used for?"
              className="h-20"
            />
          </div>

          <div>
            <Label>Amount *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="9.99"
            />
          </div>

          <div>
            <Label>Billing Cycle</Label>
            <Select value={formData.billing_cycle} onValueChange={(value) => setFormData({ ...formData, billing_cycle: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Next Billing Date</Label>
            <Input
              type="date"
              value={formData.next_billing_date}
              onChange={(e) => setFormData({ ...formData, next_billing_date: e.target.value })}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="hosting">Hosting</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Payment Method</Label>
            <Input
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              placeholder="Company Amex ••1234"
            />
          </div>

          <div>
            <Label>Service URL</Label>
            <Input
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://github.com"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Auto-Renew</Label>
            <Switch
              checked={formData.auto_renew}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_renew: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !formData.service_name}>
              {loading ? 'Adding...' : 'Add Subscription'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}