import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import AccountDialog from './AccountDialog';

export default function AccountsTab({ accounts, workspaceId, onUpdated }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const handleDelete = async (id) => {
    if (confirm('Delete this account?')) {
      await base44.entities.Account.delete(id);
      onUpdated();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Accounts</h3>
        <Button onClick={() => { setEditingAccount(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map(account => (
          <Card key={account.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{account.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{account.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${(account.balance || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-600">{account.currency}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => { setEditingAccount(account); setDialogOpen(true); }}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(account.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AccountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        account={editingAccount}
        workspaceId={workspaceId}
        onSaved={onUpdated}
      />
    </div>
  );
}