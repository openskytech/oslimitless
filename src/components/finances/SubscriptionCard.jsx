import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';

const categoryColors = {
  software: 'bg-blue-100 text-blue-700',
  hosting: 'bg-purple-100 text-purple-700',
  marketing: 'bg-pink-100 text-pink-700',
  design: 'bg-amber-100 text-amber-700',
  productivity: 'bg-green-100 text-green-700',
  communication: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-700'
};

const billingCycleLabels = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  'one-time': 'One-time'
};

export default function SubscriptionCard({ subscription }) {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${!subscription.is_active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{subscription.service_name}</CardTitle>
            {subscription.description && (
              <p className="text-sm text-gray-500 mt-1">{subscription.description}</p>
            )}
          </div>
          <Badge className={categoryColors[subscription.category]}>
            {subscription.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Cost</span>
          <span className="text-lg font-bold text-indigo-600">
            ${subscription.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className="text-xs text-gray-500 ml-1">/ {subscription.billing_cycle}</span>
          </span>
        </div>
        
        {subscription.next_billing_date && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Next billing
            </span>
            <span className="font-medium">
              {format(new Date(subscription.next_billing_date), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {subscription.payment_method && (
          <div className="text-xs text-gray-500">
            Payment: {subscription.payment_method}
          </div>
        )}

        {subscription.url && (
          <a 
            href={subscription.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            <LinkIcon className="w-3 h-3" />
            Visit service
          </a>
        )}

        <div className="flex gap-2">
          {!subscription.is_active && (
            <Badge variant="outline" className="text-xs">Inactive</Badge>
          )}
          {!subscription.auto_renew && subscription.is_active && (
            <Badge variant="outline" className="text-xs bg-yellow-50">No auto-renew</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}