import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import FundingDialog from './FundingDialog';

export default function FundingTab({ funding, accounts, workspaceId, onUpdated }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFunding, setEditingFunding] = useState(null);

  const getAccountName = (id) => accounts.find(a => a.id === id)?.name || 'Unknown';

  const statusColors = {
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    defaulted: 'bg-red-100 text-red-800'
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this funding entry?')) {
      await base44.entities.ExternalFunding.delete(id);
      onUpdated();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">External Funding</h3>
        <Button onClick={() => { setEditingFunding(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Funding
        </Button>
      </div>

      <div className="space-y-3">
        {funding.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No funding entries</p>
        ) : (
          funding.map(fund => {
            const repaymentProgress = fund.monthly_repayment ? (fund.total_repaid / (fund.monthly_repayment * fund.term_months)) * 100 : 0;
            return (
              <Card key={fund.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={statusColors[fund.status]}>
                          {fund.status}
                        </Badge>
                        <p className="font-semibold text-gray-900">{fund.source}</p>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Type: <span className="capitalize">{fund.type}</span></p>
                        <p>Account: {getAccountName(fund.account_id)}</p>
                        <p>Received: {format(new Date(fund.date_received), 'MMM dd, yyyy')}</p>
                        {fund.term_months && (
                          <p>Term: {fund.term_months} months | Monthly: ${(fund.monthly_repayment || 0).toFixed(2)}</p>
                        )}
                        {fund.interest_rate && (
                          <p>Interest Rate: {fund.interest_rate}%</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-2xl font-bold text-gray-900">${(fund.amount).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>

                  {fund.monthly_repayment && (
                    <div className="mb-4 pt-4 border-t">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Repayment Progress</span>
                        <span className="font-semibold">${(fund.total_repaid || 0).toFixed(2)} / ${(fund.monthly_repayment * fund.term_months).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(repaymentProgress, 100)}%` }}></div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => { setEditingFunding(fund); setDialogOpen(true); }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(fund.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <FundingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        funding={editingFunding}
        accounts={accounts}
        workspaceId={workspaceId}
        onSaved={onUpdated}
      />
    </div>
  );
}