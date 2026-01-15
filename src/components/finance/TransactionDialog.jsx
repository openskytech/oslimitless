import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TransactionDialog({ open, onClose, transaction, accounts, workspaceId, onSaved }) {
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('0');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setType(transaction.type);
      setAmount(Math.abs(transaction.amount).toString());
      setAccountId(transaction.account_id);
      setCategory(transaction.category || '');
      setDate(transaction.date);
    } else {
      setDescription('');
      setType('expense');
      setAmount('0');
      setAccountId(accounts[0]?.id || '');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transaction, open, accounts]);

  const handleSave = async () => {
    if (!description.trim() || !accountId) return;
    setLoading(true);
    try {
      if (transaction) {
        await base44.entities.Transaction.update(transaction.id, {
          description,
          type,
          amount: parseFloat(amount),
          account_id: accountId,
          category,
          date
        });
      } else {
        await base44.entities.Transaction.create({
          workspace_id: workspaceId,
          description,
          type,
          amount: parseFloat(amount),
          account_id: accountId,
          category,
          date
        });
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Description</Label>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Transaction description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                step="0.01"
              />
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

          <div>
            <Label>Category</Label>
            <Input 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              placeholder="e.g., Software, Office Supplies"
            />
          </div>

          <div>
            <Label>Date</Label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{transaction ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}