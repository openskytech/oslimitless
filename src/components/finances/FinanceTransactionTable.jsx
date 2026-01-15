import React from 'react';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, Tag } from 'lucide-react';

export default function FinanceTransactionTable({ transactions, accounts }) {
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a.name]));

  const categoryColors = {
    subscription: 'text-blue-600 bg-blue-50',
    funding: 'text-green-600 bg-green-50',
    expense: 'text-red-600 bg-red-50',
    tax_writeoff: 'text-purple-600 bg-purple-50',
    transfer: 'text-gray-600 bg-gray-50',
    fee: 'text-orange-600 bg-orange-50',
    other: 'text-slate-600 bg-slate-50'
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Description</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Category</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Account</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-900">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => {
            const isIncome = transaction.type === 'income';
            const colors = categoryColors[transaction.category] || categoryColors.other;
            return (
              <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-600">
                  {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-slate-900">{transaction.description}</p>
                    {transaction.is_recurring && (
                      <p className="text-xs text-slate-500 capitalize">
                        Recurring {transaction.recurring_interval}
                      </p>
                    )}
                    {transaction.is_tax_writeoff && (
                      <p className="text-xs text-purple-600">Tax deductible</p>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${colors}`}>
                    {transaction.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 text-sm">
                  {accountMap[transaction.account_id]}
                </td>
                <td className={`py-3 px-4 text-right font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'}${transaction.amount?.toFixed(2) || '0.00'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}