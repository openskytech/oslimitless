import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import TransactionDialog from './TransactionDialog';

export default function TransactionsTab({ transactions, accounts, workspaceId, onUpdated }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const getAccountName = (id) => accounts.find(a => a.id === id)?.name || 'Unknown';

  const typeColors = {
    income: 'bg-green-100 text-green-800',
    expense: 'bg-red-100 text-red-800',
    transfer: 'bg-blue-100 text-blue-800',
    subscription: 'bg-purple-100 text-purple-800',
    payment: 'bg-orange-100 text-orange-800',
    owner_funding: 'bg-cyan-100 text-cyan-800'
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this transaction?')) {
      await base44.entities.Transaction.delete(id);
      onUpdated();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Button onClick={() => { setEditingTransaction(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Transaction
        </Button>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No transactions yet</p>
        ) : (
          transactions.map(transaction => (
            <Card key={transaction.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={typeColors[transaction.type]}>
                      {transaction.type}
                    </Badge>
                    <p className="font-semibold text-gray-900">{transaction.description}</p>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{getAccountName(transaction.account_id)}</p>
                    <p>{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                    {transaction.category && <p className="text-gray-500">{transaction.category}</p>}
                  </div>
                </div>
                <div className="text-right mr-4">
                  <p className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDelete(transaction.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <TransactionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        transaction={editingTransaction}
        accounts={accounts}
        workspaceId={workspaceId}
        onSaved={onUpdated}
      />
    </div>
  );
}