import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const categoryColors = {
  income: 'bg-green-100 text-green-700',
  salary: 'bg-emerald-100 text-emerald-700',
  subscription: 'bg-purple-100 text-purple-700',
  software: 'bg-blue-100 text-blue-700',
  hardware: 'bg-gray-100 text-gray-700',
  marketing: 'bg-pink-100 text-pink-700',
  travel: 'bg-amber-100 text-amber-700',
  office: 'bg-indigo-100 text-indigo-700',
  taxes: 'bg-red-100 text-red-700',
  other: 'bg-slate-100 text-slate-700'
};

export default function TransactionList({ transactions, accounts }) {
  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.account_name || 'General';
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.map(transaction => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.amount >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.amount >= 0 ? (
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{transaction.description}</h4>
                      <Badge className={categoryColors[transaction.category]}>
                        {transaction.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(transaction.transaction_date), 'MMM d, yyyy')}
                      </span>
                      {transaction.account_id && (
                        <span>{getAccountName(transaction.account_id)}</span>
                      )}
                      {transaction.payment_method && (
                        <span>{transaction.payment_method}</span>
                      )}
                    </div>
                    {transaction.notes && (
                      <p className="text-sm text-gray-600 mt-1">{transaction.notes}</p>
                    )}
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No transactions yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}