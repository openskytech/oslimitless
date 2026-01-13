import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import SubscriptionDialog from './SubscriptionDialog';

export default function SubscriptionsTab({ workspaceId }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const queryClient = useQueryClient();

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', workspaceId],
    queryFn: () => base44.entities.Subscription.filter({ workspace_id: workspaceId })
  });

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    trial: 'bg-blue-100 text-blue-700'
  };

  const categoryColors = {
    software: 'bg-purple-100 text-purple-700',
    hosting: 'bg-indigo-100 text-indigo-700',
    marketing: 'bg-pink-100 text-pink-700',
    tools: 'bg-orange-100 text-orange-700',
    services: 'bg-teal-100 text-teal-700',
    other: 'bg-gray-100 text-gray-700'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
        <Button onClick={() => { setEditingSubscription(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Subscription
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No subscriptions yet. Track your recurring payments here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map(sub => (
            <Card key={sub.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setEditingSubscription(sub); setDialogOpen(true); }}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{sub.service_name}</h3>
                    {sub.description && <p className="text-sm text-gray-500 mt-1">{sub.description}</p>}
                  </div>
                  {sub.url && (
                    <a href={sub.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-gray-600">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900">${sub.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 capitalize">per {sub.billing_frequency}</p>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[sub.status]}`}>
                    {sub.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[sub.category]}`}>
                    {sub.category}
                  </span>
                </div>

                {sub.next_billing_date && (
                  <p className="text-sm text-gray-500">
                    Next billing: {format(new Date(sub.next_billing_date), 'MMM d, yyyy')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SubscriptionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        subscription={editingSubscription}
        workspaceId={workspaceId}
        onSaved={() => {
          queryClient.invalidateQueries(['subscriptions']);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}