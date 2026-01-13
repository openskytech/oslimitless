import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, TrendingUp, CreditCard, Calendar, 
  Plus, Users, Lock, Receipt, Landmark
} from 'lucide-react';
import AccountsTab from '@/components/finances/AccountsTab';
import TransactionsTab from '@/components/finances/TransactionsTab';
import SubscriptionsTab from '@/components/finances/SubscriptionsTab';
import CardsTab from '@/components/finances/CardsTab';
import FundingTab from '@/components/finances/FundingTab';
import AccessManagement from '@/components/finances/AccessManagement';

export default function Finances() {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showAccessDialog, setShowAccessDialog] = useState(false);

  useEffect(() => {
    loadUserAndAccess();
  }, []);

  const loadUserAndAccess = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);

    const memberships = await base44.entities.WorkspaceMember.filter({ user_email: currentUser.email });
    if (memberships.length > 0) {
      setMembership(memberships[0]);
      const workspaces = await base44.entities.Workspace.filter({ id: memberships[0].workspace_id });
      if (workspaces.length > 0) {
        setWorkspace(workspaces[0]);
        
        // Check access: CEO always has access, others need explicit permission
        if (memberships[0].role === 'ceo') {
          setHasAccess(true);
        } else {
          const access = await base44.entities.FinanceAccess.filter({
            workspace_id: memberships[0].workspace_id,
            user_email: currentUser.email
          });
          setHasAccess(access.length > 0);
        }
      }
    }
  };

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', workspace?.id],
    queryFn: () => base44.entities.FinancialAccount.filter({ workspace_id: workspace.id }),
    enabled: !!workspace?.id && hasAccess
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', workspace?.id],
    queryFn: () => base44.entities.Transaction.filter({ workspace_id: workspace.id }, '-date', 100),
    enabled: !!workspace?.id && hasAccess
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', workspace?.id],
    queryFn: () => base44.entities.Subscription.filter({ workspace_id: workspace.id }),
    enabled: !!workspace?.id && hasAccess
  });

  if (!user || !workspace) {
    return <div className="p-6">Loading...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600">
              You don't have permission to view financial information. Contact your CEO for access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const monthlySubscriptionCost = activeSubscriptions
    .filter(s => s.billing_frequency === 'monthly')
    .reduce((sum, s) => sum + s.amount, 0);

  const recentExpenses = transactions
    .filter(t => t.category === 'expense')
    .slice(0, 5)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-gray-500">Manage your business finances securely</p>
          </div>
          {membership?.role === 'ceo' && (
            <Button onClick={() => setShowAccessDialog(true)} variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Manage Access
            </Button>
          )}
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalBalance.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{activeSubscriptions.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monthly Recurring</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${monthlySubscriptionCost.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts">
            <AccountsTab workspaceId={workspace.id} />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab workspaceId={workspace.id} />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionsTab workspaceId={workspace.id} />
          </TabsContent>

          <TabsContent value="cards">
            <CardsTab workspaceId={workspace.id} />
          </TabsContent>

          <TabsContent value="funding">
            <FundingTab workspaceId={workspace.id} />
          </TabsContent>
        </Tabs>
      </div>

      <AccessManagement
        open={showAccessDialog}
        onClose={() => setShowAccessDialog(false)}
        workspaceId={workspace.id}
      />
    </div>
  );
}