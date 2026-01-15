import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import SubscriptionDialog from './SubscriptionDialog';

export default function SubscriptionsTab({ subscriptions, accounts, workspaceId, onUpdated }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);

  const getAccountName = (id) => accounts.find(a => a.id === id)?.name || 'Unknown';

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this subscription?')) {
      await base44.entities.Subscription.delete(id);
      onUpdated();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Subscriptions</h3>
        <Button onClick={() => { setEditingSubscription(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Subscription
        </Button>
      </div>

      <div className="space-y-3">
        {subscriptions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No subscriptions</p>
        ) : (
          subscriptions.map(sub => (
            <Card key={sub.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={statusColors[sub.status]}>
                      {sub.status}
                    </Badge>
                    <p className="font-semibold text-gray-900">{sub.name}</p>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{sub.provider}</p>
                    <p>{getAccountName(sub.account_id)}</p>
                    <p>Renewal: {format(new Date(sub.renewal_date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <p className="text-xl font-bold text-gray-900">${(sub.amount).toFixed(2)}</p>
                  <p className="text-sm text-gray-600 capitalize">{sub.frequency}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDelete(sub.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <SubscriptionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        subscription={editingSubscription}
        accounts={accounts}
        workspaceId={workspaceId}
        onSaved={onUpdated}
      />
    </div>
  );
}