import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Landmark, TrendingUp, TrendingDown } from 'lucide-react';
import AccountDialog from './AccountDialog';

export default function AccountsTab({ workspaceId }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', workspaceId],
    queryFn: () => base44.entities.FinancialAccount.filter({ workspace_id: workspaceId })
  });

  const accountTypeColors = {
    checking: 'bg-blue-100 text-blue-700',
    savings: 'bg-green-100 text-green-700',
    business: 'bg-purple-100 text-purple-700',
    paypal: 'bg-indigo-100 text-indigo-700',
    stripe: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-700'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Financial Accounts</h2>
        <Button onClick={() => { setEditingAccount(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Landmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No accounts yet. Add your first account to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map(account => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{account.account_name}</h3>
                    <p className="text-sm text-gray-500">{account.bank_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${accountTypeColors[account.account_type]}`}>
                    {account.account_type}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-bold text-gray-900">
                    ${(account.current_balance || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{account.currency}</p>
                </div>

                {account.account_number && (
                  <p className="text-sm text-gray-500 mb-4">
                    ••••{account.account_number}
                  </p>
                )}

                {account.notes && (
                  <p className="text-sm text-gray-600 mb-4">{account.notes}</p>
                )}

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${account.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => { setEditingAccount(account); setDialogOpen(true); }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AccountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        account={editingAccount}
        workspaceId={workspaceId}
        onSaved={() => {
          queryClient.invalidateQueries(['accounts']);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}