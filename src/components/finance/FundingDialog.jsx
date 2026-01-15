import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FundingDialog({ open, onClose, funding, accounts, workspaceId, onSaved }) {
  const [source, setSource] = useState('');
  const [type, setType] = useState('loan');
  const [amount, setAmount] = useState('0');
  const [accountId, setAccountId] = useState('');
  const [dateReceived, setDateReceived] = useState(new Date().toISOString().split('T')[0]);
  const [interestRate, setInterestRate] = useState('0');
  const [termMonths, setTermMonths] = useState('12');
  const [repaymentStart, setRepaymentStart] = useState('');
  const [monthlyRepayment, setMonthlyRepayment] = useState('0');
  const [totalRepaid, setTotalRepaid] = useState('0');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (funding) {
      setSource(funding.source);
      setType(funding.type);
      setAmount(funding.amount.toString());
      setAccountId(funding.account_id);
      setDateReceived(funding.date_received);
      setInterestRate(funding.interest_rate?.toString() || '0');
      setTermMonths(funding.term_months?.toString() || '12');
      setRepaymentStart(funding.repayment_start || '');
      setMonthlyRepayment(funding.monthly_repayment?.toString() || '0');
      setTotalRepaid(funding.total_repaid?.toString() || '0');
      setStatus(funding.status);
      setNotes(funding.notes || '');
    } else {
      setSource('');
      setType('loan');
      setAmount('0');
      setAccountId(accounts[0]?.id || '');
      setDateReceived(new Date().toISOString().split('T')[0]);
      setInterestRate('0');
      setTermMonths('12');
      setRepaymentStart('');
      setMonthlyRepayment('0');
      setTotalRepaid('0');
      setStatus('active');
      setNotes('');
    }
  }, [funding, open, accounts]);

  const handleSave = async () => {
    if (!source.trim() || !accountId) return;
    setLoading(true);
    try {
      const data = {
        source,
        type,
        amount: parseFloat(amount),
        account_id: accountId,
        date_received: dateReceived,
        status,
        notes
      };

      if (type === 'loan') {
        data.interest_rate = parseFloat(interestRate) || null;
        data.term_months = parseInt(termMonths) || null;
        data.repayment_start = repaymentStart || null;
        data.monthly_repayment = parseFloat(monthlyRepayment) || null;
        data.total_repaid = parseFloat(totalRepaid) || 0;
      }

      if (funding) {
        await base44.entities.ExternalFunding.update(funding.id, data);
      } else {
        await base44.entities.ExternalFunding.create({
          workspace_id: workspaceId,
          ...data
        });
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save funding:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{funding ? 'Edit Funding' : 'Add Funding'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Source</Label>
            <Input 
              value={source} 
              onChange={(e) => setSource(e.target.value)} 
              placeholder="e.g., SBA Loan, Venture Capital"
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
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="grant">Grant</SelectItem>
                  <SelectItem value="donation">Donation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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

          <div className="grid grid-cols-2 gap-4">
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
              <Label>Date Received</Label>
              <Input 
                type="date" 
                value={dateReceived} 
                onChange={(e) => setDateReceived(e.target.value)} 
              />
            </div>
          </div>

          {type === 'loan' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Interest Rate (%)</Label>
                  <Input 
                    type="number" 
                    value={interestRate} 
                    onChange={(e) => setInterestRate(e.target.value)} 
                    step="0.01"
                  />
                </div>

                <div>
                  <Label>Term (Months)</Label>
                  <Input 
                    type="number" 
                    value={termMonths} 
                    onChange={(e) => setTermMonths(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Repayment Start</Label>
                  <Input 
                    type="date" 
                    value={repaymentStart} 
                    onChange={(e) => setRepaymentStart(e.target.value)} 
                  />
                </div>

                <div>
                  <Label>Monthly Repayment</Label>
                  <Input 
                    type="number" 
                    value={monthlyRepayment} 
                    onChange={(e) => setMonthlyRepayment(e.target.value)} 
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <Label>Total Repaid</Label>
                <Input 
                  type="number" 
                  value={totalRepaid} 
                  onChange={(e) => setTotalRepaid(e.target.value)} 
                  step="0.01"
                />
              </div>
            </>
          )}

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Terms & Notes</Label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Terms, conditions, and notes about this funding"
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{funding ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}