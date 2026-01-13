import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, CreditCard, Calendar, TrendingUp, 
  Plus, AlertCircle, Building, Receipt
} from 'lucide-react';
import FinanceAccountCard from '@/components/finances/FinanceAccountCard';
import FinanceAccountDialog from '@/components/finances/FinanceAccountDialog';
import TransactionDialog from '@/components/finances/TransactionDialog';
import SubscriptionCard from '@/components/finances/SubscriptionCard';
import SubscriptionDialog from '@/components/finances/SubscriptionDialog';
import CompanyCardCard from '@/components/finances/CompanyCardCard';
import CompanyCardDialog from '@/components/finances/CompanyCardDialog';
import FundingCard from '@/components/finances/FundingCard';
import FundingDialog from '@/components/finances/FundingDialog';
import TransactionList from '@/components/finances/TransactionList';

export default function Finances() {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [fundingDialogOpen, setFundingDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    
    const memberships = await base44.entities.WorkspaceMember.filter({ user_email: currentUser.email });
    if (memberships.length > 0) {
      setMembership(memberships[0]);
      const workspaces = await base44.entities.Workspace.filter({ id: memberships[0].workspace_id });
      if (workspaces.length > 0) {
        setWorkspace(workspaces[0]);
      }
    }
  };

  const { data: accounts = [] } = useQuery({
    queryKey: ['financeAccounts', workspace?.id],
    queryFn: () => base44.entities.FinanceAccount.filter({ workspace_id: workspace.id }),
    enabled: !!workspace?.id
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', workspace?.id],
    queryFn: () => base44.entities.Transaction.filter({ workspace_id: workspace.id }, '-transaction_date', 50),
    enabled: !!workspace?.id
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', workspace?.id],
    queryFn: () => base44.entities.Subscription.filter({ workspace_id: workspace.id }),
    enabled: !!workspace?.id
  });

  const { data: cards = [] } = useQuery({
    queryKey: ['companyCards', workspace?.id],
    queryFn: () => base44.entities.CompanyCard.filter({ workspace_id: workspace.id }),
    enabled: !!workspace?.id
  });

  const { data: funding = [] } = useQuery({
    queryKey: ['funding', workspace?.id],
    queryFn: () => base44.entities.Funding.filter({ workspace_id: workspace.id }, '-funding_date'),
    enabled: !!workspace?.id
  });

  const hasAccess = membership?.role === 'ceo';

  if (!user || !workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading finances...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
            <p className="text-gray-600">Only the CEO can access the Finances section.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
  const totalDebt = cards.reduce((sum, card) => sum + (card.current_balance || 0), 0);
  const monthlySubscriptions = subscriptions
    .filter(s => s.is_active && s.billing_cycle === 'monthly')
    .reduce((sum, s) => sum + s.amount, 0);
  const totalFunding = funding.reduce((sum, f) => sum + (f.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
          <p className="text-gray-600">Manage accounts, transactions, and business finances</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Balance</CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Debt</CardTitle>
              <CreditCard className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Subscriptions</CardTitle>
              <Calendar className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${monthlySubscriptions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Funding</CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ${totalFunding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Bank Accounts</h2>
              <Button onClick={() => setAccountDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Account
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map(account => (
                <FinanceAccountCard 
                  key={account.id} 
                  account={account}
                  onUpdated={() => queryClient.invalidateQueries(['financeAccounts'])}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Recent Transactions</h2>
              <Button onClick={() => setTransactionDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Transaction
              </Button>
            </div>
            <TransactionList 
              transactions={transactions} 
              accounts={accounts}
              onUpdated={() => queryClient.invalidateQueries(['transactions'])}
            />
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Company Cards</h2>
              <Button onClick={() => setCardDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Card
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map(card => (
                <CompanyCardCard 
                  key={card.id} 
                  card={card}
                  onUpdated={() => queryClient.invalidateQueries(['companyCards'])}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Subscriptions</h2>
              <Button onClick={() => setSubscriptionDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Subscription
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions.map(sub => (
                <SubscriptionCard 
                  key={sub.id} 
                  subscription={sub}
                  onUpdated={() => queryClient.invalidateQueries(['subscriptions'])}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="funding" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Funding Rounds</h2>
              <Button onClick={() => setFundingDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Funding
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {funding.map(fund => (
                <FundingCard 
                  key={fund.id} 
                  funding={fund}
                  onUpdated={() => queryClient.invalidateQueries(['funding'])}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <FinanceAccountDialog
        open={accountDialogOpen}
        onClose={() => setAccountDialogOpen(false)}
        workspaceId={workspace?.id}
        onCreated={() => {
          queryClient.invalidateQueries(['financeAccounts']);
          setAccountDialogOpen(false);
        }}
      />

      <TransactionDialog
        open={transactionDialogOpen}
        onClose={() => setTransactionDialogOpen(false)}
        workspaceId={workspace?.id}
        accounts={accounts}
        onCreated={() => {
          queryClient.invalidateQueries(['transactions']);
          setTransactionDialogOpen(false);
        }}
      />

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
        workspaceId={workspace?.id}
        onCreated={() => {
          queryClient.invalidateQueries(['subscriptions']);
          setSubscriptionDialogOpen(false);
        }}
      />

      <CompanyCardDialog
        open={cardDialogOpen}
        onClose={() => setCardDialogOpen(false)}
        workspaceId={workspace?.id}
        onCreated={() => {
          queryClient.invalidateQueries(['companyCards']);
          setCardDialogOpen(false);
        }}
      />

      <FundingDialog
        open={fundingDialogOpen}
        onClose={() => setFundingDialogOpen(false)}
        workspaceId={workspace?.id}
        onCreated={() => {
          queryClient.invalidateQueries(['funding']);
          setFundingDialogOpen(false);
        }}
      />
    </div>
  );
}