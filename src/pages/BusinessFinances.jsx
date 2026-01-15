import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import FinanceAccountDialog from '@/components/finances/FinanceAccountDialog';
import FinanceTransactionDialog from '@/components/finances/FinanceTransactionDialog';
import FinanceTransactionTable from '@/components/finances/FinanceTransactionTable';

export default function BusinessFinances() {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const memberships = await base44.entities.WorkspaceMember.filter({ 
        user_email: currentUser.email 
      });
      if (memberships.length > 0) {
        const workspaces = await base44.entities.Workspace.filter({ 
          id: memberships[0].workspace_id 
        });
        if (workspaces.length > 0) {
          setWorkspace(workspaces[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const { data: accounts = [] } = useQuery({
    queryKey: ['financeAccounts', workspace?.id],
    queryFn: () => base44.entities.FinanceAccount.filter({ 
      workspace_id: workspace.id 
    }),
    enabled: !!workspace?.id
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['financeTransactions', workspace?.id],
    queryFn: () => base44.entities.FinanceTransaction.filter({ 
      workspace_id: workspace.id 
    }, '-date'),
    enabled: !!workspace?.id
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalTaxWriteoffs = transactions
    .filter(t => t.is_tax_writeoff)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const subscriptions = transactions.filter(t => t.is_recurring && t.type === 'expense');
  const monthlySubscriptionCost = subscriptions
    .filter(t => t.recurring_interval === 'monthly')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (!user || !workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading finances...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Business Finances</h1>
          <Button
            onClick={() => setTransactionDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">${totalBalance.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">${totalIncome.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">${totalExpenses.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
                <PiggyBank className="w-4 h-4" />
                Tax Write-offs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">${totalTaxWriteoffs.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          </TabsList>

          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Bank Accounts</CardTitle>
                <Button
                  onClick={() => setAccountDialogOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Account
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accounts.length === 0 ? (
                    <p className="text-slate-500 col-span-full">No accounts added yet</p>
                  ) : (
                    accounts.map(account => (
                      <Card key={account.id} className="border border-slate-200">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-slate-900">{account.name}</h3>
                              <p className="text-xs text-slate-500 capitalize">{account.type}</p>
                            </div>
                            <span className="text-xl font-bold text-indigo-600">
                              ${account.current_balance?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Recurring Subscriptions</CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  Monthly cost: ${monthlySubscriptionCost.toFixed(2)}
                </p>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <p className="text-slate-500">No subscriptions added yet</p>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{sub.description}</p>
                          <p className="text-xs text-slate-500 capitalize">{sub.recurring_interval}</p>
                        </div>
                        <p className="font-semibold text-slate-900">${sub.amount?.toFixed(2) || '0.00'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-slate-500">No transactions yet</p>
                ) : (
                  <FinanceTransactionTable transactions={transactions} accounts={accounts} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <FinanceAccountDialog 
        open={accountDialogOpen} 
        onClose={() => setAccountDialogOpen(false)}
        workspace={workspace}
      />
      <FinanceTransactionDialog
        open={transactionDialogOpen}
        onClose={() => setTransactionDialogOpen(false)}
        workspace={workspace}
        accounts={accounts}
      />
    </div>
  );
}