import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Mail, Phone, FileText } from 'lucide-react';
import { format } from 'date-fns';

const fundingTypeColors = {
  seed: 'bg-green-100 text-green-700',
  'series-a': 'bg-blue-100 text-blue-700',
  'series-b': 'bg-indigo-100 text-indigo-700',
  'series-c': 'bg-purple-100 text-purple-700',
  loan: 'bg-amber-100 text-amber-700',
  grant: 'bg-emerald-100 text-emerald-700',
  angel: 'bg-pink-100 text-pink-700',
  venture: 'bg-violet-100 text-violet-700',
  bootstrap: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700'
};

export default function FundingCard({ funding }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{funding.investor_name}</CardTitle>
              <p className="text-sm text-gray-500">
                {format(new Date(funding.funding_date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <Badge className={fundingTypeColors[funding.funding_type]}>
            {funding.funding_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Amount</span>
          <span className="text-xl font-bold text-purple-600">
            ${funding.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {funding.equity_percentage && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Equity</span>
            <span className="font-medium">{funding.equity_percentage}%</span>
          </div>
        )}

        {funding.valuation && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Valuation</span>
            <span className="font-medium">${funding.valuation.toLocaleString('en-US')}</span>
          </div>
        )}

        {funding.contact_name && (
          <div className="pt-2 border-t space-y-2">
            <div className="text-sm font-medium text-gray-700">{funding.contact_name}</div>
            {funding.contact_email && (
              <a href={`mailto:${funding.contact_email}`} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {funding.contact_email}
              </a>
            )}
            {funding.contact_phone && (
              <a href={`tel:${funding.contact_phone}`} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {funding.contact_phone}
              </a>
            )}
          </div>
        )}

        {funding.terms && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {funding.terms}
          </div>
        )}

        {funding.documents_url && (
          <a 
            href={funding.documents_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            View documents
          </a>
        )}
      </CardContent>
    </Card>
  );
}