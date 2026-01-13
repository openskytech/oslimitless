import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import FundingDialog from './FundingDialog';

export default function FundingTab({ workspaceId }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFunding, setEditingFunding] = useState(null);
  const queryClient = useQueryClient();

  const { data: funding = [] } = useQuery({
    queryKey: ['funding', workspaceId],
    queryFn: () => base44.entities.Funding.filter({ workspace_id: workspaceId }, '-date')
  });

  const typeColors = {
    'seed': 'bg-green-100 text-green-700',
    'series-a': 'bg-blue-100 text-blue-700',
    'series-b': 'bg-purple-100 text-purple-700',
    'series-c': 'bg-pink-100 text-pink-700',
    'grant': 'bg-orange-100 text-orange-700',
    'loan': 'bg-red-100 text-red-700',
    'personal': 'bg-gray-100 text-gray-700',
    'other': 'bg-indigo-100 text-indigo-700'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    received: 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700'
  };

  const totalFunding = funding.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Funding & Investments</h2>
          <p className="text-sm text-gray-500">Total raised: ${totalFunding.toLocaleString()}</p>
        </div>
        <Button onClick={() => { setEditingFunding(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Funding
        </Button>
      </div>

      {funding.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No funding tracked yet. Add funding rounds and investor information.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {funding.map(fund => (
            <Card key={fund.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setEditingFunding(fund); setDialogOpen(true); }}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{fund.funding_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[fund.funding_type]}`}>
                        {fund.funding_type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[fund.status]}`}>
                        {fund.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="text-2xl font-bold text-gray-900">${fund.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {format(new Date(fund.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {fund.investor_name && (
                        <div>
                          <p className="text-sm text-gray-500">Investor</p>
                          <p className="text-lg font-semibold text-gray-900">{fund.investor_name}</p>
                        </div>
                      )}
                      {fund.equity_percentage && (
                        <div>
                          <p className="text-sm text-gray-500">Equity</p>
                          <p className="text-lg font-semibold text-gray-900">{fund.equity_percentage}%</p>
                        </div>
                      )}
                    </div>

                    {fund.terms && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-500 mb-1">Terms</p>
                        <p className="text-sm text-gray-700">{fund.terms}</p>
                      </div>
                    )}

                    {fund.notes && (
                      <p className="text-sm text-gray-600">{fund.notes}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FundingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        funding={editingFunding}
        workspaceId={workspaceId}
        onSaved={() => {
          queryClient.invalidateQueries(['funding']);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}