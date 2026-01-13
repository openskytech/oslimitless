import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';

const cardTypeColors = {
  debit: 'bg-blue-100 text-blue-700',
  credit: 'bg-purple-100 text-purple-700',
  virtual: 'bg-indigo-100 text-indigo-700'
};

export default function CompanyCardCard({ card }) {
  const isExpiringSoon = () => {
    if (!card.expiry_date) return false;
    const [month, year] = card.expiry_date.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate < threeMonthsFromNow;
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${!card.is_active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{card.card_name}</CardTitle>
              <p className="text-sm text-gray-500">{card.issuer}</p>
            </div>
          </div>
          <Badge className={cardTypeColors[card.card_type]}>
            {card.card_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Card Number</span>
          <span className="font-mono">•••• {card.last_four}</span>
        </div>

        {card.card_holder && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cardholder</span>
            <span>{card.card_holder}</span>
          </div>
        )}

        {card.expiry_date && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Expires</span>
            <span className={isExpiringSoon() ? 'text-red-600 font-medium' : ''}>
              {card.expiry_date}
            </span>
          </div>
        )}

        {card.credit_limit && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Credit Limit</span>
            <span>${card.credit_limit.toLocaleString('en-US')}</span>
          </div>
        )}

        {card.current_balance > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Balance</span>
            <span className="text-lg font-bold text-red-600">
              ${card.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {!card.is_active && (
          <Badge variant="outline" className="text-xs">Inactive</Badge>
        )}
        {isExpiringSoon() && card.is_active && (
          <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Expiring Soon</Badge>
        )}
      </CardContent>
    </Card>
  );
}