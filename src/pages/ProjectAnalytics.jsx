import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  ArrowLeft, Download, Users, ShoppingCart, DollarSign, 
  Plus, TrendingUp, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import PlatformBadge from '@/components/ui/PlatformBadge';
import { format, subDays } from 'date-fns';

export default function ProjectAnalytics() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('projectId');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [addDataOpen, setAddDataOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [newData, setNewData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    platform: 'web',
    downloads: 0,
    active_users: 0,
    purchases: 0,
    revenue: 0
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['analytics', projectId],
    queryFn: () => base44.entities.ProjectAnalytics.filter({ project_id: projectId }, '-date'),
    enabled: !!projectId
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', project?.workspace_id],
    queryFn: () => base44.entities.WorkspaceMember.filter({ workspace_id: project.workspace_id }),
    enabled: !!project?.workspace_id
  });

  const currentMembership = members.find(m => m.user_email === currentUser?.email);
  const userRole = currentMembership?.role || 'viewer';
  const canManage = ['ceo', 'manager'].includes(userRole);

  // Filter by platform
  const filteredAnalytics = selectedPlatform === 'all' 
    ? analytics 
    : analytics.filter(a => a.platform === selectedPlatform);

  // Calculate totals
  const totals = filteredAnalytics.reduce((acc, a) => ({
    downloads: acc.downloads + (a.downloads || 0),
    active_users: acc.active_users + (a.active_users || 0),
    purchases: acc.purchases + (a.purchases || 0),
    revenue: acc.revenue + (a.revenue || 0)
  }), { downloads: 0, active_users: 0, purchases: 0, revenue: 0 });

  // Prepare chart data
  const chartData = filteredAnalytics
    .slice(0, 30)
    .reverse()
    .map(a => ({
      date: format(new Date(a.date), 'MMM d'),
      downloads: a.downloads || 0,
      active_users: a.active_users || 0,
      purchases: a.purchases || 0,
      revenue: a.revenue || 0
    }));

  const handleAddData = async () => {
    await base44.entities.ProjectAnalytics.create({
      project_id: projectId,
      workspace_id: project.workspace_id,
      ...newData
    });
    queryClient.invalidateQueries(['analytics']);
    setAddDataOpen(false);
    setNewData({
      date: format(new Date(), 'yyyy-MM-dd'),
      platform: 'web',
      downloads: 0,
      active_users: 0,
      purchases: 0,
      revenue: 0
    });
  };

  if (!project || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('ProjectDetail') + `?id=${projectId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-xl text-gray-900">{project.name} - Analytics</h1>
                <p className="text-sm text-gray-500">Track your post-launch metrics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {project.platforms?.map(p => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {canManage && (
                <Button onClick={() => setAddDataOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Data
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnalyticsCard
            title="Total Downloads"
            value={totals.downloads.toLocaleString()}
            icon={Download}
            color="indigo"
            trend="up"
            trendValue="+12% this week"
          />
          <AnalyticsCard
            title="Active Users"
            value={totals.active_users.toLocaleString()}
            icon={Users}
            color="green"
            trend="up"
            trendValue="+5% this week"
          />
          <AnalyticsCard
            title="Purchases"
            value={totals.purchases.toLocaleString()}
            icon={ShoppingCart}
            color="orange"
          />
          <AnalyticsCard
            title="Revenue"
            value={`$${totals.revenue.toLocaleString()}`}
            icon={DollarSign}
            color="pink"
            trend="up"
            trendValue="+8% this week"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnalyticsChart
            title="Downloads & Active Users"
            data={chartData}
            dataKeys={['downloads', 'active_users']}
            type="area"
          />
          <AnalyticsChart
            title="Revenue & Purchases"
            data={chartData}
            dataKeys={['revenue', 'purchases']}
            type="bar"
          />
        </div>

        {/* Platform Breakdown */}
        {selectedPlatform === 'all' && project.platforms?.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.platforms.map(platform => {
                  const platformData = analytics.filter(a => a.platform === platform);
                  const platformTotals = platformData.reduce((acc, a) => ({
                    downloads: acc.downloads + (a.downloads || 0),
                    revenue: acc.revenue + (a.revenue || 0)
                  }), { downloads: 0, revenue: 0 });

                  return (
                    <div key={platform} className="p-4 bg-gray-50 rounded-xl">
                      <PlatformBadge platform={platform} size="md" />
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-gray-500">Downloads: <span className="font-semibold text-gray-900">{platformTotals.downloads.toLocaleString()}</span></p>
                        <p className="text-sm text-gray-500">Revenue: <span className="font-semibold text-gray-900">${platformTotals.revenue.toLocaleString()}</span></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {analytics.length === 0 && (
          <div className="text-center py-16">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No analytics data yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your post-launch metrics</p>
            {canManage && (
              <Button onClick={() => setAddDataOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Data
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Data Dialog */}
      <Dialog open={addDataOpen} onOpenChange={setAddDataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Analytics Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newData.date}
                  onChange={(e) => setNewData({ ...newData, date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Platform</Label>
                <Select
                  value={newData.platform}
                  onValueChange={(v) => setNewData({ ...newData, platform: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {project.platforms?.map(p => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Downloads</Label>
                <Input
                  type="number"
                  value={newData.downloads}
                  onChange={(e) => setNewData({ ...newData, downloads: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Active Users</Label>
                <Input
                  type="number"
                  value={newData.active_users}
                  onChange={(e) => setNewData({ ...newData, active_users: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Purchases</Label>
                <Input
                  type="number"
                  value={newData.purchases}
                  onChange={(e) => setNewData({ ...newData, purchases: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Revenue ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newData.revenue}
                  onChange={(e) => setNewData({ ...newData, revenue: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDataOpen(false)}>Cancel</Button>
            <Button onClick={handleAddData}>Save Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}