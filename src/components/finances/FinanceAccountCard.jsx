import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, DollarSign } from 'lucide-react';

const accountTypeColors = {
  checking: 'bg-blue-100 text-blue-700',
  savings: 'bg-green-100 text-green-700',
  credit: 'bg-purple-100 text-purple-700',
  investment: 'bg-amber-100 text-amber-700',
  paypal: 'bg-indigo-100 text-indigo-700',
  stripe: 'bg-violet-100 text-violet-700',
  other: 'bg-gray-100 text-gray-700'
};

export default function FinanceAccountCard({ account }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{account.account_name}</CardTitle>
              <p className="text-sm text-gray-500">{account.institution}</p>
            </div>
          </div>
          <Badge className={accountTypeColors[account.account_type]}>
            {account.account_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Balance</span>
          <span className="text-xl font-bold text-emerald-600">
            ${account.current_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </span>
        </div>
        {account.account_number && (
          <div className="text-xs text-gray-500">
            •••• {account.account_number}
          </div>
        )}
        {!account.is_active && (
          <Badge variant="outline" className="text-xs">Inactive</Badge>
        )}
      </CardContent>
    </Card>
  );
}