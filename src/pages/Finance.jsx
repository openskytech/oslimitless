import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import AccountsTab from '@/components/finance/AccountsTab';
import TransactionsTab from '@/components/finance/TransactionsTab';
import SubscriptionsTab from '@/components/finance/SubscriptionsTab';
import FundingTab from '@/components/finance/FundingTab';

export default function Finance() {
  const [user, setUser] = React.useState(null);
  const [selectedTab, setSelectedTab] = useState('accounts');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Get user's workspace
  const { data: memberships = [] } = useQuery({
    queryKey: ['memberships', user?.email],
    queryFn: () => base44.entities.WorkspaceMember.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const workspaceId = memberships[0]?.workspace_id;

  // Get accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', workspaceId],
    queryFn: () => base44.entities.Account.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId
  });

  // Get transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', workspaceId],
    queryFn: () => base44.entities.Transaction.filter({ workspace_id: workspaceId }, '-date', 50),
    enabled: !!workspaceId
  });

  // Get subscriptions
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', workspaceId],
    queryFn: () => base44.entities.Subscription.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId
  });

  // Get external funding
  const { data: funding = [] } = useQuery({
    queryKey: ['funding', workspaceId],
    queryFn: () => base44.entities.ExternalFunding.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId
  });

  // Check if user is mo@openskytechnologies.com
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (user.email !== 'mo@openskytechnologies.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Finance page is not accessible to this account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const monthlySubscriptions = subscriptions
    .filter(s => s.status === 'active' && s.frequency === 'monthly')
    .reduce((sum, s) => sum + (s.amount || 0), 0);
  const activeFunding = funding.filter(f => f.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
          <p className="text-gray-600">Manage accounts, transactions, subscriptions, and funding</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Balance</p>
                  <p className="text-3xl font-bold text-gray-900">${totalBalance.toFixed(2)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Subscriptions</p>
                  <p className="text-3xl font-bold text-gray-900">${monthlySubscriptions.toFixed(2)}</p>
                </div>
                <CreditCard className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Funding</p>
                  <p className="text-3xl font-bold text-gray-900">{activeFunding.length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full justify-start border-b bg-gray-50 rounded-none">
              <TabsTrigger value="accounts" className="rounded-none">Accounts</TabsTrigger>
              <TabsTrigger value="transactions" className="rounded-none">Transactions</TabsTrigger>
              <TabsTrigger value="subscriptions" className="rounded-none">Subscriptions</TabsTrigger>
              <TabsTrigger value="funding" className="rounded-none">Funding</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="p-6">
              <AccountsTab 
                accounts={accounts} 
                workspaceId={workspaceId}
                onUpdated={() => queryClient.invalidateQueries(['accounts'])}
              />
            </TabsContent>

            <TabsContent value="transactions" className="p-6">
              <TransactionsTab 
                transactions={transactions} 
                accounts={accounts}
                workspaceId={workspaceId}
                onUpdated={() => {
                  queryClient.invalidateQueries(['transactions']);
                  queryClient.invalidateQueries(['accounts']);
                }}
              />
            </TabsContent>

            <TabsContent value="subscriptions" className="p-6">
              <SubscriptionsTab 
                subscriptions={subscriptions}
                accounts={accounts}
                workspaceId={workspaceId}
                onUpdated={() => queryClient.invalidateQueries(['subscriptions'])}
              />
            </TabsContent>

            <TabsContent value="funding" className="p-6">
              <FundingTab 
                funding={funding}
                accounts={accounts}
                workspaceId={workspaceId}
                onUpdated={() => {
                  queryClient.invalidateQueries(['funding']);
                  queryClient.invalidateQueries(['accounts']);
                }}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}