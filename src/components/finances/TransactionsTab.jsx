import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowDown, ArrowUp, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import TransactionDialog from './TransactionDialog';

export default function TransactionsTab({ workspaceId }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', workspaceId],
    queryFn: () => base44.entities.Transaction.filter({ workspace_id: workspaceId }, '-date', 100)
  });

  const getCategoryColor = (category) => {
    const colors = {
      income: 'text-green-600 bg-green-50',
      expense: 'text-red-600 bg-red-50',
      transfer: 'text-blue-600 bg-blue-50',
      refund: 'text-purple-600 bg-purple-50'
    };
    return colors[category] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
        <Button onClick={() => { setEditingTransaction(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Transaction
        </Button>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet. Add your first transaction to track expenses and income.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => { setEditingTransaction(transaction); setDialogOpen(true); }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
                        {transaction.amount > 0 ? (
                          <ArrowUp className="w-5 h-5" />
                        ) : (
                          <ArrowDown className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                          {transaction.vendor && (
                            <>
                              <span>•</span>
                              <span>{transaction.vendor}</span>
                            </>
                          )}
                          {transaction.subcategory && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{transaction.subcategory}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                        {transaction.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <TransactionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        transaction={editingTransaction}
        workspaceId={workspaceId}
        onSaved={() => {
          queryClient.invalidateQueries(['transactions']);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}