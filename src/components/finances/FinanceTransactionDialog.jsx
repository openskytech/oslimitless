import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function FinanceTransactionDialog({ open, onClose, workspace, accounts }) {
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState('monthly');
  const [isTaxWriteoff, setIsTaxWriteoff] = useState(false);
  const [taxCategory, setTaxCategory] = useState('');
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!description.trim() || !amount || !accountId) return;
    setLoading(true);
    try {
      await base44.entities.FinanceTransaction.create({
        workspace_id: workspace.id,
        account_id: accountId,
        category,
        description,
        amount: parseFloat(amount),
        type,
        date,
        is_recurring: isRecurring,
        recurring_interval: isRecurring ? recurringInterval : undefined,
        is_tax_writeoff: isTaxWriteoff,
        tax_category: isTaxWriteoff ? taxCategory : undefined
      });
      queryClient.invalidateQueries({ queryKey: ['financeTransactions'] });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setAccountId('');
    setCategory('expense');
    setDescription('');
    setAmount('');
    setType('expense');
    setDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
    setRecurringInterval('monthly');
    setIsTaxWriteoff(false);
    setTaxCategory('');
  };

  if (accounts.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">Please create a bank account first.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-2 block">Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="funding">Funding</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="tax_writeoff">Tax Write-off</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="fee">Fee</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., AWS Subscription"
            />
          </div>

          <div>
            <Label className="mb-2 block">Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label className="mb-2 block">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label>Recurring Subscription</Label>
          </div>

          {isRecurring && (
            <div>
              <Label className="mb-2 block">Recurring Interval</Label>
              <Select value={recurringInterval} onValueChange={setRecurringInterval}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isTaxWriteoff}
              onCheckedChange={setIsTaxWriteoff}
            />
            <Label>Tax Write-off</Label>
          </div>

          {isTaxWriteoff && (
            <div>
              <Label className="mb-2 block">Tax Category</Label>
              <Input
                value={taxCategory}
                onChange={(e) => setTaxCategory(e.target.value)}
                placeholder="e.g., Software, Travel, Office Supplies"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleCreate} 
            disabled={loading || !description.trim() || !amount || !accountId}
          >
            {loading ? 'Creating...' : 'Add Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}